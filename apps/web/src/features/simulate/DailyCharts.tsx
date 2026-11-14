// Gráficos diários do ano representativo. Regras (skill dataviz):
// - nunca dois eixos Y: fração/Ks (0–1) e chuva/irrigação (mm) são DOIS gráficos com o mesmo eixo X (DAS);
// - cor segue a entidade (slots fixos, validados com validate_palette.js em claro/escuro);
// - legenda com nomes + tabela equivalente (alívio para o aqua < 3:1 no tema claro).
import { useMemo } from "react";
import {
  Bar, CartesianGrid, ComposedChart, Line, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { SimulationResponse } from "../../api/simulation.types";
import { dayBR, num } from "../../lib/format";
import { useReducedMotion } from "../../lib/useReducedMotion";
import { phaseSpans, seasonLabel, toRows, type DailyRow, type PhaseSpan, type RepKey } from "./daily";
import { PHASE_LABELS } from "./labels";

const Y_AXIS_W = 44;
const MARGIN = { top: 8, right: 12, bottom: 0, left: 0 };

export function RepToggle({ response, rep, onChange }: { response: SimulationResponse; rep: RepKey; onChange: (r: RepKey) => void }) {
  const rs = response.representative_seasons;
  if (!rs) return null;
  return (
    <div className="segmented" role="radiogroup" aria-label="Ano representativo">
      {(["typical", "dry"] as const).map((k) => (
        <button key={k} type="button" role="radio" aria-checked={rep === k}
                className={`segmented__btn${rep === k ? " is-active" : ""}`} onClick={() => onChange(k)}>
          {k === "typical" ? "Ano típico" : "Ano seco"} <span className="muted">({seasonLabel(rs[k].daily)})</span>
        </button>
      ))}
    </div>
  );
}

function DailyTooltip({ active, das, byDas }: { active?: boolean; das: unknown; byDas: Map<number, DailyRow> }) {
  const r = active ? byDas.get(Number(das)) : undefined;
  if (!r) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__head">{dayBR(r.day)} · DAS {r.das} · {PHASE_LABELS[r.ky_phase]}</p>
      <dl>
        <dt><i className="sw sw--water" />Água no solo</dt><dd>{num(r.soil_water_fraction * 100)}% da CAD</dd>
        <dt><i className="sw sw--ks" />Ks</dt><dd>{num(r.ks, 2)} · {r.stress_level === "none" ? "sem estresse" : r.stress_level === "moderate" ? "moderado" : "severo"}</dd>
        <dt><i className="sw sw--rain" />Chuva</dt><dd>{num(r.precip_mm, 1)} mm</dd>
        <dt><i className="sw sw--irr" />Irrigação</dt><dd>{num(r.irrigation_mm, 1)} mm</dd>
        {r.runoff_mm > 0 && <><dt>Enxurrada</dt><dd>{num(r.runoff_mm, 1)} mm</dd></>}
        {r.deep_percolation_mm > 0 && <><dt>Drenagem</dt><dd>{num(r.deep_percolation_mm, 1)} mm</dd></>}
        {r.heat_stress && <><dt>Calor</dt><dd>Tmax {num(r.tmax_c, 1)} °C na floração</dd></>}
        {r.weather_filled && <><dt>Clima</dt><dd>interpolado</dd></>}
      </dl>
    </div>
  );
}

