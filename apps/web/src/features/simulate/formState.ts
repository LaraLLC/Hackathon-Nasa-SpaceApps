import type { CropKey, IrrigationMode, SimulationRequest, SoilKey } from "../../api/simulation.types";
import type { DataSourceKind } from "../../data/dataSource";
import { parseLocaleNumber } from "../../lib/format";
import { PLACES } from "../../lib/places";
import { CLIMATE_PRESETS, CROP_OPTIONS, type ClimatePresetKey } from "./labels";

export const FIRST_YEAR = 2001;
export const LAST_YEAR = 2024;

export interface FormState {
  placeIbge: string;
  crop: CropKey;
  sowingDate: string; // MM-DD
  soil: SoilKey;
  irrigation: Extract<IrrigationMode, "rainfed" | "deficit">;
  /** Modo fixture: preset. Modo API: sliders livres. */
  climatePreset: ClimatePresetKey;
  precipDeltaPct: number;
  tempDeltaC: number;
  price: string; // R$/saca (texto do input; vazio = não informado)
  cost: string; // R$/ha
  priceSource: string;
  costSource: string;
}

export const DEFAULT_FORM: FormState = {
  placeIbge: PLACES[0].ibge,
  crop: "soy",
  sowingDate: "10-20",
  soil: "clay",
  irrigation: "rainfed",
  climatePreset: "baseline",
  precipDeltaPct: 0,
  tempDeltaC: 0,
  price: "",
  cost: "",
  priceSource: "",
  costSource: "",
};

/** Ao trocar de cultura, volta para a data e o solo padrão dela. */
export function withCrop(form: FormState, crop: CropKey): FormState {
  const opt = CROP_OPTIONS.find((c) => c.key === crop)!;
  return { ...form, crop, sowingDate: opt.defaultSowing, soil: opt.defaultSoil };
}

/** Campos do formulário endereçáveis por erro (ids dos inputs = `f-<campo>`). */
export type FieldKey = "crop" | "sowing_date" | "soil" | "irrigation" | "precip_delta_pct" | "temp_delta_c"
  | "price_per_bag" | "cost_per_ha" | "price_source" | "cost_source" | "location";

/** loc do Pydantic (["body","economics","price_per_bag"]) → campo do formulário; null = erro geral. */
export function fieldFromLoc(loc: (string | number)[]): FieldKey | null {
  const p = loc.filter((x) => x !== "body").map(String);
  const leaf = p[p.length - 1];
  const map: Record<string, FieldKey> = {
    crop: "crop", sowing_date: "sowing_date", soil: "soil", irrigation: "irrigation",
    precip_delta_pct: "precip_delta_pct", temp_delta_c: "temp_delta_c",
    price_per_bag: "price_per_bag", cost_per_ha: "cost_per_ha", price_source: "price_source",
    cost_source: "cost_source", lat: "location", lon: "location", location: "location",
  };
  if (p[0] === "economics" && p.length === 1) return "price_per_bag";
  return leaf ? map[leaf] ?? null : null;
}

/**
 * Monta a requisição. Economia só vai se preço OU custo foi preenchido — se faltar o outro,
 * a API devolve 422 no campo (não inventamos valor). Texto não numérico vira NaN → 422 também.
 */
export function toRequest(form: FormState, mode: DataSourceKind): SimulationRequest {
  const place = PLACES.find((p) => p.ibge === form.placeIbge) ?? PLACES[0];
  const climate = mode === "fixture"
    ? { precip_delta_pct: CLIMATE_PRESETS[form.climatePreset].precip_delta_pct,
        temp_delta_c: CLIMATE_PRESETS[form.climatePreset].temp_delta_c,
        label: form.climatePreset === "baseline" ? null : form.climatePreset }
    : { precip_delta_pct: form.precipDeltaPct, temp_delta_c: form.tempDeltaC, label: null };
  const price = parseLocaleNumber(form.price);
  const cost = parseLocaleNumber(form.cost);
  const hasEconomics = mode === "api" && (price !== null || cost !== null);
  return {
    location: { lat: place.lat, lon: place.lon, area_id: place.ibge },
    crop: form.crop,
    sowing_date: form.sowingDate.trim(),
    first_year: FIRST_YEAR,
    last_year: LAST_YEAR,
    soil: form.soil,
    management: { irrigation: form.irrigation },
    climate,
    // null/NaN vão como null no JSON → a API responde 422 no campo correspondente.
    economics: hasEconomics
      ? {
          price_per_bag: price as number,
          cost_per_ha: cost as number,
          price_source: form.priceSource.trim() || "informado pelo usuário",
          cost_source: form.costSource.trim() || "informado pelo usuário",
        }
      : null,
    compare_with_baseline: true,
    compare_irrigation: true,
    include_daily: true,
  };
}
