"""Economia da safra. Preço e custo são SEMPRE entradas do usuário (ou de fonte citada pela equipe,
ex.: CEPEA, CONAB custos de produção). O módulo não embute preços.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class EconomicInputs:
    price_per_bag: float  # R$/saca (60 kg)
    cost_per_ha: float  # R$/ha (custo operacional total, sem irrigação)
    irrigation_cost_per_mm_ha: float = 0.0  # R$ por mm aplicado por ha (energia + água)
    area_ha: float = 1.0
    bag_kg: float = 60.0
    price_source: str = "informado pelo usuário"
    cost_source: str = "informado pelo usuário"


def season_economics(yield_kg_ha: float, irrigation_applied_mm: float, econ: EconomicInputs) -> dict:
    bags_ha = yield_kg_ha / econ.bag_kg
    revenue_ha = bags_ha * econ.price_per_bag
    irr_cost_ha = irrigation_applied_mm * econ.irrigation_cost_per_mm_ha
    cost_ha = econ.cost_per_ha + irr_cost_ha
    profit_ha = revenue_ha - cost_ha
    breakeven_bags = cost_ha / econ.price_per_bag if econ.price_per_bag > 0 else None
    return {
        "bags_per_ha": round(bags_ha, 2),
        "revenue_per_ha": round(revenue_ha, 2),
        "irrigation_cost_per_ha": round(irr_cost_ha, 2),
        "total_cost_per_ha": round(cost_ha, 2),
        "profit_per_ha": round(profit_ha, 2),
        "profit_total": round(profit_ha * econ.area_ha, 2),
        "margin_pct": round(100 * profit_ha / revenue_ha, 1) if revenue_ha > 0 else None,
        "breakeven_bags_per_ha": round(breakeven_bags, 2) if breakeven_bags is not None else None,
    }
