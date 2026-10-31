import { create } from "zustand";
import {
  EXPLORE_KEY,
  decodeJournal,
  type SecretId,
} from "../content/exploration";
function restore() {
  try {
    return decodeJournal(localStorage.getItem(EXPLORE_KEY));
  } catch {
    return decodeJournal(null);
  }
}
export const walkInput = { forward: 0, side: 0, turn: 0 };
export function clearWalkInput() {
  walkInput.forward = walkInput.side = walkInput.turn = 0;
}
type State = {
  walking: boolean;
  near: SecretId | "safe" | null;
  opened: SecretId | "journal" | null;
  found: SecretId[];
  note: string;
  storageOK: boolean;
  enter: () => void;
  leave: () => void;
  interact: () => void;
  close: () => void;
  discover: () => void;
  book: () => void;
  view: (id: SecretId) => void;
  setNote: (s: string) => void;
};
export const useExplore = create<State>((set, get) => ({
  ...restore(),
  walking: false,
  near: null,
  opened: null,
  storageOK: true,
  enter: () => {
    clearWalkInput();
    set({ walking: true, near: null, opened: null });
  },
  leave: () => {
    clearWalkInput();
    set({ walking: false, opened: null, near: null });
  },
  interact: () => {
    const s = get();
    if (!s.walking || !s.near || s.opened) return;
    if (s.near === "safe") {
      s.leave();
      return;
    }
    clearWalkInput();
    set({ opened: s.near });
  },
  close: () => {
    clearWalkInput();
    set({ opened: null });
  },
  book: () => {
    clearWalkInput();
    set({ opened: "journal" });
  },
  view: (id) => {
    if (get().found.includes(id)) set({ opened: id });
  },
  discover: () => {
    const s = get();
    if (!s.opened || s.opened === "journal" || s.found.includes(s.opened))
      return;
    set({ found: [...s.found, s.opened] });
  },
  setNote: (note) => set({ note: note.slice(0, 2000) }),
}));
let last = "";
useExplore.subscribe((s) => {
  const json = JSON.stringify({ found: s.found, note: s.note });
  if (json === last) return;
  last = json;
  let ok = true;
  try {
    localStorage.setItem(EXPLORE_KEY, json);
  } catch {
    ok = false;
  }
  if (s.storageOK !== ok) useExplore.setState({ storageOK: ok });
});
