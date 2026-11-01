import { useExplore } from "./exploration";
import { useGame } from "./store";

/** Both ways into the puzzle (corner button and nearby cofre) share the same transition. */
export function showPuzzle() {
  useGame.getState().start();
  useExplore.getState().leave();
}

export function showExploration() {
  const game = useGame.getState();
  game.stop();
  game.inspect(null);
  game.setWorkbench(false);
  useExplore.getState().enter();
}

export function interactWithRoom() {
  const room = useExplore.getState();
  if (!room.walking || room.opened || !room.near) return;
  if (room.near === "safe") showPuzzle();
  else room.interact();
}
