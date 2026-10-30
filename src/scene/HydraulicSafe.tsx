import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame } from '../state/store';
import { darkIron,iron,brass,labelTexture } from './materials';
import { Box,Bolt,Plate,Tube } from './parts';
import { SafeDoor } from './SafeDoor';
import { PipeGrid } from './PipeGrid';
import { PumpHandle } from './PumpHandle';
import { PressureGauges } from './PressureGauges';
import { InteriorRewards } from './InteriorRewards';
export function HydraulicSafe(){const lamp=useRef<THREE.Mesh>(null);const valve=useRef<THREE.Group>(null);const warning=useMemo(()=>labelTexture('AGORA ELE SABE\nQUE VOCÊ ESTÁ AQUI.',768,128,'#c6c5a4','#3a4537',31),[]);const phase=useGame(s=>s.phase);
 useFrame((_,dt)=>{const s=useGame.getState(),active=['resonance','unlocked','open'].includes(s.phase);if(lamp.current){const m=lamp.current.material as THREE.MeshStandardMaterial;m.emissiveIntensity=THREE.MathUtils.damp(m.emissiveIntensity,active?3:.025,2,dt);}if(valve.current&&active)valve.current.rotation.z+=dt*.25;});
 return <group>
  <Box position={[0,-3.3,-.2]} size={[5.9,.32,2]} material={darkIron}/>
  <Box position={[0,0,-.8]} size={[5.6,6.5,.2]} material={darkIron}/>
  {[-1,1].map(s=><group key={s}><Box position={[s*2.65,0,-.03]} size={[.26,6.5,1.55]} material={iron}/><Box position={[s*2.3,-3.45,-.1]} size={[.5,.3,1.5]}/><Box position={[s*2.65,0,.78]} size={[.19,6.3,.16]} material={brass}/></group>)}
  {[-1,1].map(y=><Box key={y} position={[0,y*3.16,-.03]} size={[5.25,.22,1.5]} material={iron}/>)}
  {[-2.7,-1.8,-.9,0,.9,1.8,2.7].map(y=><group key={y}><Bolt position={[-2.67,y,.9]}/><Bolt position={[2.67,y,.9]}/></group>)}
  {[-2,0,2].map(y=><mesh key={y} position={[-2.58,y,.8]} material={brass} castShadow><cylinderGeometry args={[.13,.13,.65,16]}/></mesh>)}
  <Tube points={[[-3.1,3.8,-.3],[-3.1,1.12,-.3],[-2.8,1.12,.9],[-1.78,1.12,1.07]]} radius={.095} material={brass}/>
  <Tube points={[[-1.78,-1.52,1.07],[-2.99,-1.52,1.07],[-3.15,-2.8,.1],[-3.15,-3.45,.1]]} radius={.1} material={darkIron}/>
  <InteriorRewards/>
  <SafeDoor>
   <Plate position={[0,2.91,.98]} text="BALNEÁRIO MUNICIPAL  /  ESTAÇÃO 08" size={[3.8,.26]} fontSize={33}/>
   <PressureGauges/>
   <Plate position={[-2.14,1.14,1]} text={'ENTRADA\n→'} size={[.57,.45]} fontSize={71} onClick={()=>useGame.getState().inspect('entry')}/>
   <Plate position={[-2.14,-1.52,1]} text={'RETORNO\n←'} size={[.57,.45]} fontSize={71} onClick={()=>useGame.getState().inspect('entry')}/>
   <PipeGrid/>
   <PumpHandle/>
   <Plate position={[0,-2.4,.98]} text={'DEZESSEIS BOCAS.  UMA SÓ SEDE.\nNENHUMA PODE PERMANECER SECA.'} size={[3.55,.57]} fontSize={37} onClick={()=>useGame.getState().inspect('main')}/>
   <Plate position={[0,1.58,1]} text="PRESSÃO NÃO SIGNIFICA VIDA." size={[2.1,.22]} fontSize={45} onClick={()=>useGame.getState().inspect('gauge')}/>
   <group position={[0,2.18,1]} ref={valve}>{[0,Math.PI/3,Math.PI*2/3].map(a=><mesh key={a} rotation={[0,0,a]} material={brass}><boxGeometry args={[.4,.035,.035]}/></mesh>)}<mesh material={brass}><torusGeometry args={[.22,.028,8,24]}/></mesh></group>
   <mesh ref={lamp} position={[0,2.65,1]}><sphereGeometry args={[.07,16,12]}/><meshStandardMaterial color="#5b2115" emissive="#d33c15" emissiveIntensity={0}/></mesh>
   {['unlocked','open'].includes(phase)&&<mesh position={[0,.55,1.32]}><planeGeometry args={[3,.5]}/><meshStandardMaterial map={warning} transparent opacity={.85}/></mesh>}
  </SafeDoor>
 </group>;
}
