// Mapeamento daily[] → cena, conforme docs/gaiapus-26-simulador-safra.md §4.
// Sem import de three: este módulo entra no bundle principal (painel, 2D, legendas).
//
// | daily[]                          | visual                                               |
// | das, day, stage, ky_phase        | slider de tempo; rótulo da fase                      |
// | plant_height_m, canopy_cover     | altura e densidade de folhas das plantas             |
// | root_depth_m                     | comprimento das raízes no corte de solo              |
// | soil_water_fraction              | cor do solo (seco → úmido); marcadores 15/40 cm      |
// | ks, stress_level                 | cor das folhas: verde / amarelo / marrom             |
// | precip_mm, irrigation_mm         | partículas de chuva / gotejamento                    |
// | runoff_mm, deep_percolation_mm   | seta de enxurrada / seta de drenagem                 |
// | heat_stress                      | ícone de calor                                       |
// | relative_yield_so_far            | barra "potencial de colheita restante"               |
import type { CropKey, DailyState, StressLevel } from "../../api/simulation.types";

/** Folhas (spec §4): verde, amarelo, marrom. */
export const LEAF_COLORS: Record<StressLevel, string> = {
  none: "#3f8f3a",
  moderate: "#d9b310",
  severe: "#8a5a2b",
};

/** Downlink da estaca (references/PROJECT_CONTEXT.md): led 0 apagado, 1 verde, 2 amarelo, 3 vermelho. */
export type LedCode = 0 | 1 | 2 | 3;
export const LED_FROM_STRESS: Record<StressLevel, LedCode> = { none: 1, moderate: 2, severe: 3 };
export const LED_COLORS: Record<LedCode, string> = { 0: "#3a3a38", 1: "#22c55e", 2: "#facc15", 3: "#ef4444" };

/** Profundidades dos eletrodos da estaca (protocolo: raw_15, raw_40). */
export const PROBE_DEPTHS_M = [0.15, 0.4] as const;

/** Cor do solo na zona radicular: seco (ponto de murcha, fração 0) → úmido (capacidade de campo, fração 1). */
export const SOIL_DRY = "#c9a97a";
export const SOIL_WET = "#4a3323";
/** Abaixo da raiz o balanço não é simulado (solo novo entra em CC por premissa). */
export const SOIL_UNMODELED = "#8d877d";

export function lerpHex(a: string, b: string, t: number): string {
  const k = Math.min(1, Math.max(0, t));
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, "0")).join("")}`;
}

export function soilColor(fraction: number): string {
  return lerpHex(SOIL_DRY, SOIL_WET, fraction);
}

/** Bloco de solo (m). Escala real nas 3 dimensões (sem exagero vertical); régua de profundidade na cena. */
export const BLOCK = { width: 4, depth: 2.5, soilDepth: 1.5 } as const;

/** Arranjo ILUSTRATIVO (não é população de plantas). ≤ 400 instâncias (requisito de performance). */
export const LAYOUT: Record<CropKey, { rows: number; rowSpacing: number; perRow: number; shape: "bush" | "grass" | "shrub" }> = {
  soy: { rows: 5, rowSpacing: 0.5, perRow: 56, shape: "bush" },
  maize_safrinha: { rows: 5, rowSpacing: 0.5, perRow: 20, shape: "grass" },
  coffee: { rows: 1, rowSpacing: 3.5, perRow: 5, shape: "shrub" },
};

export interface PlantSlot { x: number; z: number; rotY: number; size: number; frontRow: boolean }

/** PRNG determinístico (mesma cena a cada render). */
export function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function plantSlots(crop: CropKey): PlantSlot[] {
  const l = LAYOUT[crop];
  const rnd = mulberry32(42);
  const out: PlantSlot[] = [];
  const usableX = BLOCK.width - 0.3;
  const z0 = -((l.rows - 1) * l.rowSpacing) / 2;
  for (let r = 0; r < l.rows; r++) {
    for (let i = 0; i < l.perRow; i++) {
      const x = -usableX / 2 + (usableX * (i + 0.5)) / l.perRow + (rnd() - 0.5) * 0.02;
      out.push({ x, z: z0 + r * l.rowSpacing + (rnd() - 0.5) * 0.03, rotY: rnd() * Math.PI * 2,
                 size: 0.88 + rnd() * 0.24, frontRow: r === l.rows - 1 });
    }
  }
  return out;
}

/** Raio da copa: cobertura do dossel distribuída na entrelinha (√cover ∝ largura), limitado. */
export function canopyRadius(crop: CropKey, cover: number): number {
  const l = LAYOUT[crop];
  const maxR = crop === "coffee" ? 1.1 : (l.rowSpacing / 2) * 1.05;
  return Math.max(0, Math.sqrt(Math.max(0, cover)) * maxR);
}

/** Dia padrão ao abrir um ano: início da floração (fase mais sensível), ou o primeiro dia. */
export function defaultDas(daily: DailyState[]): number | null {
  if (!daily.length) return null;
  return (daily.find((d) => d.ky_phase === "flowering") ?? daily[0]).das;
}

export const RAIN_COLOR = "#2f80d1";
export const IRRIGATION_COLOR = "#7a68ee";

/** Partículas de chuva: proporcional à lâmina, com teto (performance). */
export function rainParticles(mm: number): number {
  return mm <= 0.2 ? 0 : Math.min(300, Math.round(20 + mm * 8));
}
