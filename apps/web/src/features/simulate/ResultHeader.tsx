import type { SimulationResult } from "../../data/dataSource";
import { dateBR, signed } from "../../lib/format";
import { IRRIGATION_LABELS, SOIL_LABELS } from "./labels";

export function SourceBadge({ nasaPower }: { nasaPower: boolean }) {
  return nasaPower
    ? <span className="badge badge--real"><span aria-hidden="true">●</span> Simulação com NASA POWER</span>
    : <span className="badge badge--synthetic" role="alert"><span aria-hidden="true">▲</span> DADOS SINTÉTICOS — não usar em apresentação</span>;
}

export function ResultHeader({ result }: { result: SimulationResult }) {
  const r = result.response;
  const req = r.request;
  const conceptual = r.crop?.status === "conceptual";
  const sc = r.scenario;
  return (
    <header className="result-header">
      <div className="badges">
        <SourceBadge nasaPower={result.provenance.nasaPower} />
        {conceptual && <span className="badge badge--conceptual-strong">CONCEITUAL · sem modelo validado</span>}
        {r.crop?.status === "experimental" && <span className="badge badge--neutral">experimental</span>}
        <span className="badge badge--neutral" title={result.provenance.location}>{result.provenance.label}</span>
      </div>
      <h2 className="result-title">
        {r.crop?.name_pt ?? req?.crop} · semeadura {req?.sowing_date.split("-").reverse().join("/")} ·{" "}
        {r.soil?.name_pt ?? (req?.soil ? SOIL_LABELS[req.soil] : "—")} ·{" "}
        {IRRIGATION_LABELS[req?.management?.irrigation ?? "rainfed"]}
      </h2>
      <p className="result-sub">
        {sc && (sc.precip_delta_pct !== 0 || sc.temp_delta_c !== 0)
          ? <>Cenário <strong>Δchuva {signed(sc.precip_delta_pct)}% · ΔT {signed(sc.temp_delta_c, 1)} °C</strong> sobre o histórico</>
          : <>Clima histórico, sem perturbação</>}
        {" "}· {r.summary?.n_seasons ?? 0} safras ({req?.first_year}–{req?.last_year})
      </p>
      <dl className="meta">
        <div><dt>Local</dt><dd>{r.spatial_scope.lat}, {r.spatial_scope.lon}{r.area_id ? ` · IBGE ${r.area_id}` : ""}</dd></div>
        <div><dt>Resolução do clima</dt><dd>{r.spatial_scope.weather_resolution}</dd></div>
        <div><dt>Dados</dt><dd><code>{r.data_version}</code></dd></div>
        <div><dt>Observado até</dt><dd>{r.observed_through}</dd></div>
        <div><dt>Gerado em</dt><dd>{dateBR(r.generated_at)}</dd></div>
        <div><dt>Modelo</dt><dd><code>{r.model_version}</code></dd></div>
      </dl>
      {r.skipped_years && r.skipped_years.length > 0 && (
        <p className="callout callout--warn" role="note">
          Dados incompletos: {r.skipped_years.length} ano(s) sem safra completa no período ({r.skipped_years.join(", ")}) ficaram fora da distribuição.
        </p>
      )}
    </header>
  );
}

export function WarningsPanel({ result }: { result: SimulationResult }) {
  const r = result.response;
  return (
    <section className="panel panel--warnings" aria-labelledby="warn-h">
      <div>
        <h3 id="warn-h">Avisos <span className="muted">({r.warnings.length})</span></h3>
        <ul>{r.warnings.map((w) => <li key={w} className={/CONCEITUAL|SINTÉTIC/.test(w) ? "strong" : undefined}>{w}</li>)}</ul>
      </div>
      <div>
        <h3>Premissas <span className="muted">({r.assumptions?.length ?? 0})</span></h3>
        <ul>{(r.assumptions ?? []).map((a) => <li key={a}>{a}</li>)}</ul>
      </div>
    </section>
  );
}
