import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { SECRETS } from "../content/exploration";
import { markData } from "../content/marks";
import { useExplore, walkInput, clearWalkInput } from "../state/exploration";
import { useGame } from "../state/store";
import { sound } from "../audio/SoundManager";
function Hold({
  label,
  children,
  axis,
  value,
}: {
  label: string;
  children: ReactNode;
  axis: keyof typeof walkInput;
  value: number;
}) {
  return (
    <button
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        walkInput[axis] = value;
      }}
      onPointerUp={(e) => {
        walkInput[axis] = 0;
        e.currentTarget.blur();
      }}
      onPointerCancel={() => (walkInput[axis] = 0)}
      onLostPointerCapture={() => (walkInput[axis] = 0)}
      onKeyDown={(e) => {
        if (e.code === "Space" || e.code === "Enter") {
          e.preventDefault();
          walkInput[axis] = value;
        }
      }}
      onKeyUp={() => (walkInput[axis] = 0)}
      onBlur={() => (walkInput[axis] = 0)}
    >
      {children}
    </button>
  );
}
export function ExplorationUI() {
  const near = useExplore((s) => s.near),
    opened = useExplore((s) => s.opened),
    found = useExplore((s) => s.found),
    note = useExplore((s) => s.note),
    storageOK = useExplore((s) => s.storageOK);
  const muted = useGame((s) => s.muted);
  const dialog = useRef<HTMLDivElement>(null),
    interaction = useRef<HTMLButtonElement>(null);
  const secret = SECRETS.find((s) => s.id === opened);
  const known = !!secret && found.includes(secret.id),
    journal = opened === "journal";
  const nearLabel = SECRETS.find((s) => s.id === near)?.title;
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (useExplore.getState().opened) useExplore.getState().close();
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      clearWalkInput();
    };
  }, []);
  useEffect(() => {
    if (opened) dialog.current?.focus();
    else interaction.current?.focus();
  }, [opened]);
  return (
    <>
      <header className="topbar walk-top">
        <div className="identity">
          ÁGUA MORTA<small>PASSEIO PELO DEPÓSITO</small>
        </div>
        <div className="header-tools">
          <button onClick={useExplore.getState().book}>
            Caderno ({found.length})
          </button>
          <button onClick={useGame.getState().toggleMute}>
            {muted ? "Ativar som" : "Silenciar"}
          </button>
        </div>
      </header>
      <div className="walk-notes">
        <span className="eyebrow">OBJETOS ESQUECIDOS</span>
        <p>Há marcas sob o que deixaram aqui.</p>
        <small>Procure marcas nos objetos. Aproxime-se e pressione E para examinar.</small>
      </div>
      <div className="walk-reticle" aria-hidden="true">
        ·
      </div>
      <div className="walk-interact">
        <button
          ref={interaction}
          disabled={!near}
          className={near ? "primary" : ""}
          onClick={useExplore.getState().interact}
        >
          {near
            ? `E · ${nearLabel}`
            : "Aproxime-se de um objeto e olhe para ele"}
        </button>
        <p>
          WASD: andar · arraste: olhar · ← →: virar · E: examinar · Esc: voltar
        </p>
      </div>
      <div className="walk-pad" aria-label="Movimento">
        <Hold label="Virar à esquerda" axis="turn" value={1}>
          ↶
        </Hold>
        <Hold label="Andar para frente" axis="forward" value={1}>
          ↑
        </Hold>
        <Hold label="Virar à direita" axis="turn" value={-1}>
          ↷
        </Hold>
        <Hold label="Andar à esquerda" axis="side" value={-1}>
          ←
        </Hold>
        <Hold label="Andar para trás" axis="forward" value={-1}>
          ↓
        </Hold>
        <Hold label="Andar à direita" axis="side" value={1}>
          →
        </Hold>
      </div>
      {opened && (
        <div className="modal-scrim" onClick={useExplore.getState().close}>
          <div
            className={`dialog secret-dialog ${journal ? "journal" : ""}`}
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-label={journal ? "Caderno de observações" : secret?.title}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                const els = Array.from(
                    dialog.current?.querySelectorAll<HTMLElement>(
                      "button:not(:disabled),textarea",
                    ) ?? [],
                  ),
                  first = els[0],
                  last = els.at(-1);
                if (
                  e.shiftKey &&
                  (document.activeElement === first ||
                    document.activeElement === dialog.current)
                ) {
                  e.preventDefault();
                  last?.focus();
                } else if (
                  !e.shiftKey &&
                  (document.activeElement === last ||
                    document.activeElement === dialog.current)
                ) {
                  e.preventDefault();
                  first?.focus();
                }
              }
            }}
          >
            <button
              className="close"
              aria-label="Fechar observação"
              onClick={useExplore.getState().close}
            >
              ×
            </button>
            {journal ? (
              <>
                <div className="eyebrow">CÓPIAS E SUPOSIÇÕES</div>
                <h2>O que se repete?</h2>
                <p>
                  As marcas estão copiadas abaixo. O que as liga ainda é uma
                  pergunta.
                </p>
                <div className="journal-grid">
                  {SECRETS.filter((s) => found.includes(s.id)).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => useExplore.getState().view(s.id)}
                    >
                      <img
                        src={markData(s.motif)}
                        alt={`Desenho observado: ${s.title}`}
                      />
                      <span>{s.title}</span>
                    </button>
                  ))}
                </div>
                {!found.length && (
                  <p>
                    Por enquanto, só papel em branco. Examine os objetos da
                    sala.
                  </p>
                )}
                {found.includes("tree") && found.includes("eye") && (
                  <p className="comparison">
                    Na bacia e no armário, o crescente tem a mesma abertura. Os
                    suportes e o desgaste são diferentes.
                  </p>
                )}
                {found.includes("clock") && found.includes("weave") && (
                  <p className="comparison">
                    A marca de quatro partes aparece no relógio e no tecido. A
                    costura continua para além do pedaço que sobrou.
                  </p>
                )}
                <label htmlFor="theories">Suas teorias</label>
                <textarea
                  id="theories"
                  maxLength={2000}
                  value={note}
                  onChange={(e) =>
                    useExplore.getState().setNote(e.target.value)
                  }
                  placeholder="Quem deixou essas marcas? O que vale comparar?"
                />
                <small>
                  {storageOK
                    ? "Anotações salvas neste navegador."
                    : "O navegador não permitiu salvar; anotações somente nesta sessão."}{" "}
                  Não são uma senha para o cofre.
                </small>
              </>
            ) : (
              secret && (
                <>
                  <div className="eyebrow">UM OBJETO NO DEPÓSITO</div>
                  <h2>{secret.title}</h2>
                  <div className="secret-evidence">
                    <img
                      src={markData(secret.motif, !known)}
                      alt={
                        known
                          ? `Marca revelada em ${secret.title}`
                          : "Uma cobertura oculta parte do desenho"
                      }
                    />
                    <p>{secret.before}</p>
                  </div>
                  {known ? (
                    <p className="secret-reveal" role="status">
                      {secret.after}
                    </p>
                  ) : (
                    <button
                      className="primary"
                      onClick={() => {
                        useExplore.getState().discover();
                        if (secret.id === "duck")
                          sound.tone(480, 0.18, 0.12, "triangle", 230);
                        else sound.gear();
                      }}
                    >
                      {secret.action}
                    </button>
                  )}
                  {known && (
                    <button onClick={useExplore.getState().book}>
                      Comparar no caderno
                    </button>
                  )}
                </>
              )
            )}
            <button onClick={useExplore.getState().close}>
              Continuar explorando
            </button>
          </div>
        </div>
      )}
    </>
  );
}