function PhaseStrip({ spans, first, last }: { spans: PhaseSpan[]; first: number; last: number }) {
  const total = last - first + 1;
  return (
    <div className="phase-strip" style={{ marginLeft: Y_AXIS_W + MARGIN.left, marginRight: MARGIN.right }} aria-hidden="true">
      {spans.map((s, i) => (
        <div key={`${s.phase}-${s.start}`} className={`phase-strip__seg${i % 2 ? " alt" : ""}`}
             style={{ flexBasis: `${((s.end - s.start + 1) / total) * 100}%` }} title={`${PHASE_LABELS[s.phase]}: DAS ${s.start}–${s.end}`}>
          <span>{PHASE_LABELS[s.phase]}</span>
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
  const reduced = useReducedMotion();
  const season = response.representative_seasons?.[rep];
  const rows = useMemo(() => toRows(season?.daily ?? []), [season]);
  const byDas = useMemo(() => new Map(rows.map((r) => [r.das, r])), [rows]);
  const spans = useMemo(() => phaseSpans(rows), [rows]);
  if (!season || !rows.length) return <p className="muted">Sem estados diários nesta resposta (include_daily=false).</p>;

  const first = rows[0].das;
  const last = rows[rows.length - 1].das;
  const xAxis = <XAxis dataKey="das" type="number" domain={[first, last]} allowDecimals={false}
                       tick={{ fontSize: 12 }} stroke="var(--axis)" tickLine={false} />;
  const bands = spans.map((s, i) => (
    <ReferenceArea key={`${s.phase}-${s.start}`} x1={s.start - 0.5} x2={s.end + 0.5} ifOverflow="hidden"
                   fill={i % 2 ? "var(--phase-b)" : "var(--phase-a)"} fillOpacity={1} strokeOpacity={0} />
  ));
  const cursor = das != null && <ReferenceLine x={das} stroke="var(--text-secondary)" strokeWidth={1.5} ifOverflow="hidden" />;
  const click = (s: { activeLabel?: unknown } | null | undefined) => {
    const v = Number(s?.activeLabel);
    if (Number.isFinite(v) && byDas.has(v)) onDasChange(v);
  };
  const tooltip = <Tooltip content={(p) => <DailyTooltip active={p.active} das={p.label} byDas={byDas} />}
                           cursor={{ stroke: "var(--axis)", strokeWidth: 1 }} isAnimationActive={false} />;
  const hasIrrigation = rows.some((r) => r.irrigation_mm > 0);

  return (
    <div className="daily-charts">
      <p className="hint">
        Safra {seasonLabel(season.daily)} ({rep === "typical" ? "rendimento mais próximo do P50" : "rendimento mais próximo do P10"}).
        Clique no gráfico para escolher o dia. Eixo X: dias após a semeadura (DAS).
      </p>

      <div className="chart-block">
        <div className="legend" aria-label="Legenda: água no solo e Ks">
          <span><i className="sw sw--water" />Fração de água no solo (1 = capacidade de campo, 0 = murcha)</span>
          <span><i className="sw sw--ks" />Ks (1 = sem estresse)</span>
          <span><i className="sw sw--threshold" />Limiar de estresse (1 − RAW/TAW)</span>
        </div>
        <PhaseStrip spans={spans} first={first} last={last} />
        <ResponsiveContainer width="100%" height={230}>
          <ComposedChart data={rows} syncId="daily" margin={MARGIN} onClick={click}>
            {bands}
            <CartesianGrid vertical={false} stroke="var(--grid)" />
            {xAxis}
            <YAxis width={Y_AXIS_W} domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} tick={{ fontSize: 12 }}
                   tickFormatter={(v: number) => num(v, 2)} stroke="var(--axis)" tickLine={false} />
            {tooltip}
            <Line dataKey="stress_threshold" name="Limiar" stroke="var(--text-muted)" strokeWidth={1.5}
                  strokeDasharray="4 3" dot={false} activeDot={false} isAnimationActive={!reduced} />
            <Line dataKey="soil_water_fraction" name="Água no solo" stroke="var(--series-water)" strokeWidth={2}
                  dot={false} activeDot={{ r: 4, stroke: "var(--surface)", strokeWidth: 2 }} isAnimationActive={!reduced} />
            <Line dataKey="ks" name="Ks" stroke="var(--series-ks)" strokeWidth={2} type="stepAfter"
                  dot={false} activeDot={{ r: 4, stroke: "var(--surface)", strokeWidth: 2 }} isAnimationActive={!reduced} />
            {cursor}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-block">
        <div className="legend" aria-label="Legenda: entradas de água">
          <span><i className="sw sw--rain" />Chuva (mm/dia)</span>
          <span><i className="sw sw--irr" />Irrigação líquida (mm/dia){hasIrrigation ? "" : " — nenhuma neste ano"}</span>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <ComposedChart data={rows} syncId="daily" margin={MARGIN} onClick={click} barCategoryGap={1}>
            {bands}
            <CartesianGrid vertical={false} stroke="var(--grid)" />
            {xAxis}
            <YAxis width={Y_AXIS_W} tick={{ fontSize: 12 }} stroke="var(--axis)" tickLine={false}
                   tickFormatter={(v: number) => num(v)} unit="" />
            {tooltip}
            <Bar dataKey="precip_mm" name="Chuva" stackId="w" fill="var(--series-rain)" isAnimationActive={!reduced} />
            <Bar dataKey="irrigation_mm" name="Irrigação" stackId="w" fill="var(--series-irr)" radius={[2, 2, 0, 0]}
                 isAnimationActive={!reduced} />
            {cursor}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <details className="table-view">
        <summary>Ver tabela diária ({rows.length} dias)</summary>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>DAS</th><th>Data</th><th>Fase</th><th>Água no solo</th><th>Ks</th><th>Estresse</th>
                <th>Chuva (mm)</th><th>Irrigação (mm)</th><th>Enxurrada (mm)</th><th>Drenagem (mm)</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.das} className={r.das === das ? "is-selected" : undefined}>
                  <td>{r.das}</td><td>{dayBR(r.day)}</td><td>{PHASE_LABELS[r.ky_phase]}</td>
                  <td>{num(r.soil_water_fraction, 2)}</td><td>{num(r.ks, 2)}</td>
                  <td>{r.stress_level === "none" ? "—" : r.stress_level === "moderate" ? "moderado" : "severo"}</td>
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
