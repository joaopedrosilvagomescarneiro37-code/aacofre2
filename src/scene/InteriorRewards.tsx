import * as THREE from "three";
import { useGame } from "../state/store";
import { brass, darkIron, paperMap, metalMap, labelTexture } from "./materials";
import { Box, Tube } from "./parts";
import { useMemo } from "react";
export function Siren({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.42, 32]} />
        <meshStandardMaterial
          color="#8d3020"
          map={metalMap}
          metalness={0.65}
          roughness={0.57}
        />
      </mesh>
      <mesh
        position={[0, 0, 0.24]}
        rotation={[Math.PI / 2, 0, 0]}
        material={darkIron}
      >
        <cylinderGeometry args={[0.29, 0.29, 0.04, 32]} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.18, Math.sin(a) * 0.18, 0.272]}
            rotation={[0, 0, a]}
            material={brass}
          >
            <boxGeometry args={[0.22, 0.022, 0.028]} />
          </mesh>
        );
      })}
      <mesh position={[0, 0, 0.28]} material={brass}>
        <torusGeometry args={[0.305, 0.033, 8, 32]} />
      </mesh>
      <mesh position={[0, 0, 0.29]} material={brass}>
        <sphereGeometry args={[0.06, 12, 8]} />
      </mesh>
      <Tube
        points={[
          [0, 0.24, -0.08],
          [0, 0.46, -0.08],
          [0.28, 0.46, -0.08],
          [0.28, 0.36, -0.08],
        ]}
        radius={0.035}
        material={brass}
      />
      <Tube
        points={[
          [0.3, 0, 0],
          [0.5, 0, 0],
          [0.5, -0.22, 0],
          [0.65, -0.22, 0],
        ]}
        radius={0.028}
        material={brass}
      />
      <mesh position={[0.66, -0.22, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.19, 12]} />
        <meshStandardMaterial color="#2b231a" />
      </mesh>
      <Box
        position={[-0.13, -0.42, 0]}
        size={[0.07, 0.28, 0.1]}
        material={brass}
      />
      <Box
        position={[0.13, -0.42, 0]}
        size={[0.07, 0.28, 0.1]}
        material={brass}
      />
      <Box
        position={[0, -0.56, 0]}
        size={[0.64, 0.06, 0.46]}
        material={darkIron}
      />
    </group>
  );
}
export function InteriorRewards() {
  const phase = useGame((s) => s.phase);
  const mapMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#afa781", map: paperMap }),
    [],
  );
  const reportTex = useMemo(
    () =>
      labelTexture(
        "INTERDIÇÃO\nPEÇA 7 / CABEÇA DE CERVO\n____________________\nDepoimento de Helena\n\nOs ferros não são reparos.",
        512,
        640,
        "#37382c",
        "#c3b994",
        28,
      ),
    [],
  );
  return (
    <group name="interior-rewards" visible={phase === "open"}>
      <Box position={[0, -1.95, -0.05]} size={[4.6, 0.12, 1.05]} />
      <Box position={[0, 0.1, -0.05]} size={[4.6, 0.08, 0.94]} />
      <pointLight
        position={[0, 2, 0.2]}
        color="#e5b16a"
        intensity={9}
        distance={6}
      />
      <group
        position={[-1.1, -1.3, 0.15]}
        onClick={(e) => {
          e.stopPropagation();
          useGame.getState().inspect("siren");
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <Siren scale={1.05} />
        <mesh>
          <boxGeometry args={[1.55, 1.5, 0.65]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
      <group
        position={[0.95, 0.96, 0.05]}
        rotation={[0, 0, -0.09]}
        onClick={(e) => {
          e.stopPropagation();
          useGame.getState().inspect("map");
        }}
      >
        <Box size={[1.5, 1.4, 0.02]} material={mapMaterial} />
        {[
          [-0.4, 0.2, 0.01],
          [0.15, 0.2, 0.01],
          [0.15, -0.25, 0.01],
        ].map((p, i) => (
          <Box
            key={i}
            position={p as [number, number, number]}
            size={i === 1 ? [0.025, 0.9, 0.01] : [0.65, 0.025, 0.01]}
            material={brass}
          />
        ))}
      </group>
      <mesh
        position={[1, -1.12, 0.3]}
        rotation={[0, 0, 0.12]}
        onClick={(e) => {
          e.stopPropagation();
          useGame.getState().inspect("report");
        }}
      >
        <planeGeometry args={[1.05, 1.35]} />
        <meshStandardMaterial
          map={reportTex}
          roughness={1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
