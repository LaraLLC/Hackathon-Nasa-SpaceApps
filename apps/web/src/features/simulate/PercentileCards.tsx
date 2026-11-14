import type { Dist, SimulationResponse } from "../../api/simulation.types";
import { bags, num, pct } from "../../lib/format";

type Tag = "bad" | "typical" | "good" | null;

/** Para métricas "maior = pior" (estresse, irrigação) o ano ruim é o P90. */
function tags(higherIsWorse: boolean | null): [Tag, Tag, Tag] {
  if (higherIsWorse === null) return [null, "typical", null];
  return higherIsWorse ? ["good", "typical", "bad"] : ["bad", "typical", "good"];
}
const TAG_TEXT: Record<Exclude<Tag, null>, string> = { bad: "ano ruim", typical: "típico", good: "ano bom" };

function Card({ title, unit, d, digits = 0, higherIsWorse, secondary, note }: {
  title: string; unit: string; d: Dist | undefined; digits?: number; higherIsWorse: boolean | null;
  secondary?: (v: number) => string; note?: string;
}) {
  const t = tags(higherIsWorse);
  return (
    <article className="stat-card">
      <h4>{title} <span className="muted">({unit})</span></h4>
      {d ? (
        <div className="pct-row">
          {(["p10", "p50", "p90"] as const).map((k, i) => (
            <div key={k} className={`pct-cell${k === "p50" ? " pct-cell--main" : ""}`}>
              <span className="pct-label">{k.toUpperCase()}{t[i] && <span className={`tag tag--${t[i]}`}>{TAG_TEXT[t[i]!]}</span>}</span>
              <span className="pct-value">{num(d[k], digits)}</span>
              {secondary && <span className="pct-secondary">{secondary(d[k])}</span>}
            </div>
          ))}
        </div>
      ) : <p className="muted">Sem dado nesta simulação.</p>}
      {note && <p className="hint">{note}</p>}
    </article>
  );
}

export function PercentileCards({ response }: { response: SimulationResponse }) {
  const s = response.summary;
  if (!s) return null;
  const ind = s.indicators;
  const eco = s.economics;
  const rainfed = (response.request?.management?.irrigation ?? "rainfed") === "rainfed";
  return (
    <section aria-labelledby="cards-h">
      <h3 id="cards-h" className="section-title">Distribuição sobre {s.n_seasons} safras</h3>
      <div className="reading-guide" role="note">
        <strong>Como ler:</strong> P10 = ano ruim (só 1 em cada 10 anos históricos foi pior), P50 = ano típico, P90 = ano bom.
        Em <strong>dias de estresse</strong> e <strong>água de irrigação</strong>, quanto maior, pior: ali o <strong>ano ruim está no P90</strong>.
        Cada métrica tem seus próprios percentis: o P10 de rendimento e o P90 de estresse não são, necessariamente, o mesmo ano.
      </div>
      <div className="cards">
        <Card title="Rendimento" unit="kg/ha · sc/ha" d={s.yield_kg_ha} higherIsWorse={false}
              secondary={(v) => `${bags(v)} sc/ha`}
              note="Só limitação hídrica (FAO-33). Teto = rendimento de referência, premissa a calibrar com IBGE/PAM." />
        <Card title="Dias de estresse hídrico" unit="dias com Ks < 1" d={ind.water_stress_days} digits={1} higherIsWorse />
        <Card title="Água consumida" unit="m³/ha, ETa" d={ind.crop_water_use_m3_ha} higherIsWorse={null}
              note="Evapotranspiração real no ciclo. Não é “bom” nem “ruim” por si." />
        <Card title="Água de irrigação" unit="m³/ha, bruta aplicada" d={ind.blue_water_m3_ha} higherIsWorse
              note={rainfed ? "Sequeiro: sem irrigação (0 = nenhuma lâmina aplicada)." : undefined} />
        {eco ? (
          <>
            <Card title="Lucro" unit="R$/ha" d={eco.profit_per_ha} higherIsWorse={false} />
            <article className="stat-card stat-card--hero">
              <h4>Probabilidade de prejuízo</h4>
              <p className="hero-value">{pct(eco.probability_of_loss)}</p>
              <p className="hint">dos anos simulados com lucro &lt; 0 · equilíbrio em {num(eco.breakeven_bags_per_ha, 1)} sc/ha</p>
            </article>
          </>
        ) : (
          <article className="stat-card stat-card--empty">
            <h4>Probabilidade de prejuízo</h4>
            <p className="muted">Informe preço e custo (com fonte) no modo API para calcular lucro e risco de prejuízo.</p>
          </article>
        )}
      </div>
      {response.indicator_methods && (
        <details className="methods">
          <summary>Métodos dos indicadores</summary>
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
