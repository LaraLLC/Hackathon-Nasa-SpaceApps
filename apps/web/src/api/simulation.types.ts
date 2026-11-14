// Tipos da API do simulador Gaiapus (gaiapus-sim-0.1.0). Espelham apps/api/simulation/*.py.

export type CropKey = "soy" | "maize_safrinha" | "coffee";
export type SoilKey = "sandy" | "loam" | "clay";
export type IrrigationMode = "rainfed" | "deficit" | "full";
export type StressLevel = "none" | "moderate" | "severe";
export type Stage = "initial" | "development" | "mid" | "late";
export type KyPhase = "initial" | "development" | "flowering" | "yield_formation" | "late";
export type CropStatus = "experimental" | "conceptual";

export interface Economics {
  price_per_bag: number; // R$/saca 60 kg
  cost_per_ha: number;
  irrigation_cost_per_mm_ha?: number;
  area_ha?: number;
  price_source?: string;
  cost_source?: string;
}

export interface SimulationRequest {
  location: { lat: number; lon: number; area_id?: string | null };
  crop: CropKey;
  sowing_date: string; // "MM-DD"
  first_year?: number;
  last_year?: number;
  soil?: SoilKey;
  reference_yield_kg_ha?: number | null;
  management?: {
    irrigation?: IrrigationMode;
    irrigation_efficiency?: number;
    initial_available_fraction?: number;
    initial_theta_m3_m3?: number | null; // só umidade CALIBRADA da estaca
  };
  climate?: { precip_delta_pct?: number; temp_delta_c?: number; label?: string | null };
  economics?: Economics | null;
  compare_with_baseline?: boolean;
  compare_irrigation?: boolean;
  include_daily?: boolean;
  /** Idioma dos textos do motor (avisos, premissas, métodos). Padrão "pt". Não altera cálculos. */
  lang?: ReportLang;
}

export interface Dist { p10: number; p50: number; p90: number; mean: number; min: number; max: number }

export interface DailyState {
  day: string; das: number; stage: Stage; ky_phase: KyPhase; kc: number;
  root_depth_m: number; plant_height_m: number; canopy_cover: number;
  et0_mm: number; etc_mm: number; eta_mm: number; precip_mm: number; runoff_mm: number;
  irrigation_mm: number; deep_percolation_mm: number; depletion_mm: number; taw_mm: number; raw_mm: number;
  soil_water_fraction: number; ks: number; stress_level: StressLevel; heat_stress: boolean;
  relative_yield_so_far: number; tmax_c: number; tmin_c: number; weather_filled: boolean;
}

export interface Indicators {
  crop_water_use_m3_ha: number; blue_water_m3_ha: number; green_water_m3_ha: number;
  water_productivity_kg_m3: number | null; deep_percolation_mm: number; runoff_mm: number;
  water_stress_days: number; severe_stress_days: number; heat_stress_days_flowering: number;
  soil_cover_days: number;
}

export interface SeasonEconomics {
  bags_per_ha: number; revenue_per_ha: number; irrigation_cost_per_ha: number; total_cost_per_ha: number;
  profit_per_ha: number; profit_total: number; margin_pct: number | null; breakeven_bags_per_ha: number | null;
}

export interface Season {
  season_year: number; sowing_date: string; harvest_date: string; yield_kg_ha: number; relative_yield: number;
  totals: Record<string, number>; indicators: Indicators; economics: SeasonEconomics | null;
}

/** Comparação alternativa − baseline. `delta`/`delta_pct` referem-se ao P50 (contrato 0.1.0).
 *  Campos p10/mean foram adicionados depois; são opcionais para aceitar respostas antigas.
 *  Percentis são de cada distribuição separadamente, não pareados ano a ano.
 *  Atenção: em métricas "quanto maior, pior" (ex.: water_stress_days) o ano ruim é o P90, não o P10. */
export interface ComparisonItem {
  baseline_p50: number; scenario_p50: number; delta: number; delta_pct: number | null;
  baseline_p10?: number; scenario_p10?: number; delta_p10?: number;
  baseline_mean?: number; scenario_mean?: number; delta_mean?: number;
}

export interface ProbabilityOfLossComparison { baseline: number; scenario: number; delta: number }

/** Proveniência do clima para relatórios/submissão. Com `synthetic: true` só vêm provider e retrieved_at. */
export interface DataAccess {
  provider: string; // "NASA POWER" | "synthetic_test"
  synthetic: boolean;
  retrieved_at: string; // ISO; data de acesso à API (gravada no cache)
  product?: string;
  parameters?: string[];
  start?: string;
  end?: string;
  resolution?: string;
  api_url?: string;
  docs_url?: string;
  request_url?: string; // requisição reprodutível
}

