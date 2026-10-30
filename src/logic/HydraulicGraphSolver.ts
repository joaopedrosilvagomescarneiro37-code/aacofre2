/** N,E,S,W clockwise; UI translates E/W to L/O. No renderer dependencies. */
export type Port = 0|1|2|3;
export type Kind = 'curve'|'straight';
export const TYPES: readonly Kind[] = ['curve','curve','straight','curve','straight','straight','curve','curve','curve','curve','curve','curve','straight','straight','straight','curve'];
export const INITIAL = [0,2,0,0,1,1,2,1,1,0,2,0,0,0,0,1];
export const opposite=(p:Port):Port=>((p+2)%4) as Port;
export function ports(kind:Kind,rotation:number):[Port,Port]{const r=((rotation%4)+4)%4;return [r as Port,((r+(kind==='curve'?1:2))%4) as Port];}
export const rotate=(kind:Kind,r:number,delta=1)=>((r+delta)%(kind==='curve'?4:2)+(kind==='curve'?4:2))%(kind==='curve'?4:2);
export function neighbor(i:number,p:Port):number|null{const row=Math.floor(i/4),col=i%4;if(p===0)return row?i-4:null;if(p===1)return col<3?i+1:null;if(p===2)return row<3?i+4:null;return col?i-1:null;}
export type Step={index:number;entry:Port;exit:Port};
export type Result={steps:Step[];success:boolean;reason:'complete'|'leak'|'cycle'|'incomplete';leak:{index:number;port:Port}|null};
export function solve(rotations:readonly number[]):Result{
 if(rotations.length!==16)throw new Error('16 módulos obrigatórios');
 const steps:Step[]=[];const visited=new Set<number>();let index=0,entry:Port=3;
 for(let n=0;n<=16;n++){
  if(visited.has(index))return {steps,success:false,reason:'cycle',leak:null};
  const pp=ports(TYPES[index],rotations[index]);
  if(!pp.includes(entry))return {steps,success:false,reason:'leak',leak:steps.length?{index:steps[steps.length-1].index,port:steps[steps.length-1].exit}:{index:0,port:3}};
  visited.add(index);const out=pp[0]===entry?pp[1]:pp[0];steps.push({index,entry,exit:out});
  if(index===12&&out===3)return {steps,success:steps.length===16,reason:steps.length===16?'complete':'incomplete',leak:null};
  const next=neighbor(index,out);
  if(next===null)return {steps,success:false,reason:'leak',leak:{index,port:out}};
  index=next;entry=opposite(out);
 }
 return {steps,success:false,reason:'cycle',leak:null};
}
/** Exhaustive domain enumeration with sound pruning: borders and already assigned neighbors.
 * Pruned subtrees provably leak; no successful configuration can be discarded. */
export function enumerateSolutions(){const board:number[]=[];const solutions:number[][]=[];let assignments=0;
 const search=(i:number)=>{if(i===16){if(solve(board).success)solutions.push([...board]);return;}
  for(let r=0;r<(TYPES[i]==='curve'?4:2);r++){assignments++;const pp=ports(TYPES[i],r);let ok=true;
   for(const p of [0,1,2,3] as Port[]){const next=neighbor(i,p);const on=pp.includes(p);if(next===null){if(on!==((i===0||i===12)&&p===3)){ok=false;break;}}else if(next<i&&on!==ports(TYPES[next],board[next]).includes(opposite(p))){ok=false;break;}}
   if(ok){board[i]=r;search(i+1);}
  }
 };search(0);return {solutions,assignments};
}
