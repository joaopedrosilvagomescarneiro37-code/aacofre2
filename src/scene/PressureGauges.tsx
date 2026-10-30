import { useMemo,useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { brass,darkIron,gaugeTexture } from './materials';
import { useGame } from '../state/store';
import { flowDuration } from './WaterFlowRenderer';
function Gauge({x,label,index}:{x:number;label:string;index:number}){const texture=useMemo(()=>gaugeTexture(label),[label]);const needle=useRef<THREE.Group>(null);const current=useRef(0);
 useFrame(({clock},dt)=>{const s=useGame.getState();let v=0;const elapsed=performance.now()/1000-s.epoch;
 if(s.phase==='pumping')v=index===0?Math.min(.42,elapsed*.1):Math.min(.24,elapsed*.025);
 if(['resonance','unlocked','open'].includes(s.phase))v=s.phase==='resonance'?THREE.MathUtils.clamp((elapsed-flowDuration(16))/4,0,.83):.83;
 current.current=THREE.MathUtils.damp(current.current,v,2.8,dt);if(needle.current)needle.current.rotation.z=2.36-current.current*4.72+Math.sin(clock.elapsedTime*31+index)*.009;});
 return <group position={[x,2.2,1]} onClick={e=>{e.stopPropagation();useGame.getState().inspect('gauge');}}>
  <mesh rotation={[Math.PI/2,0,0]} material={darkIron} castShadow><cylinderGeometry args={[.47,.47,.18,40]}/></mesh>
  <mesh position={[0,0,.103]}><circleGeometry args={[.405,40]}/><meshStandardMaterial map={texture} roughness={.77}/></mesh>
  <mesh position={[0,0,.12]} material={brass}><torusGeometry args={[.436,.037,8,48]}/></mesh>
  <group ref={needle} position={[0,0,.128]}><mesh position={[0,.15,0]}><boxGeometry args={[.019,.3,.016]}/><meshStandardMaterial color="#702c1d" metalness={.4}/></mesh></group>
  <mesh position={[0,0,.15]}><sphereGeometry args={[.04,12,8]}/><meshStandardMaterial color="#302a1d" metalness={.8} roughness={.3}/></mesh>
 </group>;
}
export function PressureGauges(){return <><Gauge x={-.92} label="ADMISSÃO" index={0}/><Gauge x={.92} label="RETORNO" index={1}/></>;}
