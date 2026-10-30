import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { useGame } from "../state/store";

export function InspectionCamera() {
  const ref = useRef<OrbitControlsImpl>(null),
    transition = useRef(true);
  const started = useGame((s) => s.started),
    selected = useGame((s) => s.selected),
    phase = useGame((s) => s.phase);
  const dragging = useGame((s) => s.doorDragging);
  const { camera, size } = useThree();
  const desired = useRef(new THREE.Vector3()),
    target = useRef(new THREE.Vector3());
  const minDistance = useRef(10);
  useEffect(() => {
    const aspect = size.width / size.height;
    const base = Math.max(10.9, 8.5 / aspect);
    minDistance.current = base * 0.66;
    const opening = phase === "open";
    const focus =
      selected !== null
        ? new THREE.Vector3(0, 0.32 - selected * 0.29, 0)
        : new THREE.Vector3();
    target.current.set(
      started ? focus.x * 0.25 : -0.95,
      started ? focus.y * 0.3 : 0,
      0,
    );
    desired.current.set(
      !started ? base * 0.32 : opening ? base * 0.17 : focus.x * 0.25,
      0.55,
      base * (selected !== null ? 0.88 : 1),
    );
    transition.current = true;
  }, [started, selected, phase === "open", size.width, size.height]);
  useFrame((_, dt) => {
    if (!ref.current) return;
    if (transition.current) {
      camera.position.lerp(desired.current, 1 - Math.exp(-dt * 3));
      ref.current.target.lerp(target.current, 1 - Math.exp(-dt * 3));
      if (camera.position.distanceTo(desired.current) < 0.02)
        transition.current = false;
      ref.current.update();
    }
  });
  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enabled={started && !dragging}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.35}
      zoomSpeed={0.65}
      minDistance={minDistance.current}
      maxDistance={Math.max(18, 10 / Math.max(size.width / size.height, 0.3))}
      minPolarAngle={Math.PI * 0.39}
      maxPolarAngle={Math.PI * 0.59}
      minAzimuthAngle={-0.56}
      maxAzimuthAngle={0.56}
      onStart={() => (transition.current = false)}
    />
  );
}
