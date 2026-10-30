import { create } from "zustand";
import { INITIAL, IDS, type FragmentId } from "../content/archive";
import { move, solve } from "../logic/ArchiveSolver";
import { readSave, writeSave, REWARDS } from "./PuzzlePersistence";
import { sound } from "../audio/SoundManager";
export type Phase = "idle" | "playing" | "failure" | "unlocked" | "open";
export type Inspect = "main" | "gauge" | "siren" | "map" | "report" | null;
const saved = readSave();
type State = {
  order: FragmentId[];
  phase: Phase;
  started: boolean;
  selected: number | null;
  inspection: Inspect;
  hints: number;
  volume: number;
  muted: boolean;
  collected: string[];
  revealed: FragmentId[];
  doorAngle: number;
  doorDragging: boolean;
  storageOK: boolean;
  help: boolean;
  workbench: boolean;
  message: string;
  epoch: number;
  playhead: FragmentId | null;
  playTime: number;
  paused: boolean;
  queue: FragmentId[];
  queueIndex: number;
  checking: boolean;
  audioError: boolean;
  start: () => void;
  select: (i: number | null) => void;
  move: (from: number, to: number) => void;
  inspect: (i: Inspect) => void;
  reveal: (id: FragmentId) => void;
  hint: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  openDoor: (a: number) => void;
  collect: (s: string) => void;
  reset: () => void;
  toggleHelp: () => void;
  setWorkbench: (v: boolean) => void;
  play: (single?: FragmentId, checking?: boolean) => void;
  pause: () => void;
  stop: () => void;
  next: () => void;
  tick: (t: number) => void;
};
export const useGame = create<State>((set, get) => ({
  order: saved?.order ?? [...INITIAL],
  phase: saved?.opened ? "open" : saved?.unlocked ? "unlocked" : "idle",
  started: false,
  selected: null,
  inspection: null,
  hints: saved?.hints ?? 0,
  volume: saved?.volume ?? 0.45,
  muted: saved?.muted ?? false,
  collected: saved?.collected ?? [],
  revealed: saved?.revealed ?? [],
  doorAngle: saved?.opened ? 1.65 : saved?.unlocked ? 0.13 : 0,
  doorDragging: false,
  storageOK: true,
  help: false,
  workbench: false,
  message: "A montagem começa por uma ordem para abrir. Falta alguma coisa.",
  epoch: 0,
  playhead: null,
  playTime: 0,
  paused: false,
  queue: [],
  queueIndex: 0,
  checking: false,
  audioError: false,
  start: () => {
    sound.setVolume(get().muted ? 0 : get().volume);
    void sound.start().catch(() => {});
    set({ started: true });
  },
  select: (i) => {
    if (i !== null && (!Number.isInteger(i) || i < 0 || i >= 7)) return;
    set({ selected: i, inspection: null });
  },
  move: (from, to) => {
    const s = get();
    if (!["idle", "failure"].includes(s.phase)) return;
    const order = move(s.order, from, to);
    if (order === s.order) return;
    sound.gear();
    set({
      order,
      selected: to,
      phase: "idle",
      message: "Emenda deslocada. Reproduza para comparar.",
    });
  },
  inspect: (i) => {
    if (
      i &&
      REWARDS.includes(i as (typeof REWARDS)[number]) &&
      get().phase !== "open"
    )
      return;
    set({ inspection: i });
  },
  reveal: (id) => {
    if (!IDS.includes(id)) return;
    set({ revealed: [...new Set([...get().revealed, id])] });
  },
  hint: () => set({ hints: Math.min(3, get().hints + 1) }),
  setVolume: (v) => {
    const volume = Math.max(0, Math.min(1, v));
    sound.setVolume(get().muted ? 0 : volume);
    set({ volume });
  },
  toggleMute: () => {
    const muted = !get().muted;
    sound.setVolume(muted ? 0 : get().volume);
    set({ muted });
  },
  openDoor: (a) => {
    if (!["open", "unlocked"].includes(get().phase)) return;
    set({
      doorAngle: Math.max(0.13, Math.min(2.1, a)),
      phase: a > 0.85 ? "open" : get().phase,
    });
  },
  collect: (s) => {
    if (
      get().phase !== "open" ||
      !REWARDS.includes(s as (typeof REWARDS)[number])
    )
      return;
    set({ collected: [...new Set([...get().collected, s])] });
  },
  reset: () =>
    set({
      order: [...INITIAL],
      phase: "idle",
      selected: null,
      inspection: null,
      doorAngle: 0,
      doorDragging: false,
      collected: [],
      revealed: [],
      hints: 0,
      queue: [],
      queueIndex: 0,
      playhead: null,
      playTime: 0,
      paused: false,
      checking: false,
      epoch: get().epoch + 1,
      message:
        "A montagem começa por uma ordem para abrir. Falta alguma coisa.",
    }),
  toggleHelp: () => set({ help: !get().help }),
  setWorkbench: (workbench) => set({ workbench }),
  play: (single, checking = false) => {
    const s = get();
    if (!["idle", "failure"].includes(s.phase)) return;
    const queue = single ? [single] : [...s.order];
    if (!queue.every((id) => IDS.includes(id))) return;
    set({
      phase: "playing",
      queue,
      queueIndex: 0,
      playhead: queue[0],
      playTime: 0,
      paused: false,
      checking: checking && !single,
      audioError: false,
      epoch: s.epoch + 1,
      message: checking
        ? "Conferindo a cópia completa…"
        : "Escutando a montagem. Observe as emendas.",
    });
  },
  pause: () => {
    if (get().phase === "playing") set({ paused: !get().paused });
  },
  stop: () => {
    if (get().phase !== "playing") return;
    set({
      phase: "idle",
      queue: [],
      playhead: null,
      playTime: 0,
      paused: false,
      checking: false,
      epoch: get().epoch + 1,
      message: "Reprodução interrompida. A montagem foi preservada.",
    });
  },
  tick: (t) => {
    if (
      get().phase === "playing" &&
      !get().paused &&
      Math.abs(t - get().playTime) > 0.08
    )
      set({ playTime: t });
  },
  next: () => {
    const s = get();
    if (s.phase !== "playing" || s.paused) return;
    const i = s.queueIndex + 1;
    if (i < s.queue.length) {
      set({ queueIndex: i, playhead: s.queue[i], playTime: 0 });
      return;
    }
    const result = s.checking ? solve(s.order) : null;
    if (result?.success) sound.knock();
    else if (result) sound.leak();
    set({
      phase: result ? (result.success ? "unlocked" : "failure") : "idle",
      doorAngle: result?.success ? 0.13 : s.doorAngle,
      queue: [],
      playhead: null,
      playTime: 0,
      paused: false,
      checking: false,
      message:
        result?.message ??
        "Fim da reprodução. Você pode mover as emendas ou conferir a cópia.",
      workbench: result?.success ? false : s.workbench,
    });
  },
}));
let last = "";
useGame.subscribe((s) => {
  const payload = {
    order: s.order,
    unlocked: ["unlocked", "open"].includes(s.phase),
    opened: s.phase === "open",
    hints: s.hints,
    volume: s.volume,
    muted: s.muted,
    collected: s.collected,
    revealed: s.revealed,
  };
  const json = JSON.stringify(payload);
  if (json !== last) {
    last = json;
    const ok = writeSave(payload);
    if (s.storageOK !== ok) useGame.setState({ storageOK: ok });
  }
});
