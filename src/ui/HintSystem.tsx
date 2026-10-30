import { useGame } from "../state/store";
import { HINTS } from "../content/archive";
export function HintSystem() {
  const n = useGame((s) => s.hints);
  return (
    <section className="hints">
      <div className="eyebrow">Anotações do operador · {n}/3</div>
      {HINTS.slice(0, n).map((h, i) => (
        <p key={h}>
          {i + 1}. {h}
        </p>
      ))}
      {n < 3 && (
        <button onClick={() => useGame.getState().hint()}>
          Revelar {n ? "próxima" : "primeira"} pista
        </button>
      )}
    </section>
  );
}
