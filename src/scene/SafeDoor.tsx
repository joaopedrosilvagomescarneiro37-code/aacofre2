import { useRef } from 'react';
import type { ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame } from '../state/store';
import { sound } from '../audio/SoundManager';
import { darkIron,brass,iron } from './materials';
import { Box,Tube } from './parts';
export function SafeDoor({children}:{children:ReactNode}){const pivot=useRef<THREE.Group>(null);const drag=useRef<{x:number;angle:number}|null>(null);
 useFrame((_,dt)=>{if(pivot.current)pivot.current.rotation.y=THREE.MathUtils.damp(pivot.current.rotation.y,-useGame.getState().doorAngle,6,dt);});
 const begin=(x:number)=>{const s=useGame.getState();if(!['unlocked','open'].includes(s.phase))return;drag.current={x,angle:s.doorAngle};useGame.setState({doorDragging:true});sound.door();};
 return <group name="door-pivot" ref={pivot} position={[-2.55,0,.65]}><group position={[2.55,0,-.65]}>
  <Box position={[0,0,.7]} size={[5.03,6.25,.32]} material={iron}/>
  <Box position={[0,0,.89]} size={[4.82,6.04,.05]} material={darkIron}/>
  <Box position={[0,-.12,.937]} size={[3.68,3.68,.065]} material={brass}/>
  <Box position={[0,-.12,.981]} size={[3.57,3.57,.04]} material={darkIron}/>
  {children}
  <Tube points={[[2.29,1.95,.97],[2.49,1.95,1.17],[2.49,1.1,1.17],[2.29,1.1,.97]]} radius={.055} material={brass}/>
  <mesh name="door-handle" position={[2.4,1.5,1.1]} onPointerDown={e=>{e.stopPropagation();begin(e.nativeEvent.clientX);if(drag.current)(e.target as Element).setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(!drag.current)return;e.stopPropagation();useGame.getState().openDoor(drag.current.angle+(drag.current.x-e.nativeEvent.clientX)*.012);}} onPointerUp={e=>{if(drag.current){drag.current=null;useGame.setState({doorDragging:false});(e.target as Element).releasePointerCapture(e.pointerId);}}} onPointerCancel={()=>{drag.current=null;useGame.setState({doorDragging:false});}} onPointerOver={()=>document.body.style.cursor=['unlocked','open'].includes(useGame.getState().phase)?'grab':'auto'} onPointerOut={()=>document.body.style.cursor='auto'}>
   <boxGeometry args={[.5,1.1,.5]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/>
  </mesh>
 </group></group>;
}
