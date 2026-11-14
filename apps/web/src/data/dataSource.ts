// Fonte de dados da aba "Simular", escolhida por VITE_DATA_SOURCE:
//   fixture → resposta REAL pré-gravada (public/fixtures/simulation-response.REAL.json).
//             Não depende da API, mas devolve SEMPRE a mesma simulação, qualquer que seja o formulário.
//   api     → POST real em VITE_GAIAPUS_API_URL via simulationApi.ts.
//
// O resultado carrega `provenance` para a UI dizer de onde veio cada número.

import { createSimulationApi, type SimulationApi } from "../api/simulationApi";
import type { CatalogResponse, SimulationRequest, SimulationResponse } from "../api/simulation.types";

export type DataSourceKind = "fixture" | "api";

export interface Provenance {
  kind: DataSourceKind;
  /** Rótulo curto para a UI. */
  label: string;
  /** Em modo fixture: arquivo lido. Em modo api: URL base. */
  location: string;
  /** true quando a fonte meteorológica da resposta é NASA POWER (lido de data_version, não presumido). */
  nasaPower: boolean;
  /** Em modo fixture: campos do formulário que diferem do request gravado no fixture. */
  fixtureMismatches: string[];
}

export interface SimulationResult {
  response: SimulationResponse;
  provenance: Provenance;
}

export interface DataSource {
  kind: DataSourceKind;
  describe(): string;
  simulate(req: SimulationRequest, signal?: AbortSignal): Promise<SimulationResult>;
  /** Catálogo só existe na API; em modo fixture retorna null (a UI usa as opções estáticas). */
  catalog(signal?: AbortSignal): Promise<CatalogResponse | null>;
  /** Cliente da API (para relatórios); null em modo fixture. */
  api: SimulationApi | null;
}

export const FIXTURE_URL = "/fixtures/simulation-response.REAL.json";

export class DataSourceConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataSourceConfigError";
  }
}

function isNasaPower(res: SimulationResponse): boolean {
  return res.data_version?.startsWith("nasa_power:") ?? false;
}

/** Compara os campos que mudam o resultado. Retorna nomes legíveis dos que diferem. */
export function diffAgainstFixture(req: SimulationRequest, fixtureReq: SimulationRequest | undefined): string[] {
  if (!fixtureReq) return ["request ausente no fixture"];
  const out: string[] = [];
  const eq = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
  if (!eq(req.crop, fixtureReq.crop)) out.push("cultura");
  if (!eq(req.sowing_date, fixtureReq.sowing_date)) out.push("data de semeadura");
  if (!eq(req.soil ?? "clay", fixtureReq.soil)) out.push("solo");
  if (!eq(req.management?.irrigation ?? "rainfed", fixtureReq.management?.irrigation)) out.push("irrigação");
  if (!eq(req.climate?.precip_delta_pct ?? 0, fixtureReq.climate?.precip_delta_pct ?? 0)) out.push("Δchuva");
  if (!eq(req.climate?.temp_delta_c ?? 0, fixtureReq.climate?.temp_delta_c ?? 0)) out.push("ΔT");
  if (!eq(req.economics ?? null, fixtureReq.economics ?? null)) out.push("preço/custo");
  if (!eq(req.location.lat, fixtureReq.location.lat) || !eq(req.location.lon, fixtureReq.location.lon)) out.push("local");
  if (!eq(req.first_year ?? 2001, fixtureReq.first_year) || !eq(req.last_year ?? 2024, fixtureReq.last_year)) out.push("período");
  return out;
}

function fixtureSource(fetchImpl: typeof fetch = (...a) => fetch(...a)): DataSource {
  // O cache é compartilhado entre chamadas, então NÃO recebe o signal de um chamador específico
  // (senão o abort de um componente desmontado — ex.: StrictMode — envenena as chamadas seguintes).
  let cache: Promise<SimulationResponse> | null = null;
  const load = () => {
    if (!cache) {
      cache = fetchImpl(FIXTURE_URL).then(async (r) => {
        if (!r.ok) throw new Error(`Fixture não encontrado (${FIXTURE_URL}, HTTP ${r.status})`);
        return (await r.json()) as SimulationResponse;
      });
      cache.catch(() => { cache = null; }); // permite tentar de novo
    }
    return cache;
  };
  const abortable = <T,>(p: Promise<T>, signal?: AbortSignal): Promise<T> => {
    if (!signal) return p;
    if (signal.aborted) return Promise.reject(new DOMException("Aborted", "AbortError"));
    return new Promise<T>((resolve, reject) => {
      const onAbort = () => reject(new DOMException("Aborted", "AbortError"));
      signal.addEventListener("abort", onAbort, { once: true });
      p.then(resolve, reject).finally(() => signal.removeEventListener("abort", onAbort));
    });
  };
  return {
    kind: "fixture",
    api: null,
    describe: () => `fixture: ${FIXTURE_URL}`,
    async simulate(req, signal) {
      const response = await abortable(load(), signal);
      return {
        response,
        provenance: {
          kind: "fixture",
          label: "Resultado gravado (fixture)",
          location: FIXTURE_URL,
          nasaPower: isNasaPower(response),
          fixtureMismatches: diffAgainstFixture(req, response.request),
        },
      };
    },
    catalog: async () => null,
  };
}

function apiSource(api: SimulationApi, baseUrl: string): DataSource {
  return {
    kind: "api",
    api,
    describe: () => `api: ${baseUrl}`,
    async simulate(req, signal) {
      const response = await api.simulate(req, { signal });
      return {
        response,
        provenance: { kind: "api", label: "API Gaiapus", location: baseUrl, nasaPower: isNasaPower(response),
                      fixtureMismatches: [] },
      };
    },
    catalog: (signal) => api.catalog({ signal }),
  };
}

export function resolveDataSourceKind(raw: string | undefined): DataSourceKind {
  const v = (raw ?? "").trim().toLowerCase();
  if (v === "fixture" || v === "api") return v;
  throw new DataSourceConfigError(
    `VITE_DATA_SOURCE inválido: "${raw ?? ""}". Use "fixture" ou "api" (ver apps/web/.env.example).`);
}

export function createDataSource(env: ImportMetaEnv = import.meta.env): DataSource {
  const kind = resolveDataSourceKind(env.VITE_DATA_SOURCE);
  if (kind === "fixture") return fixtureSource();
  const baseUrl = env.VITE_GAIAPUS_API_URL ?? "http://localhost:8000";
  return apiSource(createSimulationApi({ baseUrl }), baseUrl);
}
