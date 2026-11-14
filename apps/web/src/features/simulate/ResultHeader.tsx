import type { SimulationResult } from "../../data/dataSource";
import { useI18n } from "../../i18n/context";
import { dateBR, signed, sowingLabel } from "../../lib/format";

export function SourceBadge({ nasaPower }: { nasaPower: boolean }) {
  const { t } = useI18n();
  return nasaPower
    ? <span className="badge badge--real"><span aria-hidden="true">●</span> {t.result.badge_real}</span>
    : <span className="badge badge--synthetic" role="alert"><span aria-hidden="true">▲</span> {t.result.badge_synth}</span>;
}

export function ResultHeader({ result }: { result: SimulationResult }) {
  const { t } = useI18n();
  const R = t.result;
  const r = result.response;
  const req = r.request;
  const conceptual = r.crop?.status === "conceptual";
  const sc = r.scenario;
  const cropKey = r.crop?.key ?? req?.crop;
  return (
    <header className="result-header">
      <div className="badges">
        <SourceBadge nasaPower={result.provenance.nasaPower} />
        {conceptual && <span className="badge badge--conceptual-strong">{R.badge_conceptual}</span>}
        {r.crop?.status === "experimental" && <span className="badge badge--neutral">{t.crop_status.experimental}</span>}
        <span className="badge badge--neutral" title={result.provenance.location}>{t.provenance[result.provenance.kind]}</span>
      </div>
      <h2 className="result-title">
        {cropKey ? t.crops[cropKey] : "—"} · {R.sowing} {req ? sowingLabel(req.sowing_date) : "—"} ·{" "}
        {req?.soil ? t.soils[req.soil] : "—"} · {t.irrigation[req?.management?.irrigation ?? "rainfed"]}
      </h2>
      <p className="result-sub">
        {sc && (sc.precip_delta_pct !== 0 || sc.temp_delta_c !== 0)
          ? <>{R.scenario_prefix} <strong>{R.scenario(signed(sc.precip_delta_pct), signed(sc.temp_delta_c, 1))}</strong> {R.scenario_suffix}</>
          : <>{R.historical}</>}
        {" "}· {R.seasons(r.summary?.n_seasons ?? 0, req?.first_year, req?.last_year)}
      </p>
      <dl className="meta">
        <div><dt>{R.m_location}</dt><dd>{r.spatial_scope.lat}, {r.spatial_scope.lon}{r.area_id ? ` · IBGE ${r.area_id}` : ""}</dd></div>
        <div><dt>{R.m_resolution}</dt><dd>{r.spatial_scope.weather_resolution}</dd></div>
        <div><dt>{R.m_data}</dt><dd><code>{r.data_version}</code></dd></div>
        <div><dt>{R.m_observed}</dt><dd>{r.observed_through}</dd></div>
        <div><dt>{R.m_generated}</dt><dd>{dateBR(r.generated_at)}</dd></div>
        <div><dt>{R.m_model}</dt><dd><code>{r.model_version}</code></dd></div>
      </dl>
      {r.skipped_years && r.skipped_years.length > 0 && (
        <p className="callout callout--warn" role="note">{R.incomplete(r.skipped_years.length, r.skipped_years.join(", "))}</p>
      )}
    </header>
  );
}

export function WarningsPanel({ result }: { result: SimulationResult }) {
  const { t } = useI18n();
  const r = result.response;
  return (
    <section className="panel panel--warnings" aria-labelledby="warn-h">
      <div>
        <h3 id="warn-h">{t.result.warnings} <span className="muted">({r.warnings.length})</span></h3>
        <ul>{r.warnings.map((w) => <li key={w} className={/CONCEITUAL|CONCEPTUAL|SINTÉTIC|SYNTHETIC/.test(w) ? "strong" : undefined}>{w}</li>)}</ul>
      </div>
      <div>
        <h3>{t.result.assumptions} <span className="muted">({r.assumptions?.length ?? 0})</span></h3>
        <ul>{(r.assumptions ?? []).map((a) => <li key={a}>{a}</li>)}</ul>
      </div>
    </section>
  );
}