export interface SimulationResponse {
  status: "ok" | "no_data";
  area_id: string | null;
  spatial_scope: { type: "point"; lat: number; lon: number; weather_resolution: string };
  data_version: string;
  source_refs: string[];
  observed_through: string;
  generated_at: string;
  model_version: string;
  engine: string;
  scenario_type: string;
  warnings: string[];
  /** Idioma dos textos desta resposta (aditivo; ausente = "pt"). */
  lang?: ReportLang;
  /** Proveniência do clima (aditivo). Ausente em respostas antigas. */
  data_access?: DataAccess;
  request?: SimulationRequest; // eco da requisição validada (com defaults aplicados)
  crop?: { key: CropKey; name_pt: string; name_en: string; status: CropStatus;
           cycle_days: number; stage_days: number[];
           /** Ym efetivamente usado (aditivo). */
           reference_yield_kg_ha?: number };
  soil?: { key: SoilKey; name_pt: string; name_en?: string; theta_fc: number; theta_wp: number; curve_number: number;
           available_water_mm_per_m: number };
  scenario?: { label: string; precip_delta_pct: number; temp_delta_c: number };
  assumptions?: string[];
  indicator_methods?: Record<keyof Indicators, string>;
  summary?: {
    n_seasons: number; yield_kg_ha: Dist; relative_yield: Dist;
    indicators: Partial<Record<keyof Indicators, Dist>>;
    economics?: { profit_per_ha: Dist; revenue_per_ha: Dist; total_cost_per_ha: Dist;
                  probability_of_loss: number; breakeven_bags_per_ha: number | null };
  };
  seasons?: Season[];
  skipped_years?: number[];
  representative_seasons?: Record<"typical" | "dry", { season_year: number; daily: DailyState[];
    phase_water: Record<KyPhase, { etc_mm: number; eta_mm: number; ky: number }> }>;
  comparisons?: Record<string, Record<string, ComparisonItem | ProbabilityOfLossComparison>>;
}

// ---------------------------------------------------------------- GET /v1/simulations/catalog

export interface CatalogResponse {
  model_version: string;
  crops: { key: CropKey; name_pt: string; name_en: string; status: CropStatus; cycle_days: number;
           default_reference_yield_kg_ha: number; assumptions: string[] }[];
  soils: { key: SoilKey; name_pt: string; available_water_mm_per_m: number }[];
  irrigation_modes: IrrigationMode[];
}

// ---------------------------------------------------------------- POST /v1/simulations/rotation

export interface RotationItem {
  crop: CropKey;
  sowing_date: string; // "MM-DD"
  reference_yield_kg_ha?: number | null;
  economics?: Economics | null;
}

export interface RotationRequest {
  location: { lat: number; lon: number; area_id?: string | null };
  plan: RotationItem[]; // 1–3 culturas
  first_year?: number;
  last_year?: number;
  soil?: SoilKey;
  management?: SimulationRequest["management"];
  climate?: SimulationRequest["climate"];
  lang?: ReportLang;
}

export interface RotationCrop {
  crop: CropKey; sowing_date: string; harvest_date: string; yield_kg_ha: number;
  indicators: Indicators; economics: SeasonEconomics | null;
}

export interface RotationSeason {
  agricultural_year: number;
  crops: RotationCrop[];
  soil_cover_days_per_365: number;
  exposed_soil_days_proxy: number; // proxy: dossel < 30%; palhada não modelada
  water_use_m3_ha: number;
  profit_per_ha: number | null; // null se alguma cultura do plano não tem economia
}

export interface RotationResponse {
  status: "ok" | "no_data";
  area_id: string | null;
  spatial_scope: SimulationResponse["spatial_scope"];
  data_version: string;
  source_refs: string[];
  observed_through: string;
  generated_at: string;
  model_version: string;
  engine: string;
  scenario_type: string;
  warnings: string[];
  data_access?: DataAccess;
  plan: RotationItem[];
  seasons: RotationSeason[];
  summary: { soil_cover_days?: Dist; water_use_m3_ha?: Dist; profit_per_ha?: Dist; probability_of_loss?: number };
  skipped_years: number[];
}

// ---------------------------------------------------------------- POST /v1/simulations/report?lang=

export type ReportKind = "technical" | "commercial";
export type ReportLang = "pt" | "en";

export interface ReportRequest {
  kind: ReportKind;
  result: SimulationResponse;
  farm_name?: string | null;
}
