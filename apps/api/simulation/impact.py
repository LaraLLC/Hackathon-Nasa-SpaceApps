"""Indicadores ambientais e sociais derivados do balanço hídrico. Cada indicador declara o método.

Nenhum é medição: são CALCULADOS a partir da simulação e herdam suas premissas.
"""
from __future__ import annotations

from .engine import SeasonResult

INDICATOR_METHODS = {
    "crop_water_use_m3_ha": "ETa acumulada (mm) × 10 — consumo de água pela cultura (FAO-56).",
    "blue_water_m3_ha": "Irrigação aplicada (mm, bruta) × 10 — água retirada de rios/poços.",
    "green_water_m3_ha": "max(0, ETa − irrigação líquida) × 10 — água da chuva usada pela cultura.",
    "water_productivity_kg_m3": "Rendimento / (ETa × 10).",
    "deep_percolation_mm": "Drenagem abaixo da raiz — PROXY de risco de lixiviação de nutrientes.",
    "runoff_mm": "Escoamento SCS-CN — PROXY de risco de erosão e perda de solo.",
    "water_stress_days": "Dias com Ks < 1 (água abaixo da fração facilmente disponível).",
    "severe_stress_days": "Dias com Ks < 0,6.",
    "heat_stress_days_flowering": "Dias com Tmax acima do limiar da cultura durante a floração.",
    "soil_cover_days": "Dias com cobertura do dossel ≥ 30% — PROXY de proteção do solo.",
}


def season_indicators(res: SeasonResult) -> dict:
    t = res.totals
    eta = t["eta"]
    return {
        "crop_water_use_m3_ha": round(eta * 10, 1),
        "blue_water_m3_ha": round(t["irrigation_applied"] * 10, 1),
        "green_water_m3_ha": round(max(0.0, eta - t["irrigation"]) * 10, 1),
        "water_productivity_kg_m3": round(res.yield_kg_ha / (eta * 10), 3) if eta > 0 else None,
        "deep_percolation_mm": t["deep_percolation"],
        "runoff_mm": t["runoff"],
        "water_stress_days": t["stress_days"],
        "severe_stress_days": t["severe_stress_days"],
        "heat_stress_days_flowering": t["heat_stress_days"],
        "soil_cover_days": t["covered_days"],
    }
