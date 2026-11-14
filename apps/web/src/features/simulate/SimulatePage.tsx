import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import type { CatalogResponse } from "../../api/simulation.types";
import { createDataSource, type DataSource, type DemoPackIndex } from "../../data/dataSource";
import { useI18n } from "../../i18n/context";
import { Comparisons } from "./Comparisons";
import { DailyCharts, RepToggle } from "./DailyCharts";
import { seasonLabel, type RepKey } from "./daily";
import { TimelineControls } from "../twin/TimelineControls";
import { TwinSection } from "../twin/TwinSection";
import { defaultDas } from "../twin/twinModel";
import { usePlayback } from "../twin/usePlayback";
import { DEFAULT_FORM, toRequest, type FormState } from "./formState";
import { PercentileCards } from "./PercentileCards";
import { ResultHeader, WarningsPanel } from "./ResultHeader";
import { SimulationForm } from "./SimulationForm";
import { StatusMessage } from "./StatusMessage";
import { useSimulation } from "./useSimulation";

// react-markdown + remark-gfm (~170 kB) só baixam quando a seção de relatórios aparece.
const ReportPanel = lazy(() => import("../report/ReportPanel").then((m) => ({ default: m.ReportPanel })));

function useDataSource(): DataSource | Error {
  return useMemo(() => {
    try {
      return createDataSource();
    } catch (e) {
      return e instanceof Error ? e : new Error(String(e));
    }
  }, []);
}

export function SimulatePage() {
  const { t, lang } = useI18n();
  const sourceOrError = useDataSource();
  const source = sourceOrError instanceof Error ? null : sourceOrError;
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  // Último formulário enviado. Simulação = (submitted, lang): trocar o idioma reexecuta o MESMO cenário
  // para os textos do motor (avisos, premissas, métodos) virem no novo idioma; os números não mudam.
  const [submitted, setSubmitted] = useState<FormState>(DEFAULT_FORM);
  const [grid, setGrid] = useState<DemoPackIndex | null>(null);
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [rep, setRep] = useState<RepKey>("typical");
  const [das, setDas] = useState<number | null>(null);
  const { state, run } = useSimulation(source);

  // Linha do tempo compartilhada: 3D, corte 2D, os dois sliders e o clique nos gráficos usam o MESMO `das`.
  const season = state.result?.response.representative_seasons?.[rep];
  const daily = useMemo(() => season?.daily ?? [], [season]);
  const days = useMemo(() => daily.map((d) => d.das), [daily]);
  const currentDas = das ?? defaultDas(daily);
  const playback = usePlayback(days, currentDas, setDas);
  const seekByUser = (d: number) => { playback.stop(); setDas(d); };

  // Grade (fixture) ou catálogo (api) para rotular o formulário; falha aqui não bloqueia a simulação.
  useEffect(() => {
    if (!source) return;
    const ctrl = new AbortController();
    source.grid(ctrl.signal).then(setGrid, () => {});
    source.catalog(ctrl.signal).then(setCatalog, () => {});
    return () => ctrl.abort();
  }, [source]);

  // Primeira simulação (soja 20/10, argiloso, sequeiro), cada envio e cada troca de idioma.
  useEffect(() => {
    if (source) run(toRequest(submitted, source.kind, lang));
  }, [source, run, submitted, lang]);

  if (!source) {
    return <div className="status status--error" role="alert"><h3>{t.page.config_invalid}</h3><p>{(sourceOrError as Error).message}</p></div>;
  }

  const submit = () => {
    playback.stop();
    setDas(null);
    setSubmitted({ ...form }); // objeto novo: reenvia mesmo sem mudança (ex.: "tentar de novo")
  };
  const fieldErrors = state.error?.kind === "invalid_input" ? state.error.fields : {};
  const result = state.result;
  const response = result?.response;

  return (
    <div className="sim-layout">
      <aside className="sim-aside">
        <h2 className="aside-title">{t.page.aside_title}</h2>
        <p className="hint">{t.page.source}: <code>{source.describe()}</code></p>
        <SimulationForm mode={source.kind} grid={grid} catalog={catalog} form={form} onChange={setForm}
                        onSubmit={submit} fieldErrors={fieldErrors} loading={state.loading} />
      </aside>

      <section className="sim-results" aria-live="polite" aria-busy={state.loading}>
        {state.loading && !result && <p className="status status--loading" role="status">{t.page.loading}</p>}
        {state.error && <StatusMessage error={state.error} source={source} onRetry={submit} />}

        {result && response && (
          <div className={state.stale ? "is-stale" : undefined}>
            {state.stale && <p className="status status--loading" role="status">{t.page.updating}</p>}
            <ResultHeader result={result} />
            {response.status === "no_data" ? (
              <div className="status status--info" role="status">
                <h3>{t.page.no_data_title}</h3>
                <p>{t.page.no_data_body}{response.skipped_years?.length ? t.page.no_data_years(response.skipped_years.join(", ")) : ""}</p>
              </div>
            ) : (
              <>
                <WarningsPanel result={result} />
                <PercentileCards response={response} />
                <section aria-labelledby="daily-h" className="twin-and-charts">
                  <div className="section-head">
                    <h3 id="daily-h" className="section-title">{t.page.twin_title}</h3>
                    <RepToggle response={response} rep={rep} onChange={(r) => { playback.stop(); setRep(r); setDas(null); }} />
                  </div>
                  {currentDas != null && (
                    <TwinSection crop={response.crop?.key ?? response.request?.crop ?? "soy"} seasonLabel={seasonLabel(daily)}
                                 daily={daily} das={currentDas} onDasChange={setDas} playing={playback.playing}
                                 onTogglePlay={playback.toggle} onUserSeek={playback.stop} />
                  )}
                  {currentDas != null && (
                    <TimelineControls id="das-charts" compact daily={daily} das={currentDas} onChange={setDas}
                                      playing={playback.playing} onTogglePlay={playback.toggle} onUserSeek={playback.stop} />
                  )}
                  <DailyCharts response={response} rep={rep} das={currentDas} onDasChange={seekByUser} />
                </section>
                <Comparisons response={response} />
                <Suspense fallback={<p className="status status--loading" role="status">{t.page.reports_loading}</p>}>
                  <ReportPanel key={`${response.generated_at}|${result.provenance.location}|${lang}`} source={source} result={result} />
                </Suspense>
              </>
            )}
            {response.status === "no_data" && <WarningsPanel result={result} />}
          </div>
        )}
      </section>
    </div>
  );
}
