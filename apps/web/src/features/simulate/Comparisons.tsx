import type { ComparisonItem, ProbabilityOfLossComparison, SimulationResponse } from "../../api/simulation.types";
import { useI18n } from "../../i18n/context";
import { num, pct, signed } from "../../lib/format";
import { comparisonTitle, METRIC_META } from "./labels";

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
  const { t } = useI18n();
  const C = t.cmp;
  const comps = response.comparisons;
  if (!comps || !Object.keys(comps).length) return null;
  const irrigation = t.irrigation[response.request?.management?.irrigation ?? "rainfed"].toLowerCase();
  const sc = response.scenario;
  const climateNow = sc && (sc.precip_delta_pct !== 0 || sc.temp_delta_c !== 0)
    ? C.climate_now(signed(sc.precip_delta_pct), signed(sc.temp_delta_c, 1)) : C.climate_hist;

  return (
    <section aria-labelledby="cmp-h">
      <h3 id="cmp-h" className="section-title">{C.title}</h3>
      <p className="hint">{C.hint}</p>
      {Object.entries(comps).map(([key, comp]) => {
        const ti = comparisonTitle(key, t);
        const context = key === "climate_vs_baseline" ? C.same_irr(irrigation) : C.same_climate(climateNow);
        return (
          <div key={key} className="cmp-block">
            <h4>{ti.title} <span className="muted">· {context}</span></h4>
            <div className="table-scroll">
              <table className="cmp-table">
                <caption className="sr-only">{ti.title}: {ti.base} → {ti.alt}</caption>
                <thead>
                  <tr><th scope="col">{C.metric}</th><th scope="col">P10</th><th scope="col">P50</th><th scope="col">{C.mean}</th></tr>
                </thead>
                <tbody>
                  {Object.entries(comp).map(([m, v]) => {
                    if (!isItem(v)) {
                      return (
                        <tr key={m}>
                          <th scope="row">{C.loss}</th>
                          <td colSpan={3}>{pct(v.baseline)} → {pct(v.scenario)} <span className="cmp-delta">Δ {signed(v.delta * 100, 1)} p.p.</span></td>
                        </tr>
                      );
                    }
                    const meta = METRIC_META[m] ?? { digits: 1 };
                    const label = t.metrics[m] ?? { label: m, unit: "" };
                    return (
                      <tr key={m}>
                        <th scope="row">{label.label} <span className="muted">({label.unit})</span>
                          {meta.higherIsWorse && <span className="tag tag--bad tag--inline">{C.worse}</span>}</th>
                        <Cell a={v.baseline_p10} b={v.scenario_p10} d={v.delta_p10} digits={meta.digits} />
                        <Cell a={v.baseline_p50} b={v.scenario_p50} d={v.delta} digits={meta.digits} pctDelta={v.delta_pct} />
                        <Cell a={v.baseline_mean} b={v.scenario_mean} d={v.delta_mean} digits={meta.digits} />
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="hint">{C.base_alt(ti.base, ti.alt)}</p>
          </div>
        );
      })}
    </section>
  );
}
