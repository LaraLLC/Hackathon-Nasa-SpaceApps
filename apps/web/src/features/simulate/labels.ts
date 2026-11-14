// Dados (não textos) das opções da aba Simular. Textos ficam em src/i18n/dict.ts.
import type { CropKey, CropStatus, IrrigationMode, SoilKey } from "../../api/simulation.types";
import type { Dict } from "../../i18n/dict";

export const CROP_OPTIONS: { key: CropKey; status: CropStatus; defaultSowing: string; defaultSoil: SoilKey }[] = [
  { key: "soy", status: "experimental", defaultSowing: "10-20", defaultSoil: "clay" },
  { key: "maize_safrinha", status: "experimental", defaultSowing: "02-15", defaultSoil: "loam" },
  { key: "coffee", status: "conceptual", defaultSowing: "09-01", defaultSoil: "clay" },
];

export const SOIL_KEYS: SoilKey[] = ["sandy", "loam", "clay"];

export const CLIMATE_PRESETS = {
  baseline: { precip_delta_pct: 0, temp_delta_c: 0 },
  dry_warm: { precip_delta_pct: -20, temp_delta_c: 1.5 },
} as const;
export type ClimatePresetKey = keyof typeof CLIMATE_PRESETS;

/** Casas decimais e sentido de "pior" por métrica de comparação. */
export const METRIC_META: Record<string, { digits: number; higherIsWorse?: boolean }> = {
  yield_kg_ha: { digits: 0 },
  crop_water_use_m3_ha: { digits: 0 },
  blue_water_m3_ha: { digits: 0, higherIsWorse: true },
  water_stress_days: { digits: 1, higherIsWorse: true },
  profit_per_ha: { digits: 0 },
};

/** Nome legível das comparações. A chave da API é "<alternativa>_vs_<base>"; a API calcula alternativa − base. */
export function comparisonTitle(key: string, t: Dict): { title: string; base: string; alt: string } {
  if (key === "climate_vs_baseline") return { title: t.cmp.climate, base: t.cmp.base_hist, alt: t.cmp.alt_scen };
  const m = /^(\w+?)_vs_(\w+)$/.exec(key);
  if (m) {
    const alt = t.irrigation[m[1] as IrrigationMode] ?? m[1];
    const base = t.irrigation[m[2] as IrrigationMode] ?? m[2];
    return { title: `${alt} vs ${base.toLowerCase()}`, base: base.toLowerCase(), alt: alt.toLowerCase() };
  }
  return { title: key, base: "base", alt: "alt" };
}
