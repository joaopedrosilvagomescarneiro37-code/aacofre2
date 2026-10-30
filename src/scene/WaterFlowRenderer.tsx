import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame } from '../state/store';
import { TYPES } from '../logic/HydraulicGraphSolver';
import type { Step } from '../logic/HydraulicGraphSolver';
import { cellPosition, directedCurve, portVector } from './pipeGeometry';
const SEGMENTS=48,RADIAL=8,STEP=.43;
export const flowDuration=(n:number)=>Math.max(1,n*STEP);
const vertex=`varying vec2 vUv;varying vec3 vP;void main(){vUv=uv;vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragment=`uniform float time;uniform float live;varying vec2 vUv;varying vec3 vP;void main(){float pulse=sin(vUv.x*66.-time*5.)*.5+.5;float strand=pow(max(0.,sin(vUv.y*19.+sin(vUv.x*24.-time*2.))),12.);float ripple=sin(vUv.x*145.-time*13.)*.5+.5;vec3 color=mix(vec3(.012,.028,.019),vec3(.14,.22,.13),pulse*.45+strand*.4);color+=vec3(.42,.42,.25)*pow(ripple,18.)*.18;gl_FragColor=vec4(color*live,1.);}`;
function WaterSegment({step,order}:{step:Step;order:number}){
 const rotation=useGame(s=>s.rotations[step.index]);const geo=useMemo(()=>new THREE.TubeGeometry(directedCurve(step,TYPES[step.index],rotation),SEGMENTS,.091,RADIAL,false),[step.index,step.entry,rotation]);
 const material=useMemo(()=>new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms:{time:{value:0},live:{value:1}}}),[]);const bubbles=useRef<THREE.InstancedMesh>(null);const dummy=useMemo(()=>new THREE.Object3D(),[]);const path=useMemo(()=>directedCurve(step,TYPES[step.index],rotation),[step.index,rotation,step.entry]);
 useFrame(({clock})=>{const s=useGame.getState();const elapsed=performance.now()/1000-s.epoch;const end=flowDuration(s.result?.steps.length??0);let amount=THREE.MathUtils.clamp((elapsed-order*STEP)/STEP,0,1);
 if(s.phase==='failure')amount*=THREE.MathUtils.clamp(1-(elapsed-end-2.2)/3.2,0,1);
 if(s.phase==='idle')amount=0;if(['resonance','unlocked','open'].includes(s.phase))amount=1;
 geo.setDrawRange(0,Math.floor(amount*SEGMENTS)*RADIAL*6);material.uniforms.time.value=s.phase==='failure'?-clock.elapsedTime:clock.elapsedTime;material.uniforms.live.value=['resonance','unlocked','open'].includes(s.phase)?1:.8+Math.sin(clock.elapsedTime*1.7)*.12;
 if(bubbles.current)for(let i=0;i<4;i++){const t=(clock.elapsedTime*.25+i*.231)%1;dummy.position.copy(path.getPoint(t));dummy.position.z+=.018;dummy.scale.setScalar(t<amount?.012+i*.002:0);dummy.updateMatrix();bubbles.current.setMatrixAt(i,dummy.matrix);bubbles.current.instanceMatrix.needsUpdate=true;}});
 return <group position={cellPosition(step.index)}><mesh name={`water-${step.index}`} geometry={geo} material={material}/><instancedMesh ref={bubbles} args={[undefined,undefined,4]}><sphereGeometry args={[1,5,5]}/><meshStandardMaterial color="#c7b979" emissive="#7b8960" emissiveIntensity={.35} metalness={.2} roughness={.15}/></instancedMesh></group>;
}
function Leak(){const result=useGame(s=>s.result);const ref=useRef<THREE.InstancedMesh>(null);const dummy=useMemo(()=>new THREE.Object3D(),[]);const pos=useMemo(()=>{if(!result?.leak)return new THREE.Vector3();return new THREE.Vector3(...cellPosition(result.leak.index)).add(portVector(result.leak.port));},[result]);
 useFrame(({clock})=>{if(!ref.current)return;const s=useGame.getState(),t=performance.now()/1000-s.epoch;const end=flowDuration(s.result?.steps.length??0);const active=!!result?.leak&&['pumping','failure'].includes(s.phase)&&t>end&&t<end+3.2;
 for(let i=0;i<38;i++){const age=(clock.elapsedTime*1.5+i*.073)%1;dummy.position.copy(pos);const dir=result?.leak?.port??2;const v=portVector(dir).normalize();dummy.position.addScaledVector(v,age*.45);dummy.position.z+=age*.55;dummy.position.y-=age*age*.9;dummy.position.x+=Math.sin(i*13.6)*age*.065;dummy.scale.set(active?.012:0,active?.02:0,active?.012:0);dummy.updateMatrix();ref.current.setMatrixAt(i,dummy.matrix);}ref.current.instanceMatrix.needsUpdate=true;});
 return <instancedMesh name="leak-emitter" ref={ref} args={[undefined,undefined,38]}><sphereGeometry args={[1,5,4]}/><meshStandardMaterial color="#51674d" metalness={.5} roughness={.12}/></instancedMesh>;
}
export function WaterFlowRenderer(){const result=useGame(s=>s.result);const leakHelp=useGame(s=>s.showLeak);const marker=useRef<THREE.Mesh>(null);
 useFrame(({clock})=>{const s=useGame.getState();if(s.phase==='pumping'&&s.result){const elapsed=performance.now()/1000-s.epoch;if(elapsed>flowDuration(s.result.steps.length)+.35)s.setPhase(s.result.success?'resonance':'failure');}
 if(s.phase==='resonance'&&s.result&&performance.now()/1000-s.epoch>flowDuration(16)+5)s.setPhase('unlocked');if(marker.current){const m=marker.current.material as THREE.MeshBasicMaterial;m.opacity=.3+Math.sin(clock.elapsedTime*3)*.2;}});
 return <>{result?.steps.map((step,i)=><WaterSegment key={`${step.index}-${step.entry}`} step={step} order={i}/>)}<Leak/>{leakHelp&&result?.leak&&<mesh ref={marker} position={new THREE.Vector3(...cellPosition(result.leak.index)).add(portVector(result.leak.port))}><sphereGeometry args={[.14,16,12]}/><meshBasicMaterial color="#e4c48b" wireframe transparent opacity={.5}/></mesh>}</>;
}
