import { chromium } from "@playwright/test";
import { createServer } from "vite";
import assert from "node:assert/strict";
const server = await createServer({
  server: { host: "127.0.0.1", port: 5173 },
});
await server.listen();
const browser = await chromium.launch({
  executablePath: process.env.BROWSER_EXECUTABLE,
  headless: true,
  args: [
    "--no-sandbox",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } }),
  errors = [];
page.setDefaultTimeout(60000);
page.on("pageerror", (e) => errors.push(e.message));
async function bindCamera(p) {
  await p.evaluate(async () => {
    const source = await (await fetch("/src/scene/SafeScene.tsx")).text();
    const url = source.match(/from "([^"]*@react-three_fiber[^\"]*)"/)[1];
    const fiber = await import(url);
    window.readCamera = () => {
      const c = fiber._roots
        .get(document.querySelector("canvas"))
        .store.getState().camera;
      return { x: c.position.x, z: c.position.z, yaw: c.rotation.y };
    };
  });
}
await page.goto("http://127.0.0.1:5173/");
await page.getByRole("button", { name: /Iniciar inspeção/ }).click();
await page
  .getByRole("button", { name: "Explorar a sala", exact: true })
  .click();
await bindCamera(page);
async function walk(key, axis, op, target) {
  await page.keyboard.down(key);
  try {
    await page.waitForFunction(
      ({ axis, op, target }) => {
        const v = window.readCamera()[axis];
        return op === "<" ? v < target : v > target;
      },
      { axis, op, target },
      { timeout: 60000 },
    );
  } finally {
    await page.keyboard.up(key);
  }
}
// Real pointer dragging changes the camera, then restore heading by the reverse drag.
await page.mouse.move(500, 350);
await page.mouse.down();
await page.mouse.move(580, 350, { steps: 5 });
await page.mouse.up();
await page.waitForFunction(() => window.readCamera().yaw < -0.2);
await page.mouse.move(580, 350);
await page.mouse.down();
await page.mouse.move(500, 350, { steps: 5 });
await page.mouse.up();
await page.waitForFunction(() => Math.abs(window.readCamera().yaw) < 0.05);
await walk("w", "z", "<", 4.7);
await page
  .getByRole("button", { name: "E · Examinar o cofre", exact: true })
  .click();
await page
  .getByRole("button", { name: "Explorar a sala", exact: true })
  .click();
await page.screenshot({ path: "/tmp/explore-room.png" });
async function discover(title, action) {
  await page.keyboard.press("e");
  const modal = page.getByRole("dialog", { name: title, exact: true });
  const position = await page.evaluate(() => window.readCamera());
  await page.keyboard.down("w");
  await page.waitForTimeout(100);
  await page.keyboard.up("w");
  assert.deepEqual(await page.evaluate(() => window.readCamera()), position);
  await modal.getByRole("button", { name: action, exact: true }).click();
  assert.ok((await modal.locator("[role=status]").innerText()).length > 50);
  await modal
    .getByRole("button", { name: "Continuar explorando", exact: true })
    .click();
  console.log("Discovered on foot:", title);
}
await walk("a", "x", "<", -8);
await walk("w", "z", "<", 4.7);
await discover("A etiqueta coberta", "Descolar a etiqueta");
await walk("a", "x", "<", -9.2);
await walk("s", "z", ">", 8.9);
await discover("O fiscal de umidade", "Apertar o pato");
await walk("s", "z", ">", 12.8);
await walk("d", "x", ">", -7.1);
await walk("w", "z", "<", 12.1);
await discover("O desenho sob a água", "Afastar a película da água");
await walk("s", "z", ">", 12.8);
await walk("d", "x", ">", 7);
await walk("w", "z", "<", 12.4);
await discover("O relógio que não quebrou", "Abrir o vidro");
await walk("s", "z", ">", 12.8);
await walk("a", "x", "<", 0.1);
await walk("ArrowLeft", "yaw", ">", 3.05);
await discover("O carimbo no verso", "Virar o ingresso");
await walk("ArrowRight", "yaw", "<", 0.03);
await walk("d", "x", ">", 9.3);
await walk("w", "z", "<", 6.8);
await discover("O avesso do tecido", "Virar a ponta do tecido");
await page.getByRole("button", { name: "Caderno (6)", exact: true }).click();
const book = page.getByRole("dialog", { name: "Caderno de observações" });
assert.equal(await book.locator(".journal-grid img").count(), 6);
assert.equal(await book.locator(".comparison").count(), 2);
await book
  .getByRole("textbox", { name: "Suas teorias" })
  .fill(
    "As marcas foram recolhidas de lugares diferentes? WASD não deve mover a câmera aqui.",
  );
await page.screenshot({ path: "/tmp/explore-journal.png" });
await page.keyboard.press("Escape");
await page
  .getByRole("button", { name: "Voltar ao cofre", exact: true })
  .click();
await page.getByRole("button", { name: /Examinar as sete emendas/ }).click();
assert.equal(await page.locator(".rail li").count(), 7);
await page.keyboard.press("Escape");
await page.reload();
await page.getByRole("button", { name: /Iniciar inspeção/ }).click();
await page
  .getByRole("button", { name: "Explorar a sala", exact: true })
  .click();
await page.getByRole("button", { name: "Caderno (6)", exact: true }).click();
assert.match(
  await page.getByRole("textbox", { name: "Suas teorias" }).inputValue(),
  /lugares diferentes/,
);
await page.close();
const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
mobile.setDefaultTimeout(60000);
mobile.on("pageerror", (e) => errors.push(e.message));
await mobile.goto("http://127.0.0.1:5173/");
await mobile.getByRole("button", { name: /Iniciar inspeção/ }).click();
await mobile
  .getByRole("button", { name: "Explorar a sala", exact: true })
  .click();
await bindCamera(mobile);
const forward = await mobile
  .getByRole("button", { name: "Andar para frente", exact: true })
  .boundingBox();
const session = await mobile.context().newCDPSession(mobile);
await session.send("Input.dispatchTouchEvent", {
  type: "touchStart",
  touchPoints: [
    { x: forward.x + forward.width / 2, y: forward.y + forward.height / 2 },
  ],
});
await mobile.waitForFunction(() => window.readCamera().z < 6.5);
await session.send("Input.dispatchTouchEvent", {
  type: "touchEnd",
  touchPoints: [],
});
await mobile.screenshot({ path: "/tmp/explore-mobile.png" });
assert.equal(
  await mobile.evaluate(
    () => document.documentElement.scrollWidth <= innerWidth,
  ),
  true,
);
await mobile.getByRole("button", { name: "Caderno (0)", exact: true }).click();
await mobile
  .getByRole("textbox", { name: "Suas teorias" })
  .fill("Meu caderno no celular");
await mobile.screenshot({ path: "/tmp/explore-mobile-journal.png" });
await mobile.keyboard.press("Escape");
await mobile
  .getByRole("button", { name: "Voltar ao cofre", exact: true })
  .click();
assert.equal(
  await mobile
    .getByRole("button", { name: /Examinar as sete emendas/ })
    .count(),
  1,
);
assert.deepEqual(errors, []);
console.log(
  "PASS: six secrets reached on foot; drag look; paused dialogs; journal and notes survive reload; safe preserved; mobile touch movement; no page errors.",
);
await browser.close();
await server.close();
