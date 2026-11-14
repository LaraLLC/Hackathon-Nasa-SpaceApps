// Gráficos diários do ano representativo. Regras (skill dataviz):
// - nunca dois eixos Y: fração/Ks (0–1) e chuva/irrigação (mm) são DOIS gráficos com o mesmo eixo X (DAS);
// - cor segue a entidade (slots fixos, validados com validate_palette.js em claro/escuro);
// - legenda com nomes + tabela equivalente (alívio para o aqua < 3:1 no tema claro).
import { useMemo, type MouseEvent } from "react";
import {
  Bar, CartesianGrid, ComposedChart, Line, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { SimulationResponse } from "../../api/simulation.types";
import { useI18n } from "../../i18n/context";
import { dayBR, num } from "../../lib/format";
import { useReducedMotion } from "../../lib/useReducedMotion";
import { phaseSpans, seasonLabel, toRows, type DailyRow, type PhaseSpan, type RepKey } from "./daily";

const Y_AXIS_W = 44;
const MARGIN = { top: 8, right: 12, bottom: 0, left: 0 };

export function RepToggle({ response, rep, onChange }: { response: SimulationResponse; rep: RepKey; onChange: (r: RepKey) => void }) {
  const { t } = useI18n();
  const rs = response.representative_seasons;
  if (!rs) return null;
  return (
    <div className="segmented" role="radiogroup" aria-label={t.chart.rep_aria}>
      {(["typical", "dry"] as const).map((k) => (
        <button key={k} type="button" role="radio" aria-checked={rep === k}
                className={`segmented__btn${rep === k ? " is-active" : ""}`} onClick={() => onChange(k)}>
          {k === "typical" ? t.chart.typical : t.chart.dry} <span className="muted">({seasonLabel(rs[k].daily)})</span>
        </button>
      ))}
    </div>
  );
}

function DailyTooltip({ active, das, byDas }: { active?: boolean; das: unknown; byDas: Map<number, DailyRow> }) {
  const { t } = useI18n();
  const C = t.chart;
  const r = active ? byDas.get(Number(das)) : undefined;
  if (!r) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__head">{dayBR(r.day)} · DAS {r.das} · {t.phases[r.ky_phase]}</p>
      <dl>
        <dt><i className="sw sw--water" />{C.tt_water}</dt><dd>{num(r.soil_water_fraction * 100)}{C.tt_water_unit}</dd>
        <dt><i className="sw sw--ks" />Ks</dt><dd>{num(r.ks, 2)} · {C.stress[r.stress_level]}</dd>
        <dt><i className="sw sw--rain" />{C.tt_rain}</dt><dd>{num(r.precip_mm, 1)} mm</dd>
        <dt><i className="sw sw--irr" />{C.tt_irr}</dt><dd>{num(r.irrigation_mm, 1)} mm</dd>
        {r.runoff_mm > 0 && <><dt>{C.tt_runoff}</dt><dd>{num(r.runoff_mm, 1)} mm</dd></>}
        {r.deep_percolation_mm > 0 && <><dt>{C.tt_drain}</dt><dd>{num(r.deep_percolation_mm, 1)} mm</dd></>}
        {r.heat_stress && <><dt>{C.tt_heat}</dt><dd>{C.tt_heat_val(num(r.tmax_c, 1))}</dd></>}
        {r.weather_filled && <><dt>{C.tt_weather}</dt><dd>{C.tt_interp}</dd></>}
      </dl>
    </div>
  );
}

