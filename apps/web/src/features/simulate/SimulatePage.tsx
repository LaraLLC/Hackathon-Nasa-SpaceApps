import { useEffect, useMemo, useState } from "react";
import type { CatalogResponse } from "../../api/simulation.types";
import { createDataSource, type DataSource, type DemoPackIndex } from "../../data/dataSource";
import { Comparisons } from "./Comparisons";
import { DailyCharts, RepToggle } from "./DailyCharts";
import type { RepKey } from "./daily";
import { DEFAULT_FORM, toRequest, type FormState } from "./formState";
import { PercentileCards } from "./PercentileCards";
import { ResultHeader, WarningsPanel } from "./ResultHeader";
import { SimulationForm } from "./SimulationForm";
import { StatusMessage } from "./StatusMessage";
import { useSimulation } from "./useSimulation";

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
  const sourceOrError = useDataSource();
  const source = sourceOrError instanceof Error ? null : sourceOrError;
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [grid, setGrid] = useState<DemoPackIndex | null>(null);
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [rep, setRep] = useState<RepKey>("typical");
  const [das, setDas] = useState<number | null>(null);
  const { state, run } = useSimulation(source);

  // Grade (fixture) ou catálogo (api) para rotular o formulário; falha aqui não bloqueia a simulação.
  useEffect(() => {
    if (!source) return;
    const ctrl = new AbortController();
    source.grid(ctrl.signal).then(setGrid, () => {});
    source.catalog(ctrl.signal).then(setCatalog, () => {});
    return () => ctrl.abort();
  }, [source]);

  // Primeira simulação com os valores padrão (soja 20/10, argiloso, sequeiro).
  useEffect(() => {
    if (source) run(toRequest(DEFAULT_FORM, source.kind));
  }, [source, run]);

  if (!source) {
    return <div className="status status--error" role="alert"><h3>Configuração inválida</h3><p>{(sourceOrError as Error).message}</p></div>;
  }

  const submit = () => {
    setDas(null);
    run(toRequest(form, source.kind));
  };
  const fieldErrors = state.error?.kind === "invalid_input" ? state.error.fields : {};
  const result = state.result;
  const response = result?.response;

  return (
    <div className="sim-layout">
      <aside className="sim-aside">
        <h2 className="aside-title">Simular safra</h2>
        <p className="hint">Fonte: <code>{source.describe()}</code></p>
        <SimulationForm mode={source.kind} grid={grid} catalog={catalog} form={form} onChange={setForm}
                        onSubmit={submit} fieldErrors={fieldErrors} loading={state.loading} />
      </aside>

      <section className="sim-results" aria-live="polite" aria-busy={state.loading}>
        {state.loading && !result && <p className="status status--loading" role="status">Simulando 24 safras…</p>}
        {state.error && <StatusMessage error={state.error} source={source} onRetry={submit} />}

        {result && response && (
          <div className={state.stale ? "is-stale" : undefined}>
            {state.stale && <p className="status status--loading" role="status">Atualizando…</p>}
            <ResultHeader result={result} />
            {response.status === "no_data" ? (
              <div className="status status--info" role="status">
                <h3>Sem dados para este período</h3>
                <p>Nenhuma safra completa com dados disponíveis.{response.skipped_years?.length ? ` Anos sem dados: ${response.skipped_years.join(", ")}.` : ""}</p>
              </div>
            ) : (
              <>
                <WarningsPanel result={result} />
                <PercentileCards response={response} />
                <section aria-labelledby="daily-h">
                  <div className="section-head">
                    <h3 id="daily-h" className="section-title">Água no solo, dia a dia</h3>
                    <RepToggle response={response} rep={rep} onChange={(r) => { setRep(r); setDas(null); }} />
                  </div>
                  <DailyCharts response={response} rep={rep} das={das} onDasChange={setDas} />
                </section>
                <Comparisons response={response} />
              </>
            )}
            {response.status === "no_data" && <WarningsPanel result={result} />}
          </div>
        )}
      </section>
    </div>
  );
}
