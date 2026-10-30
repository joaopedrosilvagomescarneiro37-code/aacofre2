import * as THREE from 'three';
import type { Kind, Port, Step } from '../logic/HydraulicGraphSolver';
export const SPACING=.88;
export const cellPosition=(i:number):[number,number,number]=>[(i%4-1.5)*SPACING,1.12-Math.floor(i/4)*SPACING,1.07];
export const portVector=(p:Port)=>new THREE.Vector3(...([[0,.44,0],[.44,0,0],[0,-.44,0],[-.44,0,0]][p] as [number,number,number]));
export function curve(kind:Kind,rotation=0,entry?:Port){const points=kind==='straight'?[new THREE.Vector3(0,.44,0),new THREE.Vector3(0,-.44,0)]:Array.from({length:21},(_,i)=>{const a=Math.PI+(i/20)*Math.PI/2;return new THREE.Vector3(.44+Math.cos(a)*.44,.44+Math.sin(a)*.44,0);});
 points.forEach(p=>p.applyAxisAngle(new THREE.Vector3(0,0,1),-rotation*Math.PI/2));
 if(entry!==undefined&&points[0].distanceTo(portVector(entry))>.01)points.reverse();return new THREE.CatmullRomCurve3(points);
}
export function directedCurve(step:Step,kind:Kind,rotation:number){return curve(kind,rotation,step.entry);}
