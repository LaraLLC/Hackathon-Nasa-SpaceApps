// Etapa 1: casca mínima que só prova a fonte de dados. A aba "Simular" entra na Etapa 2.
import { useEffect, useMemo, useState } from "react";
import { createDataSource, ScenarioNotPrecomputedError, type SimulationResult } from "./data/dataSource";
import { SimulationApiError } from "./api/simulationApi";
import type { SimulationRequest } from "./api/simulation.types";

// ?sow=MM-DD permite testar uma data fora da grade do demo-pack.
const PROBE_SOW = new URLSearchParams(window.location.search).get("sow") ?? "10-20";
const PROBE_REQUEST: SimulationRequest = {
  location: { lat: -18.92, lon: -48.28, area_id: "3170206" },
  crop: "soy",
  sowing_date: PROBE_SOW,
  first_year: 2001,
  last_year: 2024,
  soil: "clay",
  management: { irrigation: "rainfed" },
  economics: null,
  compare_with_baseline: true,
  compare_irrigation: true,
  include_daily: true,
};

type State =
  | { kind: "loading" }
  | { kind: "ready"; result: SimulationResult }
  | { kind: "error"; message: string };

export default function App() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const source = useMemo(() => {
    try {
      return createDataSource();
    } catch (e) {
      return e instanceof Error ? e : new Error(String(e));
    }
  }, []);

  useEffect(() => {
    if (source instanceof Error) return; // exibido direto no render
    const ctrl = new AbortController();
    source
      .simulate(PROBE_REQUEST, ctrl.signal)
      .then((result) => setState({ kind: "ready", result }))
      .catch((e: unknown) => {
        if (ctrl.signal.aborted) return;
        const msg = e instanceof SimulationApiError ? `${e.kind}: ${e.message}`
          : e instanceof ScenarioNotPrecomputedError ? `${e.message} (${e.reasons.join("; ")})`
          : e instanceof Error ? e.message : String(e);
        setState({ kind: "error", message: msg });
      });
    return () => ctrl.abort();
  }, [source]);

  return (
    <main className="probe">
      <h1>Gaiapus · Simular</h1>
      <p>Fonte de dados: <code>{source instanceof Error ? "inválida" : source.describe()}</code></p>
      {source instanceof Error && <p role="alert">Erro: {source.message}</p>}
      {!(source instanceof Error) && state.kind === "loading" && <p role="status">Carregando…</p>}
      {state.kind === "error" && <p role="alert">Erro: {state.message}</p>}
      {state.kind === "ready" && (
        <dl data-testid="probe-result">
          <dt>status</dt><dd>{state.result.response.status}</dd>
          <dt>data_version</dt><dd>{state.result.response.data_version}</dd>
          <dt>NASA POWER</dt><dd>{state.result.provenance.nasaPower ? "sim" : "NÃO — dados sintéticos"}</dd>
          <dt>safras</dt><dd>{state.result.response.summary?.n_seasons ?? "—"}</dd>
          <dt>rendimento P50 (kg/ha)</dt><dd>{state.result.response.summary?.yield_kg_ha.p50 ?? "—"}</dd>
          <dt>arquivo</dt><dd>{state.result.provenance.location}</dd>
        </dl>
      )}
    </main>
  );
}
