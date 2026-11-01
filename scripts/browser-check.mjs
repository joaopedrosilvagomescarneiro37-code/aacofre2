// Optional integration check: npm i --no-save @playwright/test, npx playwright install chromium.
// Starts its own server at 127.0.0.1:5173. Screenshots stay outside the repository.
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createServer } from "vite";
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
const errors = [];
async function openPuzzle(page) {
  await page.getByRole("button", { name: "Puzzle principal", exact: true }).click();
  await page.getByRole("button", { name: "Explorar a sala", exact: true }).waitFor();
  assert.equal(await page.locator(".walk-pad").count(), 0);
}
async function bindScene(page) {
  await page.evaluate(async () => {
    const source = await (await fetch("/src/scene/SafeScene.tsx")).text();
    const url = source.match(/from "([^"]*@react-three_fiber[^"]*)"/)[1];
    const fiber = await import(url);
    const root = () => fiber._roots.get(document.querySelector("canvas"))?.store.getState();
    window.cameraZ = () => root()?.camera.position.z ?? Infinity;
    window.scenePoint = (name) => {
      const { scene, camera } = root();
      const object = scene.getObjectByName(name);
      const point = object.getWorldPosition(object.position.clone()).project(camera);
      const rect = document.querySelector("canvas").getBoundingClientRect();
      return { x: rect.left + (point.x + 1) * rect.width / 2,
        y: rect.top + (1 - point.y) * rect.height / 2 };
    };
  });
}

if (!process.env.MOBILE_ONLY) {
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(60000);
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:5173/");
// The default view must actually walk. Approach the cofre and enter via E.
await page.locator("canvas").waitFor();
await bindScene(page);
await page.waitForFunction(() => window.cameraZ() <= 7.1);
await page.keyboard.down("w");
try {
  await page.getByRole("button", { name: "E · Examinar o cofre", exact: true }).waitFor();
} finally {
  await page.keyboard.up("w");
}
await page.keyboard.press("e");
await page.getByRole("button", { name: "Explorar a sala", exact: true }).waitFor();
assert.equal(await page.locator(".walk-pad").count(), 0);
await page.getByRole("button", { name: "Explorar a sala", exact: true }).click();
await openPuzzle(page);
await bindScene(page);
await page.waitForFunction(() => window.cameraZ() > 10.5);
await page.screenshot({ path: "/tmp/archive-scene.png" });
assert.equal(await page.locator(".webgl-error").count(), 0);
// Click the rendered 3D piece, without firing handlers or changing game state.
const splice = await page.evaluate(() => window.scenePoint("splice-0"));
await page.mouse.click(splice.x, splice.y);
const bench = page.getByRole("dialog", { name: "Mesa de emendas" });
await bench.getByRole("button", { name: /Virar para o verso/ }).click();
await bench
  .getByRole("button", { name: "Levantar a emenda", exact: true })
  .click();
assert.match(await bench.locator(".handwritten").innerText(), /CHAMADO/);
await page.screenshot({ path: "/tmp/archive-bench.png" });
await bench.getByRole("button", { name: /Conferir cópia/ }).click();
await bench.getByRole("button", { name: "Pausar", exact: true }).click();
assert.equal(
  await bench
    .getByRole("button", { name: "Próxima faixa", exact: true })
    .isDisabled(),
  true,
);
await bench.getByRole("button", { name: "Retomar", exact: true }).click();
for (let i = 0; i < 7; i++)
  await bench
    .getByRole("button", { name: "Próxima faixa", exact: true })
    .click();
assert.match(await bench.locator("[role=status]").innerText(), /líderes/);
console.log("wrong assembly and pause passed");
// Keyboard reorder then drag, preserving selected strip identity.
await bench
  .getByRole("button", { name: "Inspecionar Emenda verde", exact: true })
  .click();
await page.keyboard.press("Alt+ArrowDown");
assert.match(
  await bench.locator(".rail li").nth(1).innerText(),
  /Emenda verde/,
);
await bench.locator(".rail li").nth(1).dragTo(bench.locator(".rail li").nth(0));
assert.match(
  await bench.locator(".rail li").nth(0).innerText(),
  /Emenda verde/,
);
// Solve using only the same buttons a player uses.
const order = [
  "Papel de arroz",
  "Emenda verde",
  "Fibra de linho",
  "Mancha de cobre",
  "Borda de carvão",
  "Ponta encerada",
  "Líder vermelho",
];
for (let target = 0; target < order.length; target++) {
  await bench
    .getByRole("button", { name: `Inspecionar ${order[target]}`, exact: true })
    .click();
  let current = (await bench.locator(".rail strong").allTextContents()).indexOf(
    order[target],
  );
  while (current > target) {
    await bench.getByRole("button", { name: /Mover antes/ }).click();
    current--;
  }
}
await page.getByRole("button", { name: "Fechar Mesa de emendas", exact: true }).click();
await page.getByRole("button", { name: "Explorar a sala", exact: true }).click();
await page.getByRole("button", { name: "Caderno (0)", exact: true }).click();
await page.getByRole("textbox", { name: "Suas teorias" }).fill("O passeio e o puzzle preservam minhas descobertas.");
await page.keyboard.press("Escape");
await openPuzzle(page);
await page.getByRole("button", { name: /Examinar as sete/ }).click();
assert.deepEqual(await bench.locator(".rail strong").allTextContents(), order);
console.log("both mode entries, real 3D click and return with assembly passed");
await page.reload();
await openPuzzle(page);
await page.getByRole("button", { name: /Examinar as sete/ }).click();
assert.deepEqual(await bench.locator(".rail strong").allTextContents(), order);
await bench
  .getByRole("button", { name: "Inspecionar Emenda verde", exact: true })
  .click();
await bench.getByRole("button", { name: /Virar para o verso/ }).click();
assert.match(await bench.locator(".handwritten").innerText(), /CHAMADO/);
console.log("reorder and reload passed");
// Let one real MP3 play completely, exercising HTMLAudio and synchronized text.
await bench.getByRole("button", { name: /Ouvir só esta/ }).click();
await page.waitForFunction(
  () => document.querySelector(".playback .verse"),
  {},
  { timeout: 20000 },
);
await page.waitForFunction(
  () => !document.querySelector(".playback"),
  {},
  { timeout: 10000 },
);
assert.equal(await page.getByText(/O áudio não pôde tocar/).count(), 0);
console.log("real MP3 passed");
await page
  .getByRole("button", { name: "Fechar Mesa de emendas", exact: true })
  .click();
await page.getByRole("button", { name: "Silenciar", exact: true }).click();
await page.getByRole("button", { name: /Examinar as sete/ }).click();
await bench.getByRole("button", { name: /Conferir cópia/ }).click();
// All pieces available as text, so silence and skipping must remain supported.
for (let i = 0; i < 7; i++)
  await bench
    .getByRole("button", { name: "Próxima faixa", exact: true })
    .click();
assert.equal(
  await page
    .getByRole("button", { name: "Relatório de interdição", exact: false })
    .count(),
  0,
);
await page.getByRole("button", { name: /Puxar porta/ }).click();
await page.getByRole("button", { name: /Puxar porta/ }).click();
await page.getByRole("button", { name: /Relatório de interdição/ }).click();
assert.match(
  await page.locator(".report-text").innerText(),
  /seis grampos porque/,
);
assert.doesNotMatch(
  await page.locator(".report-text").innerText(),
  /criança contando/,
);
await page
  .getByRole("button", { name: "Registrar no inventário", exact: true })
  .click();
await page.screenshot({ path: "/tmp/archive-report.png" });
await page
  .getByRole("button", { name: "Fechar inspeção", exact: true })
  .click();
await page.reload();
await openPuzzle(page);
assert.match(
  await page.locator(".reward-tray").innerText(),
  /Relatório de interdição.*✓/s,
);
await page.getByRole("button", { name: /Sirene de manivela/ }).click();
await page
  .getByRole("button", { name: "Fechar inspeção", exact: true })
  .click();
await page.getByRole("button", { name: /Planta de manutenção/ }).click();
assert.equal(await page.locator("svg.maintenance-map").count(), 1);
await page.keyboard.press("Escape");
await page.getByRole("button", { name: "Ajuda", exact: true }).click();
await page
  .getByRole("button", { name: "Reiniciar arquivo…", exact: true })
  .click();
await page.getByRole("button", { name: "Reiniciar", exact: true }).click();
assert.equal(await page.locator(".reward-tray").count(), 0);
console.log("door, rewards, reload, reset passed");
assert.deepEqual(errors, []);
await page.close();
}
// Fresh mobile page: volume is reachable and all controls fit without horizontal overflow.
const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
mobile.on("pageerror", e => errors.push(e.message));
mobile.setDefaultTimeout(60000);
await mobile.goto("http://127.0.0.1:5173/");
await openPuzzle(mobile);
await mobile
  .getByRole("button", { name: "Ajustar volume", exact: true })
  .click();
