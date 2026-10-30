import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame } from '../state/store';
import { TYPES } from '../logic/HydraulicGraphSolver';
import { cellPosition, curve } from './pipeGeometry';
import { Box, Bolt } from './parts';
import { brass, darkIron } from './materials';
export function PipeModule({index}:{index:number}){
 const rotation=useGame(s=>s.rotations[index]),selected=useGame(s=>s.selected===index),phase=useGame(s=>s.phase);const group=useRef<THREE.Group>(null);const target=useRef(-rotation*Math.PI/2);const prev=useRef(rotation);const current=useRef(target.current);
 const baseCurve=useMemo(()=>curve(TYPES[index]),[index]);
 const geo=useMemo(()=>new THREE.TubeGeometry(baseCurve,32,.115,12,false),[baseCurve]);
 const highlight=useMemo(()=>new THREE.MeshStandardMaterial({color:'#c3a97a',metalness:.75,roughness:.5,emissive:'#a79262',emissiveIntensity:.1}),[]);
 useFrame((_,dt)=>{if(rotation!==prev.current){let d=(rotation-prev.current+4)%4;if(d>2)d-=4;const turn=useGame.getState().lastTurn;if(turn.index===index)d=turn.delta;target.current-=d*Math.PI/2;prev.current=rotation;}current.current=THREE.MathUtils.damp(current.current,target.current,14,dt);if(group.current)group.current.rotation.z=current.current;});
 const pp=TYPES[index]==='curve'?[0,1]:[0,2];const disabled=!['idle','failure'].includes(phase);
 return <group name={`module-${index}`} position={cellPosition(index)}>
  <Box position={[0,0,-.095]} size={[.83,.83,.09]} material={selected?highlight:darkIron}/>
  {[-1,1].flatMap(x=>[-1,1].map(y=><Bolt key={`${x}${y}`} position={[x*.34,y*.34,-.025]}/>))}
  <group name={`pipe-rotor-${index}`} ref={group} rotation={[0,0,current.current]}>
   <mesh geometry={geo} castShadow><meshPhysicalMaterial color="#95a691" metalness={.13} roughness={.15} transparent opacity={.28} depthWrite={false} side={THREE.DoubleSide} clearcoat={1}/></mesh>
   <mesh><tubeGeometry args={[baseCurve,32,.062,8,false]}/><meshStandardMaterial color="#101d15" roughness={.22} metalness={.5}/></mesh>
   {pp.map((p)=>{const pos=([[0,.35,0],[.35,0,0],[0,-.35,0],[0,0,0]][p]) as [number,number,number];return <group key={p} position={pos} rotation={[0,0,p%2?Math.PI/2:0]}>
    <mesh material={brass} castShadow><cylinderGeometry args={[.155,.155,.12,16,1,true]}/></mesh>
    {[-.06,.06].map(y=><mesh key={y} position={[0,y,0]} rotation={[Math.PI/2,0,0]} material={brass}><torusGeometry args={[.135,.024,6,16]}/></mesh>)}
   </group>;})}
  </group>
  <mesh name={`module-hit-${index}`} position={[0,0,.045]} onClick={e=>{e.stopPropagation();if(disabled)return;const g=useGame.getState();if(g.selected===index)g.turn(index);else g.select(index);}} onPointerOver={()=>{if(!disabled)document.body.style.cursor='pointer';}} onPointerOut={()=>document.body.style.cursor='auto'}>
   <boxGeometry args={[.84,.84,.28]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/>
  </mesh>
  {selected&&<mesh position={[0,-.365,.01]}><boxGeometry args={[.22,.014,.012]}/><meshBasicMaterial color="#e2ce99"/></mesh>}
 </group>;
}
