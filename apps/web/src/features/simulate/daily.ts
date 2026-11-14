// Helpers de daily[] compartilhados entre gráficos (Etapa 2) e gêmeo 3D (Etapa 3).
import type { DailyState, KyPhase } from "../../api/simulation.types";

export type RepKey = "typical" | "dry";

export interface DailyRow extends DailyState {
  /** Limiar de estresse em fração de água: Ks < 1 abaixo dele (1 − RAW/TAW). Derivado no front. */
  stress_threshold: number;
}

export function toRows(daily: DailyState[]): DailyRow[] {
  return daily.map((d) => ({ ...d, stress_threshold: d.taw_mm ? Math.round((1 - d.raw_mm / d.taw_mm) * 1000) / 1000 : 0 }));
}

export interface PhaseSpan { phase: KyPhase; start: number; end: number }

export function phaseSpans(rows: DailyState[]): PhaseSpan[] {
  const out: PhaseSpan[] = [];
  for (const r of rows) {
    const last = out[out.length - 1];
    if (last && last.phase === r.ky_phase) last.end = r.das;
    else out.push({ phase: r.ky_phase, start: r.das, end: r.das });
  }
  return out;
}

/** "2018/19" quando o ciclo cruza o ano; "2018" quando não. */
export function seasonLabel(daily: DailyState[]): string {
  if (!daily.length) return "—";
  const y0 = daily[0].day.slice(0, 4);
  const y1 = daily[daily.length - 1].day.slice(0, 4);
  return y0 === y1 ? y0 : `${y0}/${y1.slice(2)}`;
}
