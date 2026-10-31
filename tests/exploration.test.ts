import { beforeEach, describe, it, expect, vi } from "vitest";
import {
  validPosition,
  stepPosition,
  nearby,
  SECRETS,
  decodeJournal,
  EXPLORE_KEY,
} from "../src/content/exploration";
import { useExplore } from "../src/state/exploration";
import { useGame } from "../src/state/store";
beforeEach(() => {
  useExplore.getState().leave();
  useExplore.setState({ found: [], note: "" });
  useGame.getState().reset();
  vi.stubGlobal("localStorage", { setItem: vi.fn(), getItem: () => null });
});
describe("passeio e caderno", () => {
  it("não atravessa paredes, cofre nem móveis num passo grande", () => {
    expect(validPosition(0, 7)).toBe(true);
    expect(validPosition(0, 1)).toBe(false);
    expect(validPosition(11, 7)).toBe(false);
    expect(validPosition(0, 15)).toBe(false);
    expect(stepPosition(0, 7, 0, -20).z).toBeGreaterThanOrEqual(2.6);
    expect(stepPosition(0, 7, 30, 0).x).toBeLessThanOrEqual(10);
    expect(stepPosition(-8, 7, 0, -10).z).toBeGreaterThanOrEqual(3.95);
  });
  it("colide também com a folha da porta aberta", () => {
    expect(validPosition(-2.55, 4, 0)).toBe(true);
    expect(validPosition(-2.55, 4, Math.PI / 2)).toBe(false);
    expect(stepPosition(-2.55, 7, 0, -5, Math.PI / 2).z).toBeGreaterThan(6);
  });
  it("desliza ao longo de paredes", () => {
    const p = stepPosition(9.9, 7, 3, 3);
    expect(p.z).toBeGreaterThan(9);
    expect(validPosition(p.x, p.z)).toBe(true);
  });
  it("exige proximidade e direção para oferecer uma interação", () => {
    expect(nearby(0, 4.5, 0)).toBe("safe");
    expect(nearby(0, 4.5, Math.PI)).toBe(null);
    expect(nearby(0, 8, 0)).toBe(null);
    for (const s of SECRETS)
      expect(nearby(s.position[0], s.position[2] + 1.5, 0)).toBe(s.id);
  });
  it("descobertas não destrancam o cofre e precisam da ação do jogador", () => {
    useExplore.getState().enter();
    useExplore.getState().discover();
    expect(useExplore.getState().found).toEqual([]);
    for (const s of SECRETS) {
      useExplore.setState({ near: s.id });
      useExplore.getState().interact();
      expect(useExplore.getState().opened).toBe(s.id);
      useExplore.getState().discover();
      useExplore.getState().discover();
      useExplore.getState().close();
    }
    expect(useExplore.getState().found).toHaveLength(6);
    expect(useGame.getState().phase).toBe("idle");
  });
  it("só permite rever no caderno o que já foi descoberto", () => {
    useExplore.getState().book();
    useExplore.getState().view("eye");
    expect(useExplore.getState().opened).toBe("journal");
    useExplore.setState({ found: ["eye"] });
    useExplore.getState().view("eye");
    expect(useExplore.getState().opened).toBe("eye");
  });
  it("salva teorias com limite e sanitiza dados inválidos", () => {
    useExplore.getState().setNote("w".repeat(3000));
    expect(useExplore.getState().note.length).toBe(2000);
    const calls = vi.mocked(localStorage.setItem).mock.calls;
    expect(calls.at(-1)?.[0]).toBe(EXPLORE_KEY);
    expect(decodeJournal(calls.at(-1)![1]).note).toHaveLength(2000);
    expect(decodeJournal("{")).toEqual({ found: [], note: "" });
    expect(
      decodeJournal('{"found":["eye","eye","fake"],"note":false}'),
    ).toEqual({ found: ["eye"], note: "" });
  });
  it("preserva montagem e bloqueia interação remota com o cofre", () => {
    useGame.getState().move(0, 3);
    const order = [...useGame.getState().order];
    useExplore.getState().enter();
    useGame.getState().play(undefined, true);
    useGame.getState().setWorkbench(true);
    useGame.getState().inspect("main");
    expect(useGame.getState().phase).toBe("idle");
    expect(useGame.getState().workbench).toBe(false);
    expect(useGame.getState().inspection).toBe(null);
    useExplore.setState({ near: "safe" });
    useExplore.getState().interact();
    expect(useExplore.getState().walking).toBe(false);
    expect(useGame.getState().order).toEqual(order);
  });
  it("continua a descoberta mesmo sem storage", () => {
    vi.stubGlobal("localStorage", {
      setItem() {
        throw Error("quota");
      },
    });
    useExplore.getState().enter();
    useExplore.setState({ near: "duck" });
    useExplore.getState().interact();
    useExplore.getState().discover();
    expect(useExplore.getState().found).toEqual(["duck"]);
    expect(useExplore.getState().storageOK).toBe(false);
  });
});
