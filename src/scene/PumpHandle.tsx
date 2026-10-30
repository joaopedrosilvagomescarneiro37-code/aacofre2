import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame } from '../state/store';
import { brass,darkIron } from './materials';
import { Box,Plate } from './parts';
export function PumpHandle(){const pivot=useRef<THREE.Group>(null);useFrame((_,dt)=>{const s=useGame.getState(),active=['pumping','resonance'].includes(s.phase);if(pivot.current)pivot.current.rotation.x=THREE.MathUtils.damp(pivot.current.rotation.x,active?1.1:-.25,8,dt);});return <group position={[2.15,-.3,.98]}>
 <Box size={[.48,1.65,.16]}/><mesh position={[0,0,.12]} rotation={[Math.PI/2,0,0]} material={brass}><cylinderGeometry args={[.19,.19,.15,16]}/></mesh>
 <group ref={pivot}><mesh position={[0,-.35,.23]} material={brass} castShadow><cylinderGeometry args={[.04,.04,.7,12]}/></mesh><mesh position={[0,-.72,.23]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.09,.09,.35,12]}/><meshStandardMaterial color="#4d2018" roughness={.8}/></mesh></group>
 <mesh name="pump-hit" position={[0,-.2,.26]} onClick={e=>{e.stopPropagation();useGame.getState().pump();}} onPointerOver={()=>document.body.style.cursor='pointer'} onPointerOut={()=>document.body.style.cursor='auto'}><boxGeometry args={[.62,1.6,.6]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
 <Plate position={[0,-1.1,.1]} text="BOMBA" size={[.6,.21]} fontSize={120}/>
 <Plate position={[0,-1.47,.1]} text={'SE UM DE NÓS SANGRAR,\nTODOS VOLTAREMOS\nA DORMIR.'} size={[.63,.38]} fontSize={48} onClick={()=>useGame.getState().inspect('lever')}/>
 </group>;}
