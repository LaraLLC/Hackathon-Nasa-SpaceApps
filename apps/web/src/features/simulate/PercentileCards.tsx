import type { Dist, SimulationResponse } from "../../api/simulation.types";
import { useI18n } from "../../i18n/context";
import { bags, num, pct } from "../../lib/format";

type Tag = "bad" | "typical" | "good" | null;

/** Para métricas "maior = pior" (estresse, irrigação) o ano ruim é o P90. */
function tags(higherIsWorse: boolean | null): [Tag, Tag, Tag] {
  if (higherIsWorse === null) return [null, "typical", null];
  return higherIsWorse ? ["good", "typical", "bad"] : ["bad", "typical", "good"];
}

function Card({ title, unit, d, digits = 0, higherIsWorse, secondary, note }: {
  title: string; unit: string; d: Dist | undefined; digits?: number; higherIsWorse: boolean | null;
  secondary?: (v: number) => string; note?: string;
}) {
  const { t } = useI18n();
  const tagText = { bad: t.cards.tag_bad, typical: t.cards.tag_typical, good: t.cards.tag_good };
  const tg = tags(higherIsWorse);
  return (
    <article className="stat-card">
      <h4>{title} <span className="muted">({unit})</span></h4>
      {d ? (
        <div className="pct-row">
          {(["p10", "p50", "p90"] as const).map((k, i) => (
            <div key={k} className={`pct-cell${k === "p50" ? " pct-cell--main" : ""}`}>
              <span className="pct-label">{k.toUpperCase()}{tg[i] && <span className={`tag tag--${tg[i]}`}>{tagText[tg[i]!]}</span>}</span>
              <span className="pct-value">{num(d[k], digits)}</span>
              {secondary && <span className="pct-secondary">{secondary(d[k])}</span>}
            </div>
          ))}
        </div>
      ) : <p className="muted">{t.cards.no_data}</p>}
      {note && <p className="hint">{note}</p>}
    </article>
  );
}

export function PercentileCards({ response }: { response: SimulationResponse }) {
  const { t } = useI18n();
  const C = t.cards;
  const s = response.summary;
  if (!s) return null;
  const ind = s.indicators;
  const eco = s.economics;
  const rainfed = (response.request?.management?.irrigation ?? "rainfed") === "rainfed";
  return (
    <section aria-labelledby="cards-h">
      <h3 id="cards-h" className="section-title">{C.title(s.n_seasons)}</h3>
      <div className="reading-guide" role="note"><strong>{C.guide_lead}</strong> {C.guide}</div>
      <div className="cards">
        <Card title={C.yield} unit={C.yield_unit} d={s.yield_kg_ha} higherIsWorse={false}
              secondary={(v) => `${bags(v)} ${C.bags}`} note={C.yield_note} />
        <Card title={C.stress} unit={C.stress_unit} d={ind.water_stress_days} digits={1} higherIsWorse />
        <Card title={C.water} unit={C.water_unit} d={ind.crop_water_use_m3_ha} higherIsWorse={null} note={C.water_note} />
        <Card title={C.blue} unit={C.blue_unit} d={ind.blue_water_m3_ha} higherIsWorse note={rainfed ? C.blue_rainfed : undefined} />
        {eco ? (
          <>
            <Card title={C.profit} unit="R$/ha" d={eco.profit_per_ha} higherIsWorse={false} />
            <article className="stat-card stat-card--hero">
              <h4>{C.loss}</h4>
              <p className="hero-value">{pct(eco.probability_of_loss)}</p>
              <p className="hint">{C.loss_note(num(eco.breakeven_bags_per_ha, 1))}</p>
            </article>
          </>
        ) : (
          <article className="stat-card stat-card--empty">
            <h4>{C.loss}</h4>
            <p className="muted">{C.loss_empty}</p>
          </article>
        )}
      </div>
      {response.indicator_methods && (
        <details className="methods">
          <summary>{C.methods}</summary>
          <dl>
            {Object.entries(response.indicator_methods).map(([k, v]) => (
              <div key={k}><dt><code>{k}</code></dt><dd>{v}</dd></div>
            ))}
          </dl>
        </details>
      )}
    </section>
  );
}
