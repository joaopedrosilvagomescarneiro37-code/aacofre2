import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "../state/store";
import { FRAGMENTS } from "../content/archive";
import { Box, Plate, Tube } from "./parts";
import { brass, darkIron, labelTexture, iron } from "./materials";
function Reel({ x }: { x: number }) {
  const wheel = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (
      wheel.current &&
      useGame.getState().phase === "playing" &&
      !useGame.getState().paused
    )
      wheel.current.rotation.z -= dt * 0.9;
  });
  return (
    <group ref={wheel} position={[x, 1.27, 1.17]}>
      <mesh material={brass}>
        <torusGeometry args={[0.62, 0.045, 8, 48]} />
      </mesh>
      <mesh material={darkIron}>
        <circleGeometry args={[0.57, 48]} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <group key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
          <Box
            position={[0, 0.27, 0.04]}
            size={[0.12, 0.55, 0.04]}
            material={brass}
          />
          <mesh position={[0, 0.41, 0.07]}>
            <circleGeometry args={[0.13, 18]} />
            <meshStandardMaterial color="#121a17" />
          </mesh>
        </group>
      ))}
      <mesh
        position={[0, 0, 0.1]}
        material={iron}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[0.1, 0.1, 0.1, 18]} />
      </mesh>
    </group>
  );
}
function Cassette({ index }: { index: number }) {
  const id = useGame((s) => s.order[index]),
    selected = useGame((s) => s.selected === index),
    active = useGame((s) => s.playhead === id);
  const ref = useRef<THREE.Group>(null);
  const tex = useMemo(
    () =>
      labelTexture(
        FRAGMENTS[id].label.toUpperCase(),
        768,
        100,
        "#302b20",
        "#b7a582",
        37,
      ),
    [id],
  );
  useFrame((_, dt) => {
    if (ref.current)
      ref.current.position.z = THREE.MathUtils.damp(
        ref.current.position.z,
        selected ? 1.27 : 1.12,
        9,
        dt,
      );
  });
  return (
    <group
      name={`splice-${index}`}
      ref={ref}
      position={[0, 0.32 - index * 0.29, 1.12]}
      onClick={(e) => {
        e.stopPropagation();
        useGame.getState().select(index);
        useGame.getState().setWorkbench(true);
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      <Box size={[3.2, 0.235, 0.1]} material={selected ? brass : darkIron} />
      <mesh position={[0, 0, 0.055]}>
        <planeGeometry args={[2.96, 0.19]} />
        <meshStandardMaterial
          map={tex}
          emissive={active ? "#66542c" : "#000000"}
          emissiveIntensity={0.5}
        />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 1.56, 0, 0.08]} material={brass}>
          <sphereGeometry args={[0.025, 8, 8]} />
        </mesh>
      ))}
    </group>
  );
}
export function ArchiveMechanism() {
  const crank = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (
      crank.current &&
      useGame.getState().phase === "playing" &&
      !useGame.getState().paused
    )
      crank.current.rotation.z -= dt * 2;
  });
  return (
    <group>
      <Plate
        position={[0, 2.83, 1]}
        text={"ARQUIVO DA INTERDIÇÃO / PEÇA 7"}
        size={[3.8, 0.3]}
        fontSize={33}
      />
      <Reel x={-1.12} />
      <Reel x={1.12} />
      <Tube
        points={[
          [-1.7, 1.15, 1.14],
          [-0.55, 0.7, 1.14],
          [0.55, 0.7, 1.14],
          [1.7, 1.15, 1.14],
        ]}
        radius={0.025}
        material={brass}
      />
      <Box
        position={[0, 0.82, 1.16]}
        size={[0.38, 0.3, 0.15]}
        material={iron}
      />
      {Array.from({ length: 7 }, (_, i) => (
        <Cassette key={i} index={i} />
      ))}
      <Plate
        position={[0, -2.16, 1.02]}
        text={"NÃO CONFUNDA A VOZ COM QUEM FALA."}
        size={[3.7, 0.36]}
        fontSize={28}
        onClick={() => useGame.getState().inspect("main")}
      />
      <group
        ref={crank}
        position={[1.96, -2.6, 1.08]}
        onClick={(e) => {
          e.stopPropagation();
          useGame.getState().play(undefined, true);
        }}
      >
        <mesh material={brass}>
          <torusGeometry args={[0.23, 0.035, 8, 30]} />
        </mesh>
        <Box
          position={[0, 0.12, 0]}
          size={[0.04, 0.26, 0.05]}
          material={brass}
        />
        <mesh position={[0, 0.23, 0.12]} material={darkIron}>
          <sphereGeometry args={[0.08, 12, 12]} />
        </mesh>
      </group>
      <Plate
        position={[-0.35, -2.65, 1.02]}
        text={"GIRE PARA CONFERIR A CÓPIA"}
        size={[2.8, 0.24]}
        fontSize={29}
        onClick={() => useGame.getState().play(undefined, true)}
      />
    </group>
  );
}
