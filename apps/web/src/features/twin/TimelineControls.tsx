import type { DailyState } from "../../api/simulation.types";
import { dayBR } from "../../lib/format";
import { PHASE_LABELS } from "../simulate/labels";

interface Props {
  id: string;
  daily: DailyState[];
  das: number;
  onChange: (das: number) => void;
  playing: boolean;
  onTogglePlay: () => void;
  onUserSeek: () => void;
  compact?: boolean;
}

/** Slider de DAS. Duas instâncias (3D e gráficos) ligadas ao MESMO estado: mover uma move a outra. */
export function TimelineControls({ id, daily, das, onChange, playing, onTogglePlay, onUserSeek, compact }: Props) {
  const first = daily[0]?.das ?? 0;
  const last = daily[daily.length - 1]?.das ?? 0;
  const day = daily.find((d) => d.das === das) ?? daily[0];
  const seek = (v: number) => { onUserSeek(); onChange(Math.min(last, Math.max(first, v))); };
  return (
    <div className={`timeline${compact ? " timeline--compact" : ""}`}>
      <button type="button" className="btn btn--play" onClick={onTogglePlay} aria-pressed={playing}>
        {playing ? "❚❚ Pausar" : "▶ Reproduzir safra"}
      </button>
      <button type="button" className="btn btn--icon timeline__prev" onClick={() => seek(das - 1)} aria-label="Dia anterior" disabled={das <= first}>‹</button>
      <input id={id} type="range" min={first} max={last} step={1} value={das}
             onChange={(e) => seek(Number(e.target.value))}
             aria-label="Dia após a semeadura"
             aria-valuetext={day ? `DAS ${day.das}, ${dayBR(day.day)}, ${PHASE_LABELS[day.ky_phase]}` : undefined} />
      <button type="button" className="btn btn--icon timeline__next" onClick={() => seek(das + 1)} aria-label="Dia seguinte" disabled={das >= last}>›</button>
      <output htmlFor={id} className="timeline__out">
        DAS {das}{day ? ` · ${dayBR(day.day)} · ${PHASE_LABELS[day.ky_phase]}` : ""}
      </output>
    </div>
  );
}
