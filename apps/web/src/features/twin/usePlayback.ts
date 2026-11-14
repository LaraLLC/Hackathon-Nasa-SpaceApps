import { useCallback, useEffect, useRef, useState } from "react";

/** Duração da reprodução completa (plantio → colheita), pedida para o vídeo de 30 s da demo. */
export const PLAYBACK_MS = 15_000;

/**
 * Reproduz a safra avançando `das` (estado compartilhado com gráficos e 3D) em ~15 s.
 * Recomeça do primeiro dia se já estiver no último.
 */
export function usePlayback(days: number[], das: number | null, setDas: (d: number) => void) {
  const [playing, setPlaying] = useState(false);
  const dasRef = useRef(das);
  const setRef = useRef(setDas);
  useEffect(() => { dasRef.current = das; setRef.current = setDas; });

  useEffect(() => {
    if (!playing || days.length < 2) return;
    const msPerDay = PLAYBACK_MS / days.length;
    let idx = days.indexOf(dasRef.current ?? days[0]);
    let restart = idx < 0 || idx >= days.length - 1;
    let last = performance.now();
    let acc = 0;
    let raf = 0;
    const tick = (t: number) => {
      if (restart) { idx = 0; restart = false; setRef.current(days[0]); }
      acc += t - last;
      last = t;
      const steps = Math.floor(acc / msPerDay);
      if (steps > 0) {
        acc -= steps * msPerDay;
        idx = Math.min(days.length - 1, idx + steps);
        setRef.current(days[idx]);
        if (idx >= days.length - 1) { setPlaying(false); return; }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, days]);

  const toggle = useCallback(() => setPlaying((p) => !p), []);
  const stop = useCallback(() => setPlaying(false), []);
  return { playing, toggle, stop };
}
