// Fonte de dados da aba "Simular", escolhida por VITE_DATA_SOURCE:
//   fixture → demo-pack REAL pré-calculado (public/demo-pack/, gerado por apps/api/scripts/export_demo_pack.py).
//             Só responde combinações da grade; fora dela lança ScenarioNotPrecomputedError
//             (nunca devolve outro cenário em silêncio).
//   api     → POST real em VITE_GAIAPUS_API_URL via simulationApi.ts.
//
// Todo resultado carrega `provenance` para a UI dizer de onde veio cada número.

import { createSimulationApi, type SimulationApi } from "../api/simulationApi";
import type {
  CatalogResponse, CropKey, IrrigationMode, SimulationRequest, SimulationResponse, SoilKey,
} from "../api/simulation.types";

export type DataSourceKind = "fixture" | "api";

export interface Provenance {
  kind: DataSourceKind;
  label: string;
  /** Em modo fixture: arquivo do demo-pack. Em modo api: URL base. */
  location: string;
  /** Lido de data_version da resposta (não presumido pelo modo). */
  nasaPower: boolean;
}

export interface SimulationResult {
  response: SimulationResponse;
  provenance: Provenance;
}

// ---------------------------------------------------------------- demo-pack (index.json)

export interface DemoPackClimate { precip_delta_pct: number; temp_delta_c: number; label: string | null }

export interface DemoPackEntry {
  file: string; crop: CropKey; sowing_date: string; soil: SoilKey;
  climate: string; precip_delta_pct: number; temp_delta_c: number; irrigation: IrrigationMode;
  status: string; n_seasons: number | null; yield_p50_kg_ha: number | null; bytes: number; sha256: string;
}

export interface DemoPackIndex {
  kind: "gaiapus-demo-pack";
  model_version: string;
  data_version: string;
  generated_at: string;
  location: { lat: number; lon: number; area_id: string; name: string };
  first_year: number;
  last_year: number;
  fixed: { economics: null; compare_with_baseline: boolean; compare_irrigation: boolean; include_daily: boolean;
           reference_yield_kg_ha: number | null;
           management_defaults: { irrigation_efficiency: number; initial_available_fraction: number;
                                  initial_theta_m3_m3: number | null } };
  grid: {
    crops: Partial<Record<CropKey, { soil: SoilKey; sowing_dates: string[] }>>;
    climates: Record<string, DemoPackClimate>;
    irrigation: IrrigationMode[];
  };
  excluded: Record<string, string>;
  entries: DemoPackEntry[];
}

export const DEMO_PACK_BASE = "/demo-pack";

/** A combinação pedida não está no demo-pack. `reasons` lista o que ficou fora da grade. */
export class ScenarioNotPrecomputedError extends Error {
  readonly reasons: string[];
  constructor(reasons: string[]) {
    super("Cenário não pré-calculado — disponível no modo API");
    this.name = "ScenarioNotPrecomputedError";
    this.reasons = reasons;
  }
}

export class DataSourceConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataSourceConfigError";
  }
}

export interface DataSource {
  kind: DataSourceKind;
  describe(): string;
  simulate(req: SimulationRequest, signal?: AbortSignal): Promise<SimulationResult>;
  /** Catálogo só existe na API; em modo fixture retorna null. */
  catalog(signal?: AbortSignal): Promise<CatalogResponse | null>;
  /** Grade do demo-pack (modo fixture); null em modo api (sem restrição de grade). */
  grid(signal?: AbortSignal): Promise<DemoPackIndex | null>;
  /** Cliente da API (relatórios); null em modo fixture. */
  api: SimulationApi | null;
}

function isNasaPower(res: SimulationResponse): boolean {
  return res.data_version?.startsWith("nasa_power:") ?? false;
}

const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;

/**
 * Procura a entrada do demo-pack que corresponde EXATAMENTE à requisição.
 * Retorna a entrada ou a lista de motivos pelos quais não há correspondência.
 */
