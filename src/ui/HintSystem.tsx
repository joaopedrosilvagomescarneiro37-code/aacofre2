import { useGame } from '../state/store';
export const HINTS=[
 'A água não deve apenas chegar ao destino. Observe quantas bocas permanecem secas.',
 'Cada tubo possui duas aberturas. Uma ligação exige que as duas peças apontem uma para a outra.',
 'Comece pela entrada e pelo retorno. As peças nas bordas possuem menos possibilidades. Depois, faça as conexões avançarem para o centro.'
];
export function HintSystem(){const hints=useGame(s=>s.hints),show=useGame(s=>s.showLeak);return <div className="hints"><div className="eyebrow">MEMÓRIAS DO OPERADOR <span>{hints} / 3</span></div>{hints===0&&<p>Se o silêncio não ajudar, consulte as anotações.</p>}{HINTS.slice(0,hints).map((h,i)=><p key={h}><span className="hint-number">0{i+1}</span>{h}</p>)}{hints<3&&<button className="text-button" onClick={()=>useGame.getState().hint()}>Revelar {hints?'próxima':'primeira'} pista <span>↗</span></button>}{hints>=2&&<label className="check"><input type="checkbox" checked={show} onChange={()=>useGame.getState().toggleLeak()}/>Marcar o primeiro vazamento após testar</label>}</div>;}
