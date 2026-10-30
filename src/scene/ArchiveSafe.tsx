import { darkIron, iron, brass } from "./materials";
import { Box, Bolt, Tube } from "./parts";
import { SafeDoor } from "./SafeDoor";
import { ArchiveMechanism } from "./ArchiveMechanism";

import { InteriorRewards } from "./InteriorRewards";
export function ArchiveSafe() {
  return (
    <group>
      <Box
        position={[0, -3.3, -0.2]}
        size={[5.9, 0.32, 2]}
        material={darkIron}
      />
      <Box position={[0, 0, -0.8]} size={[5.6, 6.5, 0.2]} material={darkIron} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Box
            position={[s * 2.65, 0, -0.03]}
            size={[0.26, 6.5, 1.55]}
            material={iron}
          />
          <Box position={[s * 2.3, -3.45, -0.1]} size={[0.5, 0.3, 1.5]} />
          <Box
            position={[s * 2.65, 0, 0.78]}
            size={[0.19, 6.3, 0.16]}
            material={brass}
          />
        </group>
      ))}
      {[-1, 1].map((y) => (
        <Box
          key={y}
          position={[0, y * 3.16, -0.03]}
          size={[5.25, 0.22, 1.5]}
          material={iron}
        />
      ))}
      {[-2.7, -1.8, -0.9, 0, 0.9, 1.8, 2.7].map((y) => (
        <group key={y}>
          <Bolt position={[-2.67, y, 0.9]} />
          <Bolt position={[2.67, y, 0.9]} />
        </group>
      ))}
      {[-2, 0, 2].map((y) => (
        <mesh key={y} position={[-2.58, y, 0.8]} material={brass} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.65, 16]} />
        </mesh>
      ))}
      <Tube
        points={[
          [-3.1, 3.8, -0.3],
          [-3.1, 1.12, -0.3],
          [-2.8, 1.12, 0.9],
          [-1.78, 1.12, 1.07],
        ]}
        radius={0.095}
        material={brass}
      />
      <Tube
        points={[
          [-1.78, -1.52, 1.07],
          [-2.99, -1.52, 1.07],
          [-3.15, -2.8, 0.1],
          [-3.15, -3.45, 0.1],
        ]}
        radius={0.1}
        material={darkIron}
      />
      <InteriorRewards />
      <SafeDoor>
        <ArchiveMechanism />
      </SafeDoor>
    </group>
  );
}