function PhaseStrip({ spans, first, last }: { spans: PhaseSpan[]; first: number; last: number }) {
  const { t } = useI18n();
  const total = last - first + 1;
  return (
    <div className="phase-strip" style={{ marginLeft: Y_AXIS_W + MARGIN.left, marginRight: MARGIN.right }} aria-hidden="true">
      {spans.map((s, i) => (
        <div key={`${s.phase}-${s.start}`} className={`phase-strip__seg${i % 2 ? " alt" : ""}`}
             style={{ flexBasis: `${((s.end - s.start + 1) / total) * 100}%` }} title={`${t.phases[s.phase]}: DAS ${s.start}–${s.end}`}>
          <span>{t.phases[s.phase]}</span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  response: SimulationResponse;
  rep: RepKey;
  das: number | null;
  onDasChange: (das: number) => void;
}

export function DailyCharts({ response, rep, das, onDasChange }: Props) {
  const { t } = useI18n();
  const C = t.chart;
  const reduced = useReducedMotion();
  const season = response.representative_seasons?.[rep];
  const rows = useMemo(() => toRows(season?.daily ?? []), [season]);
  const byDas = useMemo(() => new Map(rows.map((r) => [r.das, r])), [rows]);
  const spans = useMemo(() => phaseSpans(rows), [rows]);
  if (!season || !rows.length) return <p className="muted">{C.no_daily}</p>;

  const first = rows[0].das;
  const last = rows[rows.length - 1].das;
  const xAxis = <XAxis dataKey="das" type="number" domain={[first, last]} allowDecimals={false}
                       tick={{ fontSize: 12 }} stroke="var(--axis)" tickLine={false} />;
  const bands = spans.map((s, i) => (
    <ReferenceArea key={`${s.phase}-${s.start}`} x1={s.start - 0.5} x2={s.end + 0.5} ifOverflow="hidden"
                   fill={i % 2 ? "var(--phase-b)" : "var(--phase-a)"} fillOpacity={1} strokeOpacity={0} />
  ));
  const cursor = das != null && <ReferenceLine x={das} stroke="var(--text-secondary)" strokeWidth={1.5} ifOverflow="hidden" />;
  // DAS pela posição do clique/toque na área de plotagem (eixo numérico [first,last], margens conhecidas).
  // Não usa activeLabel do recharts: ele reflete o último hover e fica um passo atrasado em toque (sem hover).
  const click = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const plotLeft = rect.left + Y_AXIS_W + MARGIN.left;
    const plotW = rect.width - Y_AXIS_W - MARGIN.left - MARGIN.right;
    if (plotW <= 0) return;
    const frac = (e.clientX - plotLeft) / plotW;
    if (frac < -0.02 || frac > 1.02) return; // clique no eixo Y: ignora
    const v = Math.round(first + Math.min(1, Math.max(0, frac)) * (last - first));
    if (byDas.has(v)) onDasChange(v);
  };
  const tooltip = <Tooltip content={(p) => <DailyTooltip active={p.active} das={p.label} byDas={byDas} />}
                           cursor={{ stroke: "var(--axis)", strokeWidth: 1 }} isAnimationActive={false} />;
  const hasIrrigation = rows.some((r) => r.irrigation_mm > 0);

  return (
    <div className="daily-charts">
      <p className="hint">{C.hint(seasonLabel(season.daily), rep === "typical")}</p>

      <div className="chart-block">
        <div className="legend" aria-label={C.lg_aria_a}>
          <span><i className="sw sw--water" />{C.lg_water}</span>
          <span><i className="sw sw--ks" />{C.lg_ks}</span>
          <span><i className="sw sw--threshold" />{C.lg_threshold}</span>
        </div>
        <PhaseStrip spans={spans} first={first} last={last} />
        <div className="chart-click" onClick={click}>
          <ResponsiveContainer width="100%" height={230}>
            <ComposedChart data={rows} syncId="daily" margin={MARGIN}>
              {bands}
              <CartesianGrid vertical={false} stroke="var(--grid)" />
              {xAxis}
              <YAxis width={Y_AXIS_W} domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} tick={{ fontSize: 12 }}
                     tickFormatter={(v: number) => num(v, 2)} stroke="var(--axis)" tickLine={false} />
              {tooltip}
              <Line dataKey="stress_threshold" name={C.lg_threshold} stroke="var(--text-muted)" strokeWidth={1.5}
                    strokeDasharray="4 3" dot={false} activeDot={false} isAnimationActive={!reduced} />
              <Line dataKey="soil_water_fraction" name={C.tt_water} stroke="var(--series-water)" strokeWidth={2}
                    dot={false} activeDot={{ r: 4, stroke: "var(--surface)", strokeWidth: 2 }} isAnimationActive={!reduced} />
              <Line dataKey="ks" name="Ks" stroke="var(--series-ks)" strokeWidth={2} type="stepAfter"
                    dot={false} activeDot={{ r: 4, stroke: "var(--surface)", strokeWidth: 2 }} isAnimationActive={!reduced} />
              {cursor}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-block">
        <div className="legend" aria-label={C.lg_aria_b}>
          <span><i className="sw sw--rain" />{C.lg_rain}</span>
          <span><i className="sw sw--irr" />{C.lg_irr}{hasIrrigation ? "" : C.lg_irr_none}</span>
        </div>
        <div className="chart-click" onClick={click}>
          <ResponsiveContainer width="100%" height={150}>
            <ComposedChart data={rows} syncId="daily" margin={MARGIN} barCategoryGap={1}>
              {bands}
              <CartesianGrid vertical={false} stroke="var(--grid)" />
              {xAxis}
              <YAxis width={Y_AXIS_W} tick={{ fontSize: 12 }} stroke="var(--axis)" tickLine={false}
                     tickFormatter={(v: number) => num(v)} />
              {tooltip}
              <Bar dataKey="precip_mm" name={C.tt_rain} stackId="w" fill="var(--series-rain)" isAnimationActive={!reduced} />
              <Bar dataKey="irrigation_mm" name={C.tt_irr} stackId="w" fill="var(--series-irr)" radius={[2, 2, 0, 0]}
                   isAnimationActive={!reduced} />
              {cursor}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <details className="table-view">
        <summary>{C.table(rows.length)}</summary>
        <div className="table-scroll">
          <table>
            <thead><tr>{C.th.map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.das} className={r.das === das ? "is-selected" : undefined}>
                  <td>{r.das}</td><td>{dayBR(r.day)}</td><td>{t.phases[r.ky_phase]}</td>
                  <td>{num(r.soil_water_fraction, 2)}</td><td>{num(r.ks, 2)}</td>
                  <td>{r.stress_level === "none" ? "—" : C.stress[r.stress_level]}</td>
                  <td>{num(r.precip_mm, 1)}</td><td>{num(r.irrigation_mm, 1)}</td>
                  <td>{num(r.runoff_mm, 1)}</td><td>{num(r.deep_percolation_mm, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
