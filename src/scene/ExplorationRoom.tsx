import { useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box, Plate } from "./parts";
import { darkIron, brass, concreteMap } from "./materials";
import { useExplore } from "../state/exploration";
import { SECRETS, type SecretId, type Motif } from "../content/exploration";
import { markData } from "../content/marks";
function Mark({ motif, covered = false }: { motif: Motif; covered?: boolean }) {
  const texture = useMemo(
    () => new THREE.TextureLoader().load(markData(motif, covered)),
    [motif, covered],
  );
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh>
      <planeGeometry args={[0.85, 0.85]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}
function Secret({
  id,
  children,
  mark = true,
  rotation = 0,
}: {
  id: SecretId;
  children?: ReactNode;
  mark?: boolean;
  rotation?: number;
}) {
  const s = SECRETS.find((v) => v.id === id)!;
  const found = useExplore((v) => v.found.includes(id)),
    near = useExplore((v) => v.near === id);
  return (
    <group
      name={`secret-${id}`}
      position={[...s.position]}
      rotation={[0, rotation, 0]}
      onClick={(e) => {
        e.stopPropagation();
        if (useExplore.getState().near === id) useExplore.getState().interact();
      }}
    >
      {children}
      {mark && (
        <group
          position={
            id === "tree"
              ? [0, -0.37, 0]
              : [0, 0, id === "eye" ? 0.67 : id === "clock" ? 0.27 : 0.06]
          }
          rotation={id === "tree" ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}
        >
          <Mark motif={s.motif} covered={!found} />
        </group>
      )}
      <mesh position={[0.48, 0.48, 0.66]}>
        <sphereGeometry args={[0.024, 8, 8]} />
        <meshBasicMaterial
          color={near ? "#ffe7a1" : found ? "#91aa8b" : "#a69971"}
        />
      </mesh>
    </group>
  );
}
export function ExplorationRoom() {
  const wall = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: concreteMap,
        color: "#65786a",
        roughness: 0.95,
      }),
    [],
  );
  const duck = useRef<THREE.Group>(null);
  useEffect(() => () => wall.dispose(), [wall]);
  useFrame(({ clock }) => {
    if (duck.current)
      duck.current.rotation.z = Math.sin(clock.elapsedTime) * 0.05;
  });
  return (
    <group>
      <Box position={[-10.7, 0, 6.5]} size={[0.3, 8, 18]} material={wall} />
      <Box position={[10.7, 0, 6.5]} size={[0.3, 8, 18]} material={wall} />
      <Box position={[0, 0, 14.7]} size={[21.5, 8, 0.3]} material={wall} />
      <Box position={[0, 4.1, 6]} size={[21.5, 0.2, 18]} material={wall} />
      <group position={[0, 0, 14.48]} rotation={[0, Math.PI, 0]}>
        <Plate
          position={[0, 1.2, 0]}
          text={"DEPÓSITO / OBJETOS SEM DONO"}
          size={[4, 0.5]}
        />
      </group>
      {[-7, 7].map((x) => (
        <group key={x}>
          <mesh position={[x, 2.5, 8]}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial
              color="#d9bb83"
              emissive="#e8c18a"
              emissiveIntensity={2}
            />
          </mesh>
          <pointLight
            position={[x, 2.2, 8]}
            color="#e4c99b"
            intensity={48}
            distance={13}
          />
        </group>
      ))}
      <group position={[-8, -2.45, 3]}>
        <Box size={[1.4, 2.2, 1.2]} material={darkIron} />
        {[-0.65, 0, 0.65].map((y) => (
          <Box
            key={y}
            position={[0, y, 0.63]}
            size={[1.2, 0.53, 0.06]}
            material={brass}
          />
        ))}
      </group>
      <Secret id="eye" />
      <group position={[7, -2.5, 11]}>
        <Box size={[1.8, 0.12, 1.2]} material={brass} />
        {[-0.7, 0.7].flatMap((x) =>
          [-0.4, 0.4].map((z) => (
            <Box
              key={`${x}-${z}`}
              position={[x, -0.5, z]}
              size={[0.08, 1, 0.08]}
              material={darkIron}
            />
          )),
        )}
      </group>
      <Secret id="clock">
        <Box size={[1.1, 1.1, 0.5]} material={darkIron} />
      </Secret>
      <group position={[-7, -3.2, 10]}>
        <mesh material={brass}>
          <cylinderGeometry args={[0.7, 0.5, 0.5, 24]} />
        </mesh>
        <mesh position={[0, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.65, 32]} />
          <meshStandardMaterial
            color="#233b2c"
            metalness={0.6}
            roughness={0.15}
          />
        </mesh>
      </group>
      <Secret id="tree" />
      <Secret id="weave" rotation={-Math.PI / 2}>
        <Box size={[1.2, 1.5, 0.05]} material={wall} />
      </Secret>
      <Secret id="sun" rotation={Math.PI}>
        <Box size={[1.3, 1.1, 0.1]} material={brass} />
      </Secret>
      <Secret id="duck" mark={false}>
        <group ref={duck}>
          <mesh scale={[0.3, 0.2, 0.38]}>
            <sphereGeometry args={[1, 18, 14]} />
            <meshStandardMaterial color="#c7a94f" />
          </mesh>
          <mesh position={[0, 0.22, 0.17]}>
            <sphereGeometry args={[0.18, 16, 12]} />
            <meshStandardMaterial color="#c7a94f" />
          </mesh>
          <mesh position={[0, 0.2, 0.36]} scale={[0.12, 0.05, 0.12]}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshStandardMaterial color="#b56c37" />
          </mesh>
          {[-0.1, 0.1].map((x) => (
            <mesh key={x} position={[x, 0.28, 0.29]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshStandardMaterial color="#1d2318" />
            </mesh>
          ))}
        </group>
        <Plate
          text={"FISCAL DE UMIDADE"}
          position={[0, -0.4, 0.35]}
          size={[1, 0.22]}
          fontSize={24}
        />
        <Box position={[0, -0.9, 0]} size={[0.8, 0.1, 0.8]} material={brass} />
      </Secret>
      <group position={[-10.45, -0.4, 10]} rotation={[0, Math.PI / 2, 0]}>
        <Plate
          text={"LAVADOURO\nOBJETOS RECOLHIDOS"}
          position={[0, 0, 0]}
          size={[2, 1]}
          fontSize={30}
        />
      </group>
    </group>
  );
}
