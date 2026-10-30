import { useEffect, useRef } from "react";
import { useGame } from "../state/store";
import timing from "../content/audioTiming.json";
/** A single mounted player owns the clock. No timeout can unlock a stale/reset game. */
export function ArchivePlayer() {
  const audio = useRef<HTMLAudioElement | null>(null),
    fallback = useRef(false),
    elapsed = useRef(0),
    last = useRef(0);
  const id = useGame((s) => s.playhead),
    epoch = useGame((s) => s.epoch),
    paused = useGame((s) => s.paused),
    volume = useGame((s) => s.volume),
    muted = useGame((s) => s.muted);
  useEffect(() => {
    if (!id) return;
    const a = new Audio(`/audio/${id}.mp3`);
    audio.current = a;
    fallback.current = false;
    elapsed.current = 0;
    let live = true,
      raf = 0;
    last.current = performance.now();
    const fail = () => {
      if (!live) return;
      fallback.current = true;
      useGame.setState({ audioError: true });
    };
    a.volume = useGame.getState().muted ? 0 : useGame.getState().volume;
    a.addEventListener("error", fail);
    void a.play().catch(fail);
    const frame = (now: number) => {
      if (!live) return;
      const s = useGame.getState();
      if (s.playhead !== id || s.epoch !== epoch) return;
      const dt = Math.min((now - last.current) / 1000, 0.15);
      last.current = now;
      if (!s.paused) {
        if (fallback.current) elapsed.current += dt;
        else elapsed.current = a.currentTime;
        s.tick(elapsed.current);
        if (
          a.ended ||
          (fallback.current && elapsed.current >= timing[id].duration)
        ) {
          s.next();
          return;
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      live = false;
      cancelAnimationFrame(raf);
      a.pause();
      a.removeEventListener("error", fail);
      a.src = "";
      if (audio.current === a) audio.current = null;
    };
  }, [id, epoch]);
  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    if (paused) a.pause();
    else if (!fallback.current)
      void a.play().catch(() => {
        fallback.current = true;
        useGame.setState({ audioError: true });
      });
  }, [paused]);
  useEffect(() => {
    if (audio.current) audio.current.volume = muted ? 0 : volume;
  }, [volume, muted]);
  return null;
}
