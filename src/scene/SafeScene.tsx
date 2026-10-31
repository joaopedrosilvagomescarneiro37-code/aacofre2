import { Component, Suspense, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { ArchiveSafe } from "./ArchiveSafe";
import { WalkingCamera } from "./WalkingCamera";
import { ExplorationRoom } from "./ExplorationRoom";
import { useExplore } from "../state/exploration";
import { InspectionCamera } from "./InspectionCamera";
import { Box, Tube } from "./parts";
import { concreteMap, darkIron, brass } from "./materials";
import { useGame } from "../state/store";
function Room() {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: concreteMap,
        color: "#697168",
        roughness: 0.97,
        bumpMap: concreteMap,
        bumpScale: 0.06,
      }),
    [],
  );
  return (
    <group>
      <Box position={[0, 0, -2.2]} size={[23, 18, 0.25]} material={mat} />
      <Box position={[0, -3.62, 0]} size={[30, 0.1, 32]} material={mat} />
      {[-7, -3, 3, 7].map((x) => (
        <Box key={x} position={[x, 0, -2]} size={[0.15, 14, 0.15]} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <group key={i}>
          <Tube
            points={[
              [4.2 + i * 0.36, -3.6, -1.6],
              [4.2 + i * 0.36, 2.8 - i * 0.4, -1.6],
              [6.5, 2.8 - i * 0.4, -1.6],
            ]}
            radius={0.1 + i * 0.012}
            material={darkIron}
          />
        </group>
      ))}
      <mesh
        position={[-1.8, -3.55, 2.2]}
        rotation={[-Math.PI / 2, 0, 0.3]}
        scale={[2.4, 1.2, 1]}
      >
        <circleGeometry args={[1, 40]} />
        <meshPhysicalMaterial
          color="#111e17"
          metalness={0.66}
          roughness={0.12}
          transparent
          opacity={0.6}
        />
      </mesh>
      <mesh
        position={[2.6, -3.54, 0.9]}
        rotation={[-Math.PI / 2, 0, 1.8]}
        scale={[1.5, 0.5, 1]}
      >
        <circleGeometry args={[1, 32]} />
        <meshPhysicalMaterial
          color="#172019"
          metalness={0.65}
          roughness={0.1}
        />
      </mesh>
      <Tube
        points={[
          [-4.2, -3.55, 0],
          [-4.2, 3.1, 0],
          [-3.7, 4, 0],
          [-1.8, 4, -0.5],
        ]}
        radius={0.13}
        material={brass}
      />
      {Array.from({ length: 20 }, (_, i) => (
        <mesh
          key={i}
          position={[Math.sin(i * 51) * 7, -3.5, Math.cos(i * 91) * 4]}
          rotation={[i * 0.53, i, 0]}
        >
          <dodecahedronGeometry args={[0.035 + (i % 5) * 0.022, 0]} />
          <meshStandardMaterial color="#3c4136" roughness={1} />
        </mesh>
      ))}
      <mesh position={[-4.6, 2.9, -1.85]} rotation={[0, 0, 0.12]}>
        <planeGeometry args={[1.1, 1.6]} />
        <meshStandardMaterial color="#5c5b44" roughness={1} />
      </mesh>
    </group>
  );
}
function Atmosphere() {
  const particles = useRef<THREE.Points>(null);
  const light = useRef<THREE.PointLight>(null);
  const failureStart = useRef<number | null>(null);
  const positions = useMemo(
    () =>
      new Float32Array(
        Array.from({ length: 140 * 3 }, (_, i) =>
          i % 3 === 0
            ? (Math.random() - 0.5) * 12
            : i % 3 === 1
              ? (Math.random() - 0.5) * 9
              : Math.random() * 5,
        ),
      ),
    [],
  );
  useFrame(({ clock }) => {
    if (particles.current)
      particles.current.rotation.y = Math.sin(clock.elapsedTime * 0.025) * 0.1;
    if (light.current) {
      const s = useGame.getState();
      if (s.phase !== "failure") failureStart.current = null;
      else if (failureStart.current === null)
        failureStart.current = clock.elapsedTime;
      const age =
        failureStart.current === null
          ? 1
          : clock.elapsedTime - failureStart.current;
      light.current.intensity =
        age < 0.8 ? 5 - Math.sin((age / 0.8) * Math.PI) * 1.2 : 5;
    }
  });
  return (
    <>
      <points ref={particles}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#c5b98e"
          size={0.014}
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </points>
      <pointLight
        ref={light}
        position={[-3.8, 3.9, 3]}
        intensity={5}
        color="#f1c78b"
        distance={14}
      />
    </>
  );
}
class SceneBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="webgl-error">
        <p>Não foi possível iniciar o mecanismo 3D.</p>
        <span>
          Ative a aceleração de hardware do navegador e recarregue a página.
        </span>
        <button onClick={() => location.reload()}>Tentar novamente</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export function SafeScene() {
  const walking = useExplore((s) => s.walking),
    secretOpen = useExplore((s) => !!s.opened);
  const covered = useGame((s) => s.workbench || !!s.inspection);
  return (
    <SceneBoundary>
      <Canvas
        frameloop={covered || secretOpen ? "never" : "always"}
        style={{ pointerEvents: walking ? "auto" : "none" }}
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [4, 0.7, 13], fov: 43, near: 0.1, far: 65 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        onPointerMissed={() => {
          useGame.getState().select(null);
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
      >
        <color attach="background" args={["#111a15"]} />
        <fog attach="fog" args={["#111a15", 16, 38]} />
        <ambientLight intensity={0.75} />
        <hemisphereLight args={["#9baea0", "#28291c", 1.3]} />
        <directionalLight
          position={[-4, 6, 8]}
          intensity={3.2}
          color="#e3d8b1"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
          shadow-normalBias={0.03}
        />
        <spotLight
          position={[4, 4, 3]}
          angle={0.6}
          penumbra={1}
          intensity={34}
          color="#839e88"
          distance={18}
        />
        <Suspense fallback={null}>
          <Environment resolution={64} frames={1}>
            <Lightformer
              position={[-3, 5, 5]}
              scale={[6, 4, 1]}
              intensity={2.4}
              color="#d9c299"
            />
            <Lightformer
              position={[4, 2, -1]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={[4, 6, 1]}
              intensity={1.6}
              color="#77988c"
            />
          </Environment>
          <Room />
          <ArchiveSafe />
          <ExplorationRoom />
          <Atmosphere />
          {walking ? <WalkingCamera /> : <InspectionCamera />}
        </Suspense>
      </Canvas>
    </SceneBoundary>
  );
}
