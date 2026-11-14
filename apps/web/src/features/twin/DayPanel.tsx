import type { DailyState } from "../../api/simulation.types";
import { useI18n } from "../../i18n/context";
import { dayBR, num } from "../../lib/format";
import { LED_COLORS, LED_FROM_STRESS, LEAF_COLORS } from "./twinModel";

/** Valores do dia selecionado (o mesmo dia do 3D, do 2D e do cursor dos gráficos). */
export function DayPanel({ day }: { day: DailyState }) {
  const { t } = useI18n();
  const D = t.day;
  const led = LED_FROM_STRESS[day.stress_level];
  return (
    <aside className="day-panel" aria-label={D.aria} aria-live="polite">
      <p className="day-panel__date">{dayBR(day.day)}</p>
      <p className="day-panel__phase">DAS {day.das} · {t.phases[day.ky_phase]}</p>
      <dl>
        <dt>Ks</dt>
        <dd>
          <span className="dot" style={{ background: LEAF_COLORS[day.stress_level] }} aria-hidden="true" />
          {num(day.ks, 2)} <span className="muted">· {t.twin.stress_label[day.stress_level]}</span>
        </dd>
        <dt>{D.water}</dt><dd>{num(day.soil_water_fraction * 100)}% <span className="muted">{D.water_unit}</span></dd>
        <dt>{D.rain}</dt><dd>{num(day.precip_mm, 1)} mm</dd>
        <dt>{D.irr}</dt><dd>{num(day.irrigation_mm, 1)} mm</dd>
        {day.runoff_mm > 0.05 && <><dt>{D.runoff}</dt><dd>{num(day.runoff_mm, 1)} mm <span className="muted">{D.runoff_note}</span></dd></>}
        {day.deep_percolation_mm > 0.05 && <><dt>{D.drain}</dt><dd>{num(day.deep_percolation_mm, 1)} mm <span className="muted">{D.drain_note}</span></dd></>}
        <dt>{D.root_h}</dt><dd>{num(day.root_depth_m * 100)} cm · {num(day.plant_height_m, 2)} m</dd>
        <dt>{D.cover}</dt><dd>{num(day.canopy_cover * 100)}%</dd>
        <dt>{D.led}</dt>
        <dd><span className="dot" style={{ background: LED_COLORS[led] }} aria-hidden="true" />{led} · {t.twin.led_names[led]} <span className="muted">{t.twin.model}</span></dd>
      </dl>
      {day.heat_stress
        ? <p className="day-panel__heat" role="note">{D.heat(num(day.tmax_c, 1))}</p>
        : <p className="muted day-panel__noheat">{D.no_heat}</p>}
      <div className="yield-bar" aria-label={`${D.yield_left}: ${num(day.relative_yield_so_far * 100)}%`}>
        <span className="yield-bar__label">{D.yield_left}</span>
        <span className="yield-bar__track"><span className="yield-bar__fill" style={{ width: `${day.relative_yield_so_far * 100}%` }} /></span>
        <span className="yield-bar__value">{num(day.relative_yield_so_far * 100)}%</span>
      </div>
      {day.weather_filled && <p className="callout callout--warn">{D.interp}</p>}
    </aside>
  );
}
