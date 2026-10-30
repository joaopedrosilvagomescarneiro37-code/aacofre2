import * as THREE from 'three';
import { useGame } from '../state/store';
import { brass,darkIron,paperMap,metalMap,labelTexture } from './materials';
import { Box,Tube } from './parts';
import { useMemo } from 'react';
export function Siren({scale=1}:{scale?:number}){return <group scale={scale}>
 <mesh rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.34,.34,.42,32]}/><meshStandardMaterial color="#8d3020" map={metalMap} metalness={.65} roughness={.57}/></mesh>
 <mesh position={[0,0,.24]} rotation={[Math.PI/2,0,0]} material={darkIron}><cylinderGeometry args={[.29,.29,.04,32]}/></mesh>
 {Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return <mesh key={i} position={[Math.cos(a)*.18,Math.sin(a)*.18,.272]} rotation={[0,0,a]} material={brass}><boxGeometry args={[.22,.022,.028]}/></mesh>;})}
 <mesh position={[0,0,.28]} material={brass}><torusGeometry args={[.305,.033,8,32]}/></mesh>
 <mesh position={[0,0,.29]} material={brass}><sphereGeometry args={[.06,12,8]}/></mesh>
 <Tube points={[[0,.24,-.08],[0,.46,-.08],[.28,.46,-.08],[.28,.36,-.08]]} radius={.035} material={brass}/>
 <Tube points={[[.3,0,0],[.5,0,0],[.5,-.22,0],[.65,-.22,0]]} radius={.028} material={brass}/>
 <mesh position={[.66,-.22,.02]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.05,.05,.19,12]}/><meshStandardMaterial color="#2b231a"/></mesh>
 <Box position={[-.13,-.42,0]} size={[.07,.28,.1]} material={brass}/><Box position={[.13,-.42,0]} size={[.07,.28,.1]} material={brass}/><Box position={[0,-.56,0]} size={[.64,.06,.46]} material={darkIron}/>
 </group>;}
export function InteriorRewards(){const phase=useGame(s=>s.phase);const mapMaterial=useMemo(()=>new THREE.MeshStandardMaterial({color:'#afa781',map:paperMap}),[]);const reportTex=useMemo(()=>labelTexture('RELATÓRIO 08\nESTAÇÃO DE BOMBEAMENTO\n____________________\nA água voltou a circular\nàs 03h17.\n\nNão havia ninguém.',512,640,'#37382c','#c3b994',28),[]);return <group name="interior-rewards" visible={phase==='open'||phase==='unlocked'}>
 <Box position={[0,-1.95,-.05]} size={[4.6,.12,1.05]}/><Box position={[0,.1,-.05]} size={[4.6,.08,.94]}/>
 <pointLight position={[0,2,.2]} color="#e5b16a" intensity={9} distance={6}/>
 <group position={[-1.1,-1.3,.15]} onClick={e=>{e.stopPropagation();useGame.getState().inspect('siren');}} onPointerOver={()=>document.body.style.cursor='pointer'} onPointerOut={()=>document.body.style.cursor='auto'}><Siren scale={1.05}/><mesh><boxGeometry args={[1.55,1.5,.65]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh></group>
 <group position={[.95,.96,.05]} rotation={[0,0,-.09]} onClick={e=>{e.stopPropagation();useGame.getState().inspect('map');}}>
  <Box size={[1.5,1.4,.02]} material={mapMaterial}/>
  {[[-.4,.2,.01],[.15,.2,.01],[.15,-.25,.01]].map((p,i)=><Box key={i} position={p as [number,number,number]} size={i===1?[.025,.9,.01]:[.65,.025,.01]} material={brass}/>)}
 </group>
 <mesh position={[1,-1.12,.3]} rotation={[0,0,.12]} onClick={e=>{e.stopPropagation();useGame.getState().inspect('report');}}><planeGeometry args={[1.05,1.35]}/><meshStandardMaterial map={reportTex} roughness={1} side={THREE.DoubleSide}/></mesh>
 </group>;}
