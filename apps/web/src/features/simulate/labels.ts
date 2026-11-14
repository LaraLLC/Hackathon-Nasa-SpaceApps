// Rótulos da UI. Nomes de cultura/solo espelham apps/api/simulation/{crops,soil}.py;
// no modo API o catálogo (GET /v1/simulations/catalog) tem precedência.
import type { CropKey, CropStatus, IrrigationMode, KyPhase, SoilKey } from "../../api/simulation.types";

export const CROP_OPTIONS: { key: CropKey; label: string; status: CropStatus; defaultSowing: string; defaultSoil: SoilKey }[] = [
  { key: "soy", label: "Soja", status: "experimental", defaultSowing: "10-20", defaultSoil: "clay" },
  { key: "maize_safrinha", label: "Milho safrinha", status: "experimental", defaultSowing: "02-15", defaultSoil: "loam" },
  { key: "coffee", label: "Café", status: "conceptual", defaultSowing: "09-01", defaultSoil: "clay" },
];

export const SOIL_LABELS: Record<SoilKey, string> = {
  sandy: "Arenoso",
  loam: "Médio (franco)",
  clay: "Argiloso (ex.: Latossolo)",
};

/** A aba oferece só sequeiro e deficitária (o motor também tem "full"). */
export const IRRIGATION_LABELS: Partial<Record<IrrigationMode, string>> = {
  rainfed: "Sequeiro",
  deficit: "Irrigação deficitária",
  full: "Irrigação plena",
};

export const PHASE_LABELS: Record<KyPhase, string> = {
  initial: "Inicial",
  development: "Desenvolvimento",
  flowering: "Floração",
  yield_formation: "Enchimento",
  late: "Maturação",
};

export const CLIMATE_PRESETS = {
  baseline: { label: "Histórico", precip_delta_pct: 0, temp_delta_c: 0 },
  dry_warm: { label: "Seco e quente (−20%, +1,5 °C)", precip_delta_pct: -20, temp_delta_c: 1.5 },
} as const;
export type ClimatePresetKey = keyof typeof CLIMATE_PRESETS;

/** Métricas de comparação e o sentido de "pior". */
export const METRICS: Record<string, { label: string; unit: string; digits: number; higherIsWorse?: boolean }> = {
  yield_kg_ha: { label: "Rendimento", unit: "kg/ha", digits: 0 },
  crop_water_use_m3_ha: { label: "Água consumida pela lavoura", unit: "m³/ha", digits: 0 },
  blue_water_m3_ha: { label: "Água de irrigação", unit: "m³/ha", digits: 0, higherIsWorse: true },
  water_stress_days: { label: "Dias de estresse hídrico", unit: "dias", digits: 1, higherIsWorse: true },
  profit_per_ha: { label: "Lucro", unit: "R$/ha", digits: 0 },
};

/** Nome legível das comparações. A chave da API é "<alternativa>_vs_<base>"; a API calcula alternativa − base. */
export function comparisonTitle(key: string): { title: string; base: string; alt: string } {
  if (key === "climate_vs_baseline") return { title: "Cenário climático vs histórico", base: "histórico", alt: "cenário" };
  const m = /^(\w+?)_vs_(\w+)$/.exec(key);
  if (m) {
    const alt = IRRIGATION_LABELS[m[1] as IrrigationMode] ?? m[1];
    const base = IRRIGATION_LABELS[m[2] as IrrigationMode] ?? m[2];
    return { title: `${alt} vs ${base.toLowerCase()}`, base: base.toLowerCase(), alt: alt.toLowerCase() };
  }
  return { title: key, base: "base", alt: "alternativa" };
}
