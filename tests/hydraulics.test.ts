import { describe, expect, it } from 'vitest';
import { TYPES, INITIAL, ports, rotate, solve, enumerateSolutions } from '../src/logic/HydraulicGraphSolver';
import { decodeSave, writeSave, readSave, SAVE_KEY } from '../src/state/PuzzlePersistence';
import { vi } from 'vitest';
// Gabarito somente em testes, nunca importado pelo jogo.
const ANSWER=[2,1,1,2,0,0,1,3,0,3,0,2,1,1,1,3];
const ROUTE=[0,4,8,9,5,1,2,3,7,6,10,11,15,14,13,12];
describe('Circuito hidráulico real',()=>{
 it('roda cada abertura exatamente 90 graus',()=>{for(const t of TYPES)for(let r=0;r<4;r++){const a=ports(t,r),b=ports(t,r+1);expect(b).toEqual(a.map(p=>(p+1)%4));}});
 it('retos têm duas orientações funcionais equivalentes a 180 graus',()=>{expect(rotate('straight',1)).toBe(0);expect(new Set([0,1,2,3].map(r=>ports('straight',r).sort().join())).size).toBe(2);});
 it('curvas têm quatro orientações distintas',()=>{expect(rotate('curve',3)).toBe(0);expect(new Set([0,1,2,3].map(r=>ports('curve',r).sort().join())).size).toBe(4);});
 it('começa desconectado e TODAS as peças começam diferentes do gabarito',()=>{expect(solve(INITIAL).success).toBe(false);INITIAL.forEach((r,i)=>expect(ports(TYPES[i],r).sort()).not.toEqual(ports(TYPES[i],ANSWER[i]).sort()));});
 it('não atravessa a entrada fechada',()=>{const b=[...ANSWER];b[0]=0;expect(solve(b).steps).toHaveLength(0);expect(solve(b).leak).toEqual({index:0,port:3});});
 it('interrompe no primeiro vizinho incompatível e localiza a fuga',()=>{const b=[...ANSWER];b[4]=1;const r=solve(b);expect(r.steps.map(s=>s.index)).toEqual([0]);expect(r.leak).toEqual({index:0,port:2});expect(r.success).toBe(false);});
 it('nenhum circuito parcial abre o cofre',()=>{const b=[...ANSWER];b[8]=2;expect(solve(b).success).toBe(false);expect(solve(b).steps.length).toBeLessThan(16);});
 it('ciclos isolados não produzem falso sucesso',()=>{const b=[...INITIAL];b[6]=1;b[7]=2;b[10]=0;b[11]=3;expect(solve(b).success).toBe(false);expect(solve(b).steps.length).toBeLessThan(16);});
 it('segue o caminho pedido, sem trocar distribuição ou posição',()=>{const r=solve(ANSWER);expect(r.success).toBe(true);expect(r.steps.map(s=>s.index)).toEqual(ROUTE);expect(new Set(r.steps.map(s=>s.index)).size).toBe(16);});
 it('rejeita cada mutação de uma peça da única solução',()=>{for(let i=0;i<16;i++){const b=[...ANSWER];b[i]=rotate(TYPES[i],b[i]);expect(solve(b).success).toBe(false);}});
 it('verificação independente: enumera todas as rotas simples e respeita o tipo de cada peça',()=>{
  let valid=0;const expected:number[][]=[];
  const walk=(i:number,entry:number,seen:Set<number>,route:number[])=>{const nextSeen=new Set(seen).add(i),nextRoute=[...route,i];
   for(let exit=0;exit<4;exit++){if(exit===entry)continue;const diff=(exit-entry+4)%4;
    if(TYPES[i]==='straight'?diff!==2:diff===2)continue;
    if(i===12&&exit===3){if(nextSeen.size===16){valid++;expected.push(nextRoute);}continue;}
    const row=Math.floor(i/4),col=i%4;
    const n=exit===0?(row>0?i-4:-1):exit===1?(col<3?i+1:-1):exit===2?(row<3?i+4:-1):(col>0?i-1:-1);
    if(n>=0&&!nextSeen.has(n))walk(n,(exit+2)%4,nextSeen,nextRoute);
   }
  };walk(0,3,new Set(),[]);expect(valid).toBe(1);expect(expected[0]).toEqual(ROUTE);
 });
 it('enumera exaustivamente os domínios, com poda de vazamentos, e comprova solução única',()=>{const r=enumerateSolutions();expect(r.solutions).toEqual([ANSWER]);console.log('Soluções completas:',r.solutions.length,'orientações examinadas após poda:',r.assignments);});
});
describe('Persistência e reinício',()=>{
 const memory=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>memory.get(k)??null,setItem:(k:string,v:string)=>memory.set(k,v)});
 it('grava e recupera progresso, som, pistas e recompensas',()=>{const s={rotations:[...ANSWER],unlocked:true,opened:true,hints:2,volume:.2,collected:['map']};expect(writeSave(s)).toBe(true);expect(readSave()).toEqual(s);});
 it('recusa JSON corrompido, versões incorretas e orientações inválidas',()=>{expect(decodeSave('{')).toBe(null);expect(decodeSave('{"version":9}')).toBe(null);expect(decodeSave(JSON.stringify({version:1,rotations:Array(16).fill(9)}))).toBe(null);});
 it('reiniciar restaura as 16 peças, a porta e as dicas',async()=>{memory.delete(SAVE_KEY);const {useGame}=await import('../src/state/store');useGame.getState().reset();expect(useGame.getState().rotations).toEqual(INITIAL);expect(useGame.getState().phase).toBe('idle');expect(useGame.getState().hints).toBe(0);expect(readSave()?.opened).toBe(false);});
 it('bloqueia giro durante bombeamento e porta antes de vencer',async()=>{const {useGame}=await import('../src/state/store');useGame.getState().reset();useGame.getState().inspect('siren');expect(useGame.getState().inspection).toBe(null);useGame.getState().openDoor(2);expect(useGame.getState().phase).toBe('idle');useGame.getState().pump();const before=[...useGame.getState().rotations];useGame.getState().turn(0);expect(useGame.getState().rotations).toEqual(before);useGame.getState().reset();});
});
