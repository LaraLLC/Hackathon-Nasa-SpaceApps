import type { DailyState } from "../../api/simulation.types";
import { dayBR, num } from "../../lib/format";
import { PHASE_LABELS } from "../simulate/labels";
import { LED_COLORS, LED_FROM_STRESS, LED_NAMES, LEAF_COLORS, STRESS_LABELS } from "./twinModel";

/** Valores do dia selecionado (o mesmo dia do 3D, do 2D e do cursor dos gráficos). */
export function DayPanel({ day }: { day: DailyState }) {
  const led = LED_FROM_STRESS[day.stress_level];
  return (
    <aside className="day-panel" aria-label="Valores do dia selecionado" aria-live="polite">
      <p className="day-panel__date">{dayBR(day.day)}</p>
      <p className="day-panel__phase">DAS {day.das} · {PHASE_LABELS[day.ky_phase]}</p>
      <dl>
        <dt>Ks</dt>
        <dd>
          <span className="dot" style={{ background: LEAF_COLORS[day.stress_level] }} aria-hidden="true" />
          {num(day.ks, 2)} <span className="muted">· {STRESS_LABELS[day.stress_level]}</span>
        </dd>
        <dt>Água no solo</dt><dd>{num(day.soil_water_fraction * 100)}% <span className="muted">da CAD</span></dd>
        <dt>Chuva</dt><dd>{num(day.precip_mm, 1)} mm</dd>
        <dt>Irrigação</dt><dd>{num(day.irrigation_mm, 1)} mm</dd>
        {day.runoff_mm > 0.05 && <><dt>Enxurrada</dt><dd>{num(day.runoff_mm, 1)} mm <span className="muted">(proxy erosão)</span></dd></>}
        {day.deep_percolation_mm > 0.05 && <><dt>Drenagem</dt><dd>{num(day.deep_percolation_mm, 1)} mm <span className="muted">(proxy lixiviação)</span></dd></>}
        <dt>Raiz · altura</dt><dd>{num(day.root_depth_m * 100)} cm · {num(day.plant_height_m, 2)} m</dd>
        <dt>Cobertura</dt><dd>{num(day.canopy_cover * 100)}%</dd>
        <dt>LED da estaca</dt>
        <dd><span className="dot" style={{ background: LED_COLORS[led] }} aria-hidden="true" />{led} · {LED_NAMES[led]} <span className="muted">(modelo)</span></dd>
      </dl>
      {day.heat_stress
        ? <p className="day-panel__heat" role="note">☀ Calor: Tmax {num(day.tmax_c, 1)} °C na floração (indicador; não entra no rendimento)</p>
        : <p className="muted day-panel__noheat">Sem alerta de calor neste dia.</p>}
      <div className="yield-bar" aria-label={`Potencial de colheita restante: ${num(day.relative_yield_so_far * 100)}%`}>
        <span className="yield-bar__label">Potencial de colheita restante</span>
        <span className="yield-bar__track"><span className="yield-bar__fill" style={{ width: `${day.relative_yield_so_far * 100}%` }} /></span>
        <span className="yield-bar__value">{num(day.relative_yield_so_far * 100)}%</span>
      </div>
      {day.weather_filled && <p className="callout callout--warn">Clima deste dia interpolado.</p>}
    </aside>
  );
}
