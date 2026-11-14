import type { ComparisonItem, ProbabilityOfLossComparison, SimulationResponse } from "../../api/simulation.types";
import { num, pct, signed } from "../../lib/format";
import { comparisonTitle, IRRIGATION_LABELS, METRICS } from "./labels";

const isItem = (v: ComparisonItem | ProbabilityOfLossComparison): v is ComparisonItem => "baseline_p50" in v;

function Cell({ a, b, d, digits, pctDelta }: { a?: number; b?: number; d?: number; digits: number; pctDelta?: number | null }) {
  if (a == null || b == null) return <td className="muted">—</td>;
  return (
    <td>
      <span className="cmp-values">{num(a, digits)} → {num(b, digits)}</span>
      <span className="cmp-delta">Δ {signed(d, digits)}{pctDelta != null ? ` (${signed(pctDelta, 1)}%)` : ""}</span>
    </td>
  );
}

export function Comparisons({ response }: { response: SimulationResponse }) {
  const comps = response.comparisons;
  if (!comps || !Object.keys(comps).length) return null;
  const irrigation = IRRIGATION_LABELS[response.request?.management?.irrigation ?? "rainfed"]?.toLowerCase();
  const sc = response.scenario;
  const climateNow = sc && (sc.precip_delta_pct !== 0 || sc.temp_delta_c !== 0)
    ? `cenário Δchuva ${signed(sc.precip_delta_pct)}% / ΔT ${signed(sc.temp_delta_c, 1)} °C` : "clima histórico";

  return (
    <section aria-labelledby="cmp-h">
      <h3 id="cmp-h" className="section-title">Comparações</h3>
      <p className="hint">
        Cada célula: base → alternativa (Δ = alternativa − base). Os percentis são de cada distribuição
        separadamente, não pareados ano a ano. Em estresse e irrigação, maior = pior; o ano ruim delas é o P90, que não entra aqui.
      </p>
      {Object.entries(comps).map(([key, comp]) => {
        const t = comparisonTitle(key);
        const context = key === "climate_vs_baseline" ? `mesma irrigação (${irrigation})` : `mesmo clima (${climateNow})`;
        const items = Object.entries(comp);
        return (
          <div key={key} className="cmp-block">
            <h4>{t.title} <span className="muted">· {context}</span></h4>
            <div className="table-scroll">
              <table className="cmp-table">
                <caption className="sr-only">{t.title}: {t.base} → {t.alt}</caption>
                <thead>
                  <tr><th scope="col">Métrica</th><th scope="col">P10</th><th scope="col">P50</th><th scope="col">Média</th></tr>
                </thead>
                <tbody>
                  {items.map(([m, v]) => {
                    if (!isItem(v)) {
                      return (
                        <tr key={m}>
                          <th scope="row">Probabilidade de prejuízo</th>
                          <td colSpan={3}>{pct(v.baseline)} → {pct(v.scenario)} <span className="cmp-delta">Δ {signed(v.delta * 100, 1)} p.p.</span></td>
                        </tr>
                      );
                    }
                    const meta = METRICS[m] ?? { label: m, unit: "", digits: 1 };
                    return (
                      <tr key={m}>
                        <th scope="row">{meta.label} <span className="muted">({meta.unit})</span>
                          {meta.higherIsWorse && <span className="tag tag--bad tag--inline">maior = pior</span>}</th>
                        <Cell a={v.baseline_p10} b={v.scenario_p10} d={v.delta_p10} digits={meta.digits} />
                        <Cell a={v.baseline_p50} b={v.scenario_p50} d={v.delta} digits={meta.digits} pctDelta={v.delta_pct} />
                        <Cell a={v.baseline_mean} b={v.scenario_mean} d={v.delta_mean} digits={meta.digits} />
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="hint">Base: <strong>{t.base}</strong> · alternativa: <strong>{t.alt}</strong></p>
          </div>
        );
      })}
    </section>
  );
}
