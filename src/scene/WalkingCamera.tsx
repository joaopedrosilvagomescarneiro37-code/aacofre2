import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { nearby, stepPosition } from "../content/exploration";
import { useExplore, walkInput, clearWalkInput } from "../state/exploration";
import { useGame } from "../state/store";
import { interactWithRoom } from "../state/modes";
export function WalkingCamera() {
  const { camera, gl } = useThree();
  const pose = useRef({ x: 0, z: 7, yaw: 0, pitch: 0 }),
    keys = useRef(new Set<string>()),
    drag = useRef<{ x: number; y: number; id: number } | null>(null);
  const opened = useExplore((s) => s.opened);
  useEffect(() => {
    keys.current.clear();
    clearWalkInput();
    drag.current = null;
  }, [opened]);
  useEffect(() => {
    const oldFov = "fov" in camera ? camera.fov : 43;
    if ("fov" in camera) {
      camera.fov = 65;
      camera.updateProjectionMatrix();
    }
    const canvas = gl.domElement;
    const clear = () => {
      keys.current.clear();
      clearWalkInput();
      drag.current = null;
    };
    const down = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).closest('input,textarea,[role="dialog"]') ||
        useExplore.getState().opened
      )
        return;
      if (
        [
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].includes(e.code)
      ) {
        e.preventDefault();
        keys.current.add(e.code);
      }
      if (e.code === "KeyE" && !e.repeat) interactWithRoom();
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const start = (e: PointerEvent) => {
      if (useExplore.getState().opened) return;
      drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
      canvas.setPointerCapture(e.pointerId);
    };
    const look = (e: PointerEvent) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      pose.current.yaw -= (e.clientX - d.x) * 0.004;
      pose.current.pitch = Math.max(
        -1.15,
        Math.min(1.15, pose.current.pitch - (e.clientY - d.y) * 0.004),
      );
      drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    };
    const end = (e: PointerEvent) => {
      if (canvas.hasPointerCapture(e.pointerId))
        canvas.releasePointerCapture(e.pointerId);
      drag.current = null;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", clear);
    canvas.addEventListener("pointerdown", start);
    canvas.addEventListener("pointermove", look);
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);
    return () => {
      clear();
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", clear);
      canvas.removeEventListener("pointerdown", start);
      canvas.removeEventListener("pointermove", look);
      canvas.removeEventListener("pointerup", end);
      canvas.removeEventListener("pointercancel", end);
      if ("fov" in camera) {
        camera.fov = oldFov;
        camera.updateProjectionMatrix();
      }
    };
  }, [camera, gl]);
  useFrame((_, delta) => {
    const p = pose.current,
      s = useExplore.getState();
    if (!s.opened) {
      const k = keys.current;
      let f =
        Number(k.has("KeyW") || k.has("ArrowUp")) -
        Number(k.has("KeyS") || k.has("ArrowDown")) +
        walkInput.forward;
      let side = Number(k.has("KeyD")) - Number(k.has("KeyA")) + walkInput.side;
      const dt = Math.min(delta, 0.06);
      p.yaw +=
        (Number(k.has("ArrowLeft")) -
          Number(k.has("ArrowRight")) +
          walkInput.turn) *
        dt *
        1.6;
      const norm = Math.max(1, Math.hypot(f, side));
      f /= norm;
      side /= norm;
      const next = stepPosition(
        p.x,
        p.z,
        (-Math.sin(p.yaw) * f + Math.cos(p.yaw) * side) * dt * 3,
        (-Math.cos(p.yaw) * f - Math.sin(p.yaw) * side) * dt * 3,
        useGame.getState().doorAngle,
      );
      p.x = next.x;
      p.z = next.z;
      const near = nearby(p.x, p.z, p.yaw);
      if (s.near !== near) useExplore.setState({ near });
    }
    camera.position.set(p.x, -1.65, p.z);
    camera.rotation.set(p.pitch, p.yaw, 0, "YXZ");
  });
  return null;
}
