// Figuras estáticas (SVG do recharts) para o PDF: água no solo + Ks, ano típico e ano seco.
// Mesmas regras do gráfico interativo: um eixo (0–1), cores validadas, fases marcadas, legenda com nomes.
import { CartesianGrid, ComposedChart, Line, ReferenceArea, XAxis, YAxis } from "recharts";
import type { KyPhase, SimulationResponse } from "../../api/simulation.types";
import { num } from "../../lib/format";
import { phaseSpans, seasonLabel, toRows, type RepKey } from "../simulate/daily";
import { PHASE_LABELS } from "../simulate/labels";

const PHASE_EN: Record<KyPhase, string> = {
  initial: "Initial", development: "Development", flowering: "Flowering", yield_formation: "Yield formation", late: "Late",
};

const W = 680;
const H = 190;
const MARGIN = { top: 6, right: 10, bottom: 0, left: 0 };
const YW = 36;

function Figure({ response, rep, n, lang }: { response: SimulationResponse; rep: RepKey; n: number; lang: "pt" | "en" }) {
  const season = response.representative_seasons?.[rep];
  if (!season?.daily.length) return null;
  const rows = toRows(season.daily);
  const spans = phaseSpans(rows);
  const first = rows[0].das;
  const last = rows[rows.length - 1].das;
  const total = last - first + 1;
  const label = seasonLabel(season.daily);
  const caption = lang === "pt"
    ? `Figura ${n} — Água no solo e Ks, ${rep === "typical" ? "ano típico" : "ano seco"} (safra ${label}, rendimento mais próximo do ${rep === "typical" ? "P50" : "P10"}).`
    : `Figure ${n} — Soil water and Ks, ${rep === "typical" ? "typical year" : "dry year"} (season ${label}, yield closest to ${rep === "typical" ? "P50" : "P10"}).`;
  return (
    <figure className="print-figure">
      <div className="print-phases" style={{ marginLeft: YW + MARGIN.left, marginRight: MARGIN.right, width: W - YW - MARGIN.right }}>
        {spans.map((s) => (
          <span key={`${s.phase}-${s.start}`} style={{ flexBasis: `${((s.end - s.start + 1) / total) * 100}%` }}>
            {lang === "pt" ? PHASE_LABELS[s.phase] : PHASE_EN[s.phase]}
          </span>
        ))}
      </div>
      <ComposedChart width={W} height={H} data={rows} margin={MARGIN}>
        {spans.map((s, i) => (
          <ReferenceArea key={`${s.phase}-${s.start}`} x1={s.start - 0.5} x2={s.end + 0.5} ifOverflow="hidden"
                         fill={i % 2 ? "#ececea" : "#f6f6f4"} fillOpacity={1} strokeOpacity={0} />
        ))}
        <CartesianGrid vertical={false} stroke="#e1e0d9" />
        <XAxis dataKey="das" type="number" domain={[first, last]} tick={{ fontSize: 9 }} stroke="#9a978f" tickLine={false} />
        <YAxis width={YW} domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} tick={{ fontSize: 9 }} stroke="#9a978f"
               tickLine={false} tickFormatter={(v: number) => num(v, 2)} />
        <Line dataKey="stress_threshold" stroke="#898781" strokeWidth={1.2} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
        <Line dataKey="soil_water_fraction" stroke="#2a78d6" strokeWidth={1.8} dot={false} isAnimationActive={false} />
        <Line dataKey="ks" stroke="#eb6834" strokeWidth={1.8} type="stepAfter" dot={false} isAnimationActive={false} />
      </ComposedChart>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function PrintCharts({ response, lang }: { response: SimulationResponse; lang: "pt" | "en" }) {
  if (!response.representative_seasons) return null;
  return (
    <section className="print-figures">
      <h2>{lang === "pt" ? "Figuras" : "Figures"}</h2>
      <p className="print-legend">
        <span><i style={{ background: "#2a78d6" }} />{lang === "pt" ? "Fração de água no solo (1 = capacidade de campo, 0 = murcha)" : "Soil water fraction (1 = field capacity, 0 = wilting point)"}</span>
        <span><i style={{ background: "#eb6834" }} />{lang === "pt" ? "Ks (1 = sem estresse)" : "Ks (1 = no stress)"}</span>
        <span><i className="dash" />{lang === "pt" ? "Limiar de estresse (1 − RAW/TAW)" : "Stress threshold (1 − RAW/TAW)"}</span>
        <span>{lang === "pt" ? "Eixo X: dias após a semeadura" : "X axis: days after sowing"}</span>
      </p>
      <Figure response={response} rep="typical" n={1} lang={lang} />
      <Figure response={response} rep="dry" n={2} lang={lang} />
    </section>
  );
}