export function matchDemoPack(index: DemoPackIndex, req: SimulationRequest): DemoPackEntry | string[] {
  const reasons: string[] = [];
  const crop = index.grid.crops[req.crop];
  if (!crop) reasons.push(index.excluded[req.crop] ? `cultura ${req.crop}: ${index.excluded[req.crop]}` : `cultura ${req.crop}`);
  if (!near(req.location.lat, index.location.lat) || !near(req.location.lon, index.location.lon)) reasons.push("local");
  if ((req.first_year ?? 2001) !== index.first_year || (req.last_year ?? 2024) !== index.last_year) reasons.push("período");
  if (req.economics) reasons.push("preço/custo (o demo-pack não tem economia)");
  if (req.reference_yield_kg_ha != null) reasons.push("rendimento de referência personalizado");
  const m = req.management ?? {};
  const d = index.fixed.management_defaults;
  if ((m.irrigation_efficiency ?? d.irrigation_efficiency) !== d.irrigation_efficiency ||
      (m.initial_available_fraction ?? d.initial_available_fraction) !== d.initial_available_fraction ||
      (m.initial_theta_m3_m3 ?? null) !== d.initial_theta_m3_m3) reasons.push("parâmetros de manejo avançados");
  const irrigation = m.irrigation ?? "rainfed";
  if (!index.grid.irrigation.includes(irrigation)) reasons.push(`irrigação ${irrigation}`);
  const dp = req.climate?.precip_delta_pct ?? 0;
  const dt = req.climate?.temp_delta_c ?? 0;
  const climKey = Object.entries(index.grid.climates).find(([, c]) => near(c.precip_delta_pct, dp) && near(c.temp_delta_c, dt))?.[0];
  if (!climKey) reasons.push(`clima Δchuva ${dp}% / ΔT ${dt} °C`);
  if (crop) {
    const soilName: Record<SoilKey, string> = { sandy: "arenoso", loam: "médio", clay: "argiloso" };
    const soil = req.soil ?? "clay";
    if (soil !== crop.soil) reasons.push(`solo ${soilName[soil]} (pré-calculado para esta cultura: ${soilName[crop.soil]})`);
    if (!crop.sowing_dates.includes(req.sowing_date)) {
      reasons.push(`semeadura ${req.sowing_date} (pré-calculadas: ${crop.sowing_dates.join(", ")})`);
    }
  }
  if (reasons.length) return reasons;
  const entry = index.entries.find((e) => e.crop === req.crop && e.sowing_date === req.sowing_date &&
    e.climate === climKey && e.irrigation === irrigation);
  return entry ?? ["combinação ausente do index.json"];
}

/** Junta uma promise compartilhada ao signal de UM chamador, sem cancelar a promise compartilhada. */
function abortable<T>(p: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return p;
  if (signal.aborted) return Promise.reject(new DOMException("Aborted", "AbortError"));
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(new DOMException("Aborted", "AbortError"));
    signal.addEventListener("abort", onAbort, { once: true });
    p.then(resolve, reject).finally(() => signal.removeEventListener("abort", onAbort));
  });
}

/** Cache por URL. Não recebe o signal do chamador (senão um abort — ex.: StrictMode — envenena o cache). */
function cachedJson(fetchImpl: typeof fetch) {
  const cache = new Map<string, Promise<unknown>>();
  return <T,>(url: string): Promise<T> => {
    let p = cache.get(url);
    if (!p) {
      p = fetchImpl(url).then(async (r) => {
        if (!r.ok) throw new Error(`Arquivo do demo-pack não encontrado (${url}, HTTP ${r.status})`);
        return r.json();
      });
      p.catch(() => cache.delete(url));
      cache.set(url, p);
    }
    return p as Promise<T>;
  };
}

function fixtureSource(fetchImpl: typeof fetch = (...a) => fetch(...a)): DataSource {
  const getJson = cachedJson(fetchImpl);
  const loadIndex = () => getJson<DemoPackIndex>(`${DEMO_PACK_BASE}/index.json`);
  return {
    kind: "fixture",
    api: null,
    describe: () => `demo-pack: ${DEMO_PACK_BASE}/`,
    grid: (signal) => abortable(loadIndex(), signal),
    catalog: async () => null,
    async simulate(req, signal) {
      const index = await abortable(loadIndex(), signal);
      const match = matchDemoPack(index, req);
      if (Array.isArray(match)) throw new ScenarioNotPrecomputedError(match);
      const url = `${DEMO_PACK_BASE}/${match.file}`;
      const response = await abortable(getJson<SimulationResponse>(url), signal);
      // Sanidade: o request gravado no arquivo precisa bater com a entrada do índice.
      const r = response.request;
      if (!r || r.crop !== match.crop || r.sowing_date !== match.sowing_date ||
          r.management?.irrigation !== match.irrigation || r.soil !== match.soil) {
        throw new Error(`demo-pack inconsistente: ${match.file} não corresponde ao index.json`);
      }
      return {
        response,
        provenance: { kind: "fixture", label: "Pré-calculado (demo-pack)", location: url, nasaPower: isNasaPower(response) },
      };
    },
  };
}

function apiSource(api: SimulationApi, baseUrl: string): DataSource {
  return {
    kind: "api",
    api,
    describe: () => `api: ${baseUrl}`,
    grid: async () => null,
    catalog: (signal) => api.catalog({ signal }),
    async simulate(req, signal) {
      const response = await api.simulate(req, { signal });
      return { response, provenance: { kind: "api", label: "API Gaiapus (ao vivo)", location: baseUrl,
                                       nasaPower: isNasaPower(response) } };
    },
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
