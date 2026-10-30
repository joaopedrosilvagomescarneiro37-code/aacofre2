import { TYPES } from '../logic/HydraulicGraphSolver';
export const SAVE_KEY='agua-morta:v1';
export type Save={rotations:number[];unlocked:boolean;opened:boolean;hints:number;volume:number;collected:string[]};
export function decodeSave(raw:string|null):Save|null{try{if(!raw)return null;const v=JSON.parse(raw);if(v.version!==1||!Array.isArray(v.rotations)||v.rotations.length!==16||v.rotations.some((r:unknown,i:number)=>!Number.isInteger(r)||Number(r)<0||Number(r)>=(TYPES[i]==='curve'?4:2)))return null;
return {rotations:v.rotations,unlocked:v.unlocked===true,opened:v.opened===true,hints:Math.max(0,Math.min(3,Number(v.hints)||0)),volume:Math.max(0,Math.min(1,Number.isFinite(v.volume)?v.volume:.45)),collected:Array.isArray(v.collected)?v.collected.filter((s:unknown)=>typeof s==='string'):[]};}catch{return null;}}
export function readSave():Save|null{try{return decodeSave(localStorage.getItem(SAVE_KEY));}catch{return null;}}
export function writeSave(s:Save){try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:1,...s}));return true;}catch{return false;}}
