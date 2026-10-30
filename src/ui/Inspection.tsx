import { REPORT } from "../content/archive";
import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer } from "@react-three/drei";
import { Siren } from "../scene/InteriorRewards";
import { useGame } from "../state/store";
import type { Inspect } from "../state/store";
const inscriptions: Record<
  string,
  { title: string; text: string; note: string }
> = {
  main: {
    title: "Instrução do arquivista",
    text: "RECOMPONHA A CÓPIA.\n\nNÃO CONFUNDA A VOZ COM QUEM FALA.",
    note: "As pontas claras prendem a fita aos carretéis. As emendas guardam falas, ruídos e versos. O aparelho confere a continuidade da cópia.",
  },
  gauge: {
    title: "O aparelho",
    text: "COPIADOR MAGNÉTICO DE MANIVELA",
    note: "As faixas remontáveis estão em suportes de papel. Examine as duas faces e as pontas soltas antes de conferir.",
  },
};
export function MaintenanceMap() {
  return (
    <svg
      className="maintenance-map"
      viewBox="0 0 540 390"
      role="img"
      aria-label="Planta esquemática: casa de bombas, túnel técnico e saída de serviço para a mata. Ramal inundado interditado."
    >
      <defs>
        <pattern id="grid" width="18" height="18" patternUnits="userSpaceOnUse">
          <path
            d="M 18 0 L 0 0 0 18"
            fill="none"
            stroke="#77785a"
            strokeWidth=".4"
            opacity=".4"
          />
        </pattern>
      </defs>
      <rect width="540" height="390" fill="url(#grid)" />
      <g fill="none" stroke="#4f5c4e" strokeWidth="2">
        <rect x="35" y="145" width="125" height="110" />
        <path d="M160 177H270V80H405V45M160 214H307V118H440V45" />
        <path
          d="M270 260V320H415V340M307 260V284H415V340"
          strokeDasharray="7 5"
        />
        <path d="M270 214v46m37-46v46" />
        <path d="M390 45h65" />
        <path d="M373 275l44 31m-44 0l44-31" />
        <circle cx="94" cy="193" r="24" />
        <path d="M85 193h18m-9-9v18" />
        <path d="M30 350v-38l-5 9m5-9l5 9" />
      </g>
      <g
        fill="#354639"
        textAnchor="middle"
        fontFamily="monospace"
        fontSize="12"
      >
        <text x="98" y="235">
          CASA DE BOMBAS
        </text>
        <text x="222" y="165">
          TÚNEL TÉCNICO
        </text>
        <text x="422" y="29">
          SAÍDA DE SERVIÇO
        </text>
        <text x="393" y="105">
          PARA A MATA ↑
        </text>
        <text x="391" y="365">
          RAMAL INUNDADO
        </text>
        <text x="30" y="370">
          N
        </text>
      </g>
      <text x="36" y="60" fill="#65533c" fontSize="13" fontFamily="monospace">
        B.M. / SUBSOLO / CROQUI 08-B
      </text>
      <text x="35" y="90" fill="#65533c" fontSize="10" fontFamily="monospace">
        SEM ESCALA · POSIÇÕES APROXIMADAS
      </text>
    </svg>
  );
}
function Document({ kind }: { kind: Inspect }) {
  return (
    <article className="paper">
      {kind === "map" ? (
        <>
          <div className="paper-stamp">ARQUIVO TÉCNICO / 08-B</div>
          <h2>Planta de manutenção</h2>
          <MaintenanceMap />
          <p className="annotation">
            O ramal sul está perdido. A passagem de serviço ainda deve alcançar
            a mata.
          </p>
          <p className="small">
            Esquema sem escala. O mestre pode adaptar distâncias e conexões à
            aventura.
          </p>
        </>
      ) : (
        <>
          <div className="paper-stamp">PAVILHÃO MUNICIPAL · CÓPIA ÚNICA</div>
          <h2>Relatório de interdição</h2>
          <div className="paper-subtitle">PEÇA 7 · CABEÇA DE CERVO</div>
          <div className="report-text">
            {REPORT.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </>
      )}
    </article>
  );
}
export function Inspection() {
  const inspection = useGame((s) => s.inspection),
    collected = useGame((s) => s.collected);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!inspection) return;
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => previous?.focus();
  }, [inspection]);
  if (!inspection) return null;
  const reward = ["siren", "map", "report"].includes(inspection);
  const inscription = inscriptions[inspection];
  return (
    <div
      className="modal-scrim"
      onClick={() => useGame.getState().inspect(null)}
    >
      <div
        ref={ref}
        className={`inspection-modal ${reward ? "reward-modal" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={inscription?.title ?? "Objeto encontrado"}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") useGame.getState().inspect(null);
          if (e.key === "Tab") {
            const els = Array.from(
              ref.current?.querySelectorAll<HTMLElement>(
                'button, input, [tabindex="0"]',
              ) ?? [],
            );
            if (!els.length) return;
            const first = els[0],
              last = els[els.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }}
      >
        <button
          className="modal-close"
          onClick={() => useGame.getState().inspect(null)}
          aria-label="Fechar inspeção"
        >
          ×
        </button>
        {inscription ? (
          <>
            <div className="eyebrow">INSCRIÇÃO / FERRO FUNDIDO</div>
            <h2>{inscription.title}</h2>
            <blockquote>{inscription.text}</blockquote>
            <p className="inscription-note">{inscription.note}</p>
          </>
        ) : inspection === "siren" ? (
          <>
            <div className="eyebrow">EQUIPAMENTO DE EMERGÊNCIA</div>
            <h2>A sirene de manivela</h2>
            <div className="siren-view">
              <Canvas camera={{ position: [1.1, 0.5, 2.7], fov: 40 }}>
                <ambientLight intensity={1.5} />
                <directionalLight position={[2, 3, 5]} intensity={4} />
                <Environment resolution={32} frames={1}>
                  <Lightformer position={[0, 3, 5]} scale={4} intensity={3} />
                </Environment>
                <Siren />
                <OrbitControls
                  enablePan={false}
                  minDistance={1.5}
                  maxDistance={4}
                  autoRotate
                  autoRotateSpeed={0.7}
                />
              </Canvas>
            </div>
            <p>O metal ainda está morno. A manivela resiste, mas gira.</p>
            <p>
              Uma única utilização relevante. O som pode distrair o Cervo ou
              fazê-lo hesitar por alguns instantes, conforme as regras do
              mestre.
            </p>
            <span className="small">
              Arraste para examinar o objeto. A sirene não será tocada aqui.
            </span>
          </>
        ) : (
          <Document kind={inspection} />
        )}
        {reward && (
          <button
            className="primary collect"
            onClick={() => useGame.getState().collect(inspection)}
            disabled={collected.includes(inspection)}
          >
            {collected.includes(inspection)
              ? "✓ Registrado no inventário"
              : "Registrar no inventário"}
          </button>
        )}
      </div>
    </div>
  );
}