await mobile.getByRole("slider").press("Home");
await mobile.getByRole("slider").press("ArrowRight");
await mobile.keyboard.press("Escape");
await mobile.getByRole("button", { name: /Examinar as sete/ }).click();
await mobile.screenshot({ path: "/tmp/archive-mobile.png" });
assert.equal(
  await mobile.evaluate(
    () => document.documentElement.scrollWidth <= innerWidth,
  ),
  true,
);
const md = mobile.getByRole("dialog", { name: "Mesa de emendas" });
await md.getByRole("button", { name: /Mover depois/ }).click();
await md.getByRole("button", { name: /Virar para o verso/ }).click();
await md
  .getByRole("button", { name: "Levantar a emenda", exact: true })
  .click();
await mobile.screenshot({ path: "/tmp/archive-mobile-inspection.png" });
const mobileOrder = await md.locator(".rail strong").allTextContents();
await mobile.getByRole("button", { name: "Fechar Mesa de emendas", exact: true }).click();
await mobile.getByRole("button", { name: "Explorar a sala", exact: true }).click();
assert.equal(await mobile.locator(".walk-pad").count(), 1);
await openPuzzle(mobile);
await mobile.getByRole("button", { name: /Examinar as sete/ }).click();
assert.deepEqual(await md.locator(".rail strong").allTextContents(), mobileOrder);

assert.deepEqual(errors, []);
fs.writeFileSync(
  "/tmp/archive-browser-result.json",
  JSON.stringify(
    {
      ok: true,
      mobileOnly: !!process.env.MOBILE_ONLY,
      errors,
      checks: process.env.MOBILE_ONLY ? ["mobile volume", "mobile controls", "no horizontal overflow", "back and splice inspection"] : [
        "WebGL render",
        "walk to cofre and enter via E",
        "corner button and return to walking",
        "rendered 3D splice click",
        "assembly preserved between modes",
        "mobile mode round trip",
        "wrong assembly",
        "pause",
        "keyboard reorder",
        "drag",
        "button reorder",
        "reload discoveries",
        "real MP3 and captions",
        "silent solve",
        "manual door",
        "rewards and collection",
        "reload open",
        "reset",
        "mobile controls",
      ],
    },
    null,
    2,
  ),
);
console.log(
  "Browser flow passed; screenshots and result saved in /tmp/archive-*.",
);
await browser.close();
await server.close();
