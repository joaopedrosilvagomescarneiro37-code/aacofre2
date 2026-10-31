import { useExplore } from "../state/exploration";
import { ExplorationUI } from "./ExplorationUI";
import { useShallow } from "zustand/react/shallow";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useGame } from "../state/store";
import { FRAGMENTS } from "../content/archive";
import timing from "../content/audioTiming.json";
import { HintSystem } from "./HintSystem";
import { Inspection } from "./Inspection";
import { ArchivePlayer } from "../audio/ArchivePlayer";
const useControls = () =>
  useGame(useShallow(({ playTime, ...state }) => state));
function Dialog({
  children,
  title,
  onClose,
  wide = false,
}: {
  children: ReactNode;
  title: string;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const old = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => old?.focus();
  }, []);
  return (
    <div className="modal-scrim" onClick={onClose}>
      <section
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`dialog ${wide ? "workbench" : ""}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            onClose();
          }
          if (e.key === "Tab") {
            const els = Array.from(
              ref.current?.querySelectorAll<HTMLElement>(
                'button:not(:disabled),input,[tabindex="0"]',
              ) ?? [],
            );
            if (!els.length) return;
            const first = els[0],
              last = els[els.length - 1];
            if (
              e.shiftKey &&
              (document.activeElement === first ||
                document.activeElement === ref.current)
            ) {
              e.preventDefault();
              last.focus();
            } else if (
              !e.shiftKey &&
              (document.activeElement === last ||
                document.activeElement === ref.current)
            ) {
              e.preventDefault();
              first.focus();
            }
          }
        }}
      >
        <button
          className="close"
          aria-label={`Fechar ${title}`}
          onClick={onClose}
        >
          ×
        </button>
        {children}
      </section>
    </div>
  );
}
function Transport() {
  const g = useControls();
  const locked = ["open", "unlocked"].includes(g.phase);
  return (
    <div className="transport">
      {g.phase === "playing" ? (
        <>
          <button onClick={g.pause}>{g.paused ? "Retomar" : "Pausar"}</button>
          <button onClick={g.stop}>Parar</button>
          <button disabled={g.paused} onClick={g.next}>
            Próxima faixa
          </button>
        </>
      ) : (
        <>
          <button disabled={locked} onClick={() => g.play()}>
            ▶ Ouvir montagem
          </button>
          <button
            className="primary"
            disabled={locked}
            onClick={() => g.play(undefined, true)}
          >
            Conferir cópia ↗
          </button>
        </>
      )}
    </div>
  );
}
function Playback() {
  const id = useGame((s) => s.playhead),
    t = useGame((s) => s.playTime),
    paused = useGame((s) => s.paused),
    error = useGame((s) => s.audioError);
  if (!id) return null;
  const f = FRAGMENTS[id],
    a = timing[id];
  const verse = t >= a.verseStart;
  return (
    <div className="playback" aria-label="Transcrição da reprodução">
      <div className="eyebrow">
        {paused ? "PAUSADO" : verse ? "CANTIGA AO FUNDO" : "DEPOIMENTO"} ·{" "}
        {f.label}
      </div>
      <progress aria-label="Progresso da faixa" value={t} max={a.duration} />
      <p className={verse ? "verse" : ""}>{verse ? f.verse : f.text}</p>
      <small>Vestígio sonoro: {f.sound}</small>
      {error && (
        <small>
          O áudio não pôde tocar. A transcrição continua disponível; use Próxima
          faixa para avançar.
        </small>
      )}
    </div>
  );
}
function Bench() {
  const g = useControls(),
    [side, setSide] = useState<"front" | "back">("front"),
    [drag, setDrag] = useState<number | null>(null);
  const index = g.selected ?? 0,
    id = g.order[index],
    f = FRAGMENTS[id],
    locked = !["idle", "failure"].includes(g.phase),
    revealed = g.revealed.includes(id);
  useEffect(() => setSide("front"), [id]);
  return (
    <Dialog wide title="Mesa de emendas" onClose={() => g.setWorkbench(false)}>
      <div className="eyebrow">COPIADOR MAGNÉTICO · CAER SIDDI</div>
      <h2>Mesa de emendas</h2>
      <p className="bench-intro">
        Uma voz pede que abram. Reconstitua o que veio antes e depois.
      </p>
      <div className="bench-grid">
        <div className="rail">
          <div className="rail-heading">
            CARRETEL DE ORIGEM <span>↓ LEITURA</span>
          </div>
          <ol aria-label="Ordem das faixas">
            {g.order.map((fid, i) => (
              <li
                key={fid}
                className={`${index === i ? "selected" : ""} ${g.playhead === fid ? "reading" : ""} ${drag === i ? "dragging" : ""}`}
                draggable={!locked}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", String(i));
                  e.dataTransfer.effectAllowed = "move";
                  setDrag(i);
                }}
                onDragEnd={() => setDrag(null)}
                onDragOver={(e) => {
                  if (!locked) e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (locked) return;
                  const raw = e.dataTransfer.getData("text/plain");
                  if (/^\d$/.test(raw)) g.move(Number(raw), i);
                  setDrag(null);
                }}
              >
                <span className="slot">{String(i + 1).padStart(2, "0")}</span>
                <button
                  aria-pressed={index === i}
                  onClick={() => g.select(i)}
                  aria-label={`Inspecionar ${FRAGMENTS[fid].label}`}
                >
                  <span className="perforations" aria-hidden="true" />
                  <strong>{FRAGMENTS[fid].label}</strong>
                  <small>{FRAGMENTS[fid].text.slice(0, 49)}…</small>
                  <span className="perforations" aria-hidden="true" />
                </button>
                <span className="grip" aria-hidden="true">
                  ⠿
                </span>
              </li>
            ))}
          </ol>
          <div className="rail-heading">CARRETEL DE RECOLHIMENTO</div>
          <p className="tiny">
            Arraste uma faixa para mudar sua posição. Ou selecione e use os
            botões.
          </p>
        </div>
        <div className="inspection-desk">
          <div className="desk-heading">
            <span>FAIXA EM EXAME</span>
            <button
              onClick={() => setSide(side === "front" ? "back" : "front")}
            >
              ↶ Virar para {side === "front" ? "o verso" : "a frente"}
            </button>
          </div>
          <article className={`splice-paper ${side}`}>
            <div className="eyebrow">
              {side === "front" ? "TRANSCRIÇÃO DA VOZ" : "VERSO DO SUPORTE"}
            </div>
            <h3>{f.label}</h3>
            {side === "front" ? (
              <>
                <p className="testimony">“{f.text}”</p>
                <div className="song">
                  <span>Cantiga ao fundo · transcrição</span>
                  <p>{f.verse}</p>
                </div>
                <p className="edge-note">{f.front}</p>
              </>
            ) : (
              <>
                <p className="testimony">{f.back}</p>
                <div className="loose-tape">
                  <span>Uma ponta de adesivo está levantada.</span>
                  <button onClick={() => g.reveal(id)} disabled={revealed}>
                    {revealed ? "Emenda levantada" : "Levantar a emenda"}
                  </button>
                </div>
                {revealed && <p className="handwritten">{f.hidden}</p>}
              </>
            )}
            <div className="sound-trace">
              <span aria-hidden="true">⌁ ⌁ ⌁</span>
              <p>{f.sound}</p>
            </div>
          </article>
          <div className="splice-actions">
            <button
              disabled={locked || index === 0}
              onClick={() => g.move(index, index - 1)}
            >
              ↑ Mover antes
            </button>
            <button
              disabled={locked || index === 6}
              onClick={() => g.move(index, index + 1)}
            >
              ↓ Mover depois
            </button>
            <button disabled={locked} onClick={() => g.play(id)}>
              ▶ Ouvir só esta
            </button>
          </div>
          <p className="tiny">
            As palavras não mudam quando você move a faixa. Compare também as
            emendas, o ambiente e os versos.
          </p>
          <Playback />
        </div>
      </div>
      <div className="bench-footer">
        <p role="status" aria-live="polite">
          {g.message}
        </p>
        <Transport />
      </div>
    </Dialog>
  );
}
export function GameUI() {
  const walking = useExplore((s) => s.walking);
  const g = useControls(),
    [menu, setMenu] = useState<"help" | "sound" | "reset" | null>(null);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const s = useGame.getState();
      if (useExplore.getState().walking) return;
      if (e.key === "Escape") {
        if (s.inspection) {
          s.inspect(null);
          return;
        }
        if (menu) {
          setMenu(null);
          return;
        }
        s.setWorkbench(false);
        return;
      }
      if (!s.started || s.inspection || menu) return;
      const target = e.target as HTMLElement;
      if (target.matches("input,textarea,select")) return;
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const i = s.selected ?? 0,
          d = e.key === "ArrowUp" ? -1 : 1;
        if (e.altKey) s.move(i, i + d);
        else s.select(Math.max(0, Math.min(6, i + d)));
      }
      if (e.code === "Space" && !target.matches("button")) {
        e.preventDefault();
        s.phase === "playing" ? s.pause() : s.play();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [menu]);
  if (g.started && walking)
    return (
      <>
        <ArchivePlayer />
        <ExplorationUI />
      </>
    );
  return (
    <>
      <ArchivePlayer />
      <div className="film-grain" />
      <div className="vignette" />
      <header className="topbar">
        <div className="identity">
          <span className="archive-mark" aria-hidden="true">
            ◉
          </span>
          <span>
            ÁGUA MORTA<small>ARQUIVO DA INTERDIÇÃO</small>
          </span>
        </div>
        <div className="header-tools">
          {g.started && (
            <button
              className="explore-button"
              onClick={() => {
                g.stop();
                g.inspect(null);
                g.setWorkbench(false);
                useExplore.getState().enter();
              }}
            >
              Explorar a sala
            </button>
          )}
          <span className="local-save">
            {g.storageOK ? "SALVO NESTE NAVEGADOR" : "SEM SALVAMENTO LOCAL"}
          </span>
          <button
            aria-label={g.muted ? "Ativar som" : "Silenciar"}
            onClick={g.toggleMute}
          >
            {g.muted ? "Som desligado" : "Som ligado"}
          </button>
          <button onClick={() => setMenu("sound")} aria-label="Ajustar volume">
            Volume
          </button>
          <button onClick={() => setMenu("help")}>Ajuda</button>
        </div>
      </header>
      {!g.started ? (
        <section className="intro">
          <div className="eyebrow">UM AVISO REMONTADO</div>
          <h1>
            O arquivo da
            <br />
            <em>água morta.</em>
          </h1>
          <p className="intro-quote">
            A voz é conhecida.
            <br />A ordem está errada.
          </p>
          <p className="intro-description">
            Sete emendas. Uma noite interrompida.
            <br />
            Alguém deixou o chamado antes da advertência.
          </p>
          <button className="primary start" onClick={g.start}>
            Iniciar inspeção <span>↗</span>
          </button>
          <div className="intro-footnote">
            UMA EXPERIÊNCIA 3D · SEM LIMITE DE TEMPO
            <br />
            Voz em português · todas as pistas também em texto
          </div>
        </section>
      ) : (
        <>
          <div className="scene-caption">
            <span className="eyebrow">SUBSOLO DO PAVILHÃO</span>
            <span>CÓPIA DE SEGURANÇA / PEÇA 7</span>
          </div>
          <div className="status" role="status" aria-live="polite">
            <i />
            {g.phase === "open"
              ? "O arquivo está ao alcance. Examine o que foi guardado."
              : g.phase === "unlocked"
                ? "O ferrolho cedeu. Puxe a porta."
                : g.message}
          </div>
          {g.phase === "open" ? (
            <aside className="reward-tray">
              <div className="eyebrow">DOCUMENTOS E EQUIPAMENTO</div>
              {[
                ["siren", "Sirene de manivela"],
                ["map", "Planta de manutenção"],
                ["report", "Relatório de interdição"],
              ].map(([id, title]) => (
                <button
                  key={id}
                  onClick={() => g.inspect(id as "siren" | "map" | "report")}
                >
                  {title}
                  <span>{g.collected.includes(id) ? "✓" : "↗"}</span>
                </button>
              ))}
            </aside>
          ) : !g.workbench && g.phase === "playing" ? (
            <div className="scene-playback">
              <Playback />
              <Transport />
            </div>
          ) : null}
          <footer className="controlbar">
            <div>
              <span className="eyebrow">
                {g.phase === "open"
                  ? "ARQUIVO RECUPERADO"
                  : "INSPEÇÃO DO MECANISMO"}
              </span>
              <p>
                {["open", "unlocked"].includes(g.phase)
                  ? "Puxe o manípulo para a esquerda ou use o botão."
                  : "Toque nas faixas. Arraste o fundo para examinar o aparelho."}
              </p>
            </div>
            <div className="primary-controls">
              {["unlocked", "open"].includes(g.phase) ? (
                <button
                  className="primary"
                  onClick={() => g.openDoor(g.doorAngle + 0.4)}
                >
                  {g.phase === "open" ? "Abrir mais a porta" : "Puxar porta"} ↗
                </button>
              ) : (
                <button
                  className="primary"
                  onClick={() => {
                    if (g.selected === null) g.select(0);
                    g.setWorkbench(true);
                  }}
                >
                  Examinar as sete emendas ↗
                </button>
              )}
              <button onClick={() => setMenu("help")}>Consultar pistas</button>
            </div>
          </footer>
        </>
      )}
      <div className="bottom-serial">
        CAER SIDDI<span>NÃO CONFUNDA A VOZ COM QUEM FALA.</span>
      </div>
      {g.workbench && g.started && <Bench />}
      {menu === "help" && (
        <Dialog title="Manual e pistas" onClose={() => setMenu(null)}>
          <div className="eyebrow">MANUAL DO OPERADOR</div>
          <h2>Reconstitua o aviso.</h2>
          <p>
            As sete faixas pertencem à mesma cópia. Mova seus suportes até
            recuperar a continuidade da voz, dos sons e da cantiga.
          </p>
          <p>
            Examine a frente e o verso. As pontas soltas podem esconder
            anotações. A transcrição reproduz todas as pistas necessárias,
            inclusive os vestígios sonoros.
          </p>
          <p>
            “Ouvir montagem” é uma prévia. “Conferir cópia” faz a leitura final
            e testa o ferrolho. Você pode pausar, parar ou avançar cada faixa,
            sem perder a montagem.
          </p>
          <p className="keyboard">
            Teclado: ↑ ↓ selecionam · Alt + ↑ ↓ movem · Espaço reproduz/pausa
            quando o foco não está num botão · Esc fecha.
          </p>
          <HintSystem />
          <button className="reset-link" onClick={() => setMenu("reset")}>
            Reiniciar arquivo…
          </button>
        </Dialog>
      )}
      {menu === "sound" && (
        <Dialog title="Volume" onClose={() => setMenu(null)}>
          <div className="eyebrow">REPRODUÇÃO</div>
          <h2>Escute de perto.</h2>
          <label htmlFor="volume">Volume · {Math.round(g.volume * 100)}%</label>
          <input
            id="volume"
            type="range"
            min="0"
            max="1"
            step=".01"
            value={g.volume}
            onChange={(e) => g.setVolume(Number(e.target.value))}
          />
          <button onClick={g.toggleMute}>
            {g.muted ? "Ativar som" : "Silenciar tudo"}
          </button>
          <p>
            Voz sintética em português, gravada para esta experiência. A cantiga
            é recitada. Nenhum alarme alto ou microfone.
          </p>
        </Dialog>
      )}
      {menu === "reset" && (
        <Dialog title="Confirmar reinício" onClose={() => setMenu(null)}>
          <h2>Reiniciar o arquivo?</h2>
          <p>
            A montagem, as descobertas, as dicas e o inventário serão apagados
            neste navegador.
          </p>
          <div className="transport">
            <button onClick={() => setMenu(null)}>Continuar aqui</button>
            <button
              className="primary"
              onClick={() => {
                g.reset();
                setMenu(null);
              }}
            >
              Reiniciar
            </button>
          </div>
        </Dialog>
      )}
      <Inspection />
    </>
  );
}
