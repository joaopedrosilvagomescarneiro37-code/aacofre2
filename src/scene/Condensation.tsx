import { useMemo,useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { cellPosition } from './pipeGeometry';
/** Sparse drops on the glass; restrained so ports remain readable. */
export function Condensation(){const ref=useRef<THREE.InstancedMesh>(null);const drops=useMemo(()=>Array.from({length:48},(_,i)=>{const c=cellPosition(Math.floor(i/3));return {x:c[0]+Math.sin(i*71)*.24,y:c[1]+Math.cos(i*31)*.16,z:c[2]+.123,s:.007+(i%4)*.002};}),[]);const obj=useMemo(()=>new THREE.Object3D(),[]);
 useFrame(({clock})=>{if(!ref.current)return;for(let i=0;i<drops.length;i++){const d=drops[i];obj.position.set(d.x,d.y-((clock.elapsedTime*.002+i*.021)% .08),d.z);obj.scale.set(d.s,d.s*1.7,d.s*.5);obj.updateMatrix();ref.current.setMatrixAt(i,obj.matrix);}ref.current.instanceMatrix.needsUpdate=true;});
 return <instancedMesh ref={ref} args={[undefined,undefined,48]}><sphereGeometry args={[1,6,5]}/><meshPhysicalMaterial color="#a5b8a4" metalness={.1} roughness={.13} transparent opacity={.28} depthWrite={false}/></instancedMesh>;
}
export function AntlerReflection(){const mat=useMemo(()=>new THREE.MeshBasicMaterial({color:'#080f0b',transparent:true,opacity:0,depthWrite:false}),[]);const segments=useMemo(()=>{const a:[number,number,number][][]=[];for(const s of [-1,1]){a.push([[s*.12,-.13,1.2],[s*.25,.1,1.2],[s*.48,.3,1.2],[s*.65,.64,1.2]]);a.push([[s*.26,.1,1.2],[s*.24,.45,1.2],[s*.36,.65,1.2]]);a.push([[s*.48,.3,1.2],[s*.73,.38,1.2],[s*.83,.59,1.2]]);}return a.map(p=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p.map(v=>new THREE.Vector3(...v as [number,number,number]))),12,.027,5,false));},[]);
 useFrame(({clock})=>{const t=clock.elapsedTime%53;mat.opacity=t>43&&t<44?Math.sin((t-43)*Math.PI)*.16:0;});return <group position={[0,.05,0]}>{segments.map((g,i)=><mesh key={i} geometry={g} material={mat}/>)}</group>;
}
