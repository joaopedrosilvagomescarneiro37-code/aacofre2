import { isOrder, solve } from "../logic/ArchiveSolver";
import { IDS, type FragmentId } from "../content/archive";
export const SAVE_KEY = "agua-morta:arquivo:v2";
export const REWARDS = ["siren", "map", "report"] as const;
export type Save = {
  order: FragmentId[];
  unlocked: boolean;
  opened: boolean;
  hints: number;
  volume: number;
  muted: boolean;
  collected: string[];
  revealed: FragmentId[];
};
export function decodeSave(raw: string | null): Save | null {
  try {
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (v?.version !== 2 || !isOrder(v.order)) return null;
    const unlocked = v.unlocked === true && solve(v.order).success;
    const opened = unlocked && v.opened === true;
    return {
      order: v.order,
      unlocked,
      opened,
      hints: Math.floor(Math.max(0, Math.min(3, Number(v.hints) || 0))),
      volume: Math.max(
        0,
        Math.min(1, Number.isFinite(v.volume) ? v.volume : 0.45),
      ),
      muted: v.muted === true,
      collected:
        opened && Array.isArray(v.collected)
          ? [
              ...new Set<string>(
                v.collected.filter((x: unknown) =>
                  REWARDS.includes(x as (typeof REWARDS)[number]),
                ),
              ),
            ]
          : [],
      revealed: Array.isArray(v.revealed)
        ? [
            ...new Set<FragmentId>(
              v.revealed.filter((x: unknown) => IDS.includes(x as FragmentId)),
            ),
          ]
        : [],
    };
  } catch {
    return null;
  }
}
export function readSave() {
  try {
    return decodeSave(localStorage.getItem(SAVE_KEY));
  } catch {
    return null;
  }
}
export function writeSave(s: Save) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...s, version: 2 }));
    return true;
  } catch {
    return false;
  }
}
