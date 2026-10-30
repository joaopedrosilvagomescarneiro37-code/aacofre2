import { useLayoutEffect,useRef } from 'react';
import * as THREE from 'three';
import { PipeModule } from './PipeModule';
import { Condensation, AntlerReflection } from './Condensation';
import { WaterFlowRenderer } from './WaterFlowRenderer';
import { cellPosition, portVector } from './pipeGeometry';
import type { Port } from '../logic/HydraulicGraphSolver';
import { darkIron } from './materials';
/** Fixed welded coupling seats at all four sides of each module. One draw call. */
function CouplingSeats(){const ref=useRef<THREE.InstancedMesh>(null);useLayoutEffect(()=>{const dummy=new THREE.Object3D();if(!ref.current)return;for(let i=0;i<16;i++)for(let p=0;p<4;p++){dummy.position.set(...cellPosition(i)).add(portVector(p as Port));dummy.position.z-=.01;dummy.rotation.set(p%2?0:Math.PI/2,p%2?Math.PI/2:0,0);dummy.updateMatrix();ref.current.setMatrixAt(i*4+p,dummy.matrix);}ref.current.instanceMatrix.needsUpdate=true;},[]);return <instancedMesh ref={ref} args={[undefined,undefined,64]} material={darkIron}><torusGeometry args={[.127,.019,6,12]}/></instancedMesh>;}
export function PipeGrid(){return <group><CouplingSeats/>{Array.from({length:16},(_,i)=><PipeModule key={i} index={i}/>)}<WaterFlowRenderer/><Condensation/><AntlerReflection/></group>;}
