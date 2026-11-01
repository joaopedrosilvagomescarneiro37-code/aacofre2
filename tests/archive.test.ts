import { describe, it, expect, beforeEach, vi } from "vitest";
import { solve, move, isOrder } from "../src/logic/ArchiveSolver";
import { INITIAL, FRAGMENTS, type FragmentId } from "../src/content/archive";
import {
  decodeSave,
  readSave,
  writeSave,
  SAVE_KEY,
} from "../src/state/PuzzlePersistence";
import { useGame } from "../src/state/store";
import { useExplore } from "../src/state/exploration";
const answer: FragmentId[] = [
  "registro",
  "chamado",
  "eco",
  "batente",
  "mesa",
  "aviso",
  "fim",
];
const game = () => useGame.getState();
function finish() {
  for (let i = 0; i < 7; i++) game().next();
}
function arrange() {
  for (let i = 0; i < 7; i++) game().move(game().order.indexOf(answer[i]), i);
}
function* permutations<T>(xs: T[]): Generator<T[]> {
  if (!xs.length) {
    yield [];
    return;
  }
  for (let i = 0; i < xs.length; i++)
    for (const tail of permutations(xs.filter((_, j) => i !== j)))
      yield [xs[i], ...tail];
}
beforeEach(() => {
  useExplore.getState().leave();
  vi.stubGlobal("localStorage", {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
  });
  game().reset();
});
describe("evidências e montagem", () => {
  it("aceita uma única montagem dentre todas as 5040 permutações", () => {
    const valid = [...permutations(INITIAL)].filter((o) => solve(o).success);
    expect(valid).toEqual([answer]);
  });
  it.each([
    null,
    {},
    [],
    [...answer, "fim"],
    ["registro", "registro", ...answer.slice(2)],
    ["inventado", ...answer.slice(1)],
  ])("rejeita estado incompleto ou adulterado %j", (o) => {
    expect(isOrder(o)).toBe(false);
    expect(solve(o).success).toBe(false);
  });
  it("descarta a ordem adulterada e cada troca de vizinhos com feedback", () => {
    expect(solve(INITIAL).success).toBe(false);
    for (let i = 0; i < 6; i++) {
      const r = solve(move(answer, i, i + 1));
      expect(r.success).toBe(false);
      expect(r.message.length).toBeGreaterThan(30);
    }
  });
  it("mover mantém conteúdo e inventário das sete peças", () => {
    const text = JSON.stringify(FRAGMENTS);
    let o = [...INITIAL];
    for (let i = 0; i < 7; i++) o = move(o, i, 6 - i);
    expect(isOrder(o)).toBe(true);
    expect(JSON.stringify(FRAGMENTS)).toBe(text);
    expect(move(o, -1, 3)).toBe(o);
    expect(move(o, 1, NaN)).toBe(o);
  });
});
describe("percurso, interrupções e recompensas", () => {
  it("porta, inspeção e coleta bloqueadas antes da abertura", () => {
    for (const id of ["siren", "map", "report"] as const) {
      game().inspect(id);
      game().collect(id);
    }
    game().openDoor(2);
    expect(game().inspection).toBe(null);
    expect(game().collected).toEqual([]);
    expect(game().doorAngle).toBe(0);
  });
  it("falha preserva montagem; acerto exige conferência e abertura manual", () => {
    game().play(undefined, true);
    finish();
    expect(game().phase).toBe("failure");
    expect(game().order).toEqual(INITIAL);
    arrange();
    game().play();
    finish();
    expect(game().phase).toBe("idle");
    game().play("registro", true);
    finish();
    expect(game().phase).toBe("idle");
    game().play(undefined, true);
    finish();
    expect(game().phase).toBe("unlocked");
    game().collect("report");
    expect(game().collected).toEqual([]);
    game().openDoor(1.4);
    game().inspect("report");
    game().collect("report");
    game().collect("report");
    expect(game().phase).toBe("open");
    expect(game().inspection).toBe("report");
    expect(game().collected).toEqual(["report"]);
  });
  it("pausa bloqueia avanço, reprodução bloqueia alteração, parar/resetar cancela", () => {
    arrange();
    game().play(undefined, true);
    game().move(0, 3);
    expect(game().order).toEqual(answer);
    game().pause();
    finish();
    expect(game().queueIndex).toBe(0);
    game().pause();
    game().next();
    expect(game().queueIndex).toBe(1);
    game().stop();
    finish();
    expect(game().phase).toBe("idle");
    game().play(undefined, true);
    const epoch = game().epoch;
    game().reset();
    finish();
    expect(game().epoch).toBeGreaterThan(epoch);
    expect(game().phase).toBe("idle");
    expect(game().order).toEqual(INITIAL);
  });
  it("salva descobertas, volume, montagem, porta e inventário", () => {
    game().reveal("eco");
    game().setVolume(0.2);
    game().toggleMute();
    arrange();
    game().play(undefined, true);
    finish();
    game().openDoor(2);
    game().collect("map");
    const calls = vi.mocked(localStorage.setItem).mock.calls;
    const saved = decodeSave(calls.at(-1)![1]);
    expect(calls.at(-1)![0]).toBe(SAVE_KEY);
    expect(saved).toMatchObject({
      opened: true,
      unlocked: true,
      order: answer,
      volume: 0.2,
      collected: ["map"],
      revealed: ["eco"],
    });
    game().reset();
    expect(game().revealed).toEqual([]);
    expect(game().collected).toEqual([]);
  });
});
describe("persistência defensiva", () => {
  it("ignora hidráulica, versões antigas, JSON inválido e desbloqueio forjado", () => {
    expect(decodeSave("{")).toBe(null);
    expect(
      decodeSave(JSON.stringify({ version: 1, rotations: [], opened: true })),
    ).toBe(null);
    const s = decodeSave(
      JSON.stringify({
        version: 2,
        order: INITIAL,
        unlocked: true,
        opened: true,
        collected: ["map"],
      }),
    );
    expect(s).toMatchObject({ unlocked: false, opened: false, collected: [] });
  });
  it("restaura somente itens conhecidos e valores válidos", () => {
    expect(
      decodeSave(
        JSON.stringify({
          version: 2,
          order: answer,
          unlocked: true,
          opened: true,
          volume: 90,
          hints: 99,
          revealed: ["eco", "eco", "evil"],
          collected: ["map", "map", "evil"],
        }),
      ),
    ).toMatchObject({
      volume: 1,
      hints: 3,
      revealed: ["eco"],
      collected: ["map"],
      opened: true,
    });
  });
  it("indisponibilidade de storage não derruba o jogo", () => {
    vi.stubGlobal("localStorage", {
      getItem() {
        throw Error("blocked");
      },
      setItem() {
        throw Error("quota");
      },
    });
    expect(readSave()).toBe(null);
    expect(
      writeSave({
        order: INITIAL,
        unlocked: false,
        opened: false,
        hints: 0,
        volume: 0.4,
        muted: false,
        revealed: [],
        collected: [],
      }),
    ).toBe(false);
    game().move(0, 1);
    expect(game().storageOK).toBe(false);
  });
});
