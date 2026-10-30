import { create } from 'zustand';
import { INITIAL, TYPES, rotate, solve } from '../logic/HydraulicGraphSolver';
import type { Result } from '../logic/HydraulicGraphSolver';
import { readSave, writeSave } from './PuzzlePersistence';
import { sound } from '../audio/SoundManager';
export type Phase='idle'|'pumping'|'failure'|'resonance'|'unlocked'|'open';
export type Inspect='main'|'entry'|'lever'|'gauge'|'siren'|'map'|'report'|null;
const saved=readSave();const validUnlock=!!saved?.unlocked&&solve(saved.rotations).success;
type State={rotations:number[];phase:Phase;started:boolean;selected:number|null;inspection:Inspect;result:Result|null;epoch:number;hints:number;showLeak:boolean;volume:number;collected:string[];doorAngle:number;help:boolean;storageOK:boolean;attempts:number;doorDragging:boolean;lastTurn:{index:number;delta:number;sequence:number};
start:()=>void;select:(i:number|null)=>void;turn:(i:number,d?:number)=>void;pump:()=>void;setPhase:(p:Phase)=>void;inspect:(i:Inspect)=>void;hint:()=>void;toggleLeak:()=>void;setVolume:(v:number)=>void;openDoor:(a:number)=>void;collect:(s:string)=>void;reset:()=>void;toggleHelp:()=>void;};
export const useGame=create<State>((set,get)=>({rotations:saved?.rotations??[...INITIAL],phase:validUnlock?(saved?.opened?'open':'unlocked'):'idle',started:false,selected:null,inspection:null,result:validUnlock?solve(saved!.rotations):null,epoch:0,hints:saved?.hints??0,showLeak:false,volume:saved?.volume??.45,collected:saved?.collected??[],doorAngle:validUnlock&&saved?.opened?1.9:validUnlock ? .13 : 0,help:false,storageOK:true,attempts:0,doorDragging:false,lastTurn:{index:-1,delta:0,sequence:0},
start:()=>{sound.setVolume(get().volume);void sound.start().catch(()=>{});set({started:true});},
select:(i)=>set({selected:i,inspection:null}),
turn:(i,d=1)=>{if(!['idle','failure'].includes(get().phase))return;const r=[...get().rotations];r[i]=rotate(TYPES[i],r[i],d);sound.gear();set({rotations:r,selected:i,lastTurn:{index:i,delta:d,sequence:get().lastTurn.sequence+1},result:null,phase:'idle'});},
pump:()=>{if(!['idle','failure'].includes(get().phase))return;sound.pump();set({result:solve(get().rotations),phase:'pumping',epoch:performance.now()/1000,inspection:null,attempts:get().attempts+1});},
setPhase:(p)=>{if(p==='failure')sound.leak();if(p==='resonance')sound.unlock();if(p==='unlocked')sound.knock();set({phase:p,...(p==='unlocked'?{doorAngle:.13,selected:null}:{})});},
inspect:(i)=>{if(i&&['siren','map','report'].includes(i)&&get().phase!=='open')return;set({inspection:i,selected:null});},hint:()=>set({hints:Math.min(3,get().hints+1)}),toggleLeak:()=>set({showLeak:!get().showLeak}),
setVolume:(v)=>{sound.setVolume(v);set({volume:v});},openDoor:(a)=>{if(!['open','unlocked'].includes(get().phase))return;set({doorAngle:Math.max(.13,Math.min(2.1,a)),phase:a>.85?'open':get().phase});},
collect:(s)=>set({collected:[...new Set([...get().collected,s])]}),
reset:()=>set({rotations:[...INITIAL],phase:'idle',selected:null,inspection:null,result:null,doorAngle:0,epoch:0,collected:[],hints:0,showLeak:false,attempts:0,doorDragging:false,lastTurn:{index:-1,delta:0,sequence:0}}),toggleHelp:()=>set({help:!get().help})}));
let last='';useGame.subscribe(s=>{const payload={rotations:s.rotations,unlocked:['resonance','unlocked','open'].includes(s.phase),opened:s.phase==='open',hints:s.hints,volume:s.volume,collected:s.collected};const json=JSON.stringify(payload);if(json!==last){last=json;const ok=writeSave(payload);if(s.storageOK!==ok)useGame.setState({storageOK:ok});}});
