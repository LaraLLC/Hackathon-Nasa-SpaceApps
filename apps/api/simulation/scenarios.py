"""Simulação por ensemble climatológico.

Ideia central (honesta e defensável): em vez de "prever" o clima da próxima safra, rodamos a mesma
decisão (cultura, data de semeadura, solo, manejo) em cada ano histórico do NASA POWER.
O resultado é uma DISTRIBUIÇÃO (P10/P50/P90) e uma probabilidade de prejuízo — é isto que o produtor
e o agrônomo devem ler. Cenários climáticos aplicam deltas sobre esse mesmo histórico.
"""
from __future__ import annotations

import statistics
from dataclasses import dataclass, field
from datetime import date

from .crops import CropParams
from .economics import EconomicInputs, season_economics
from .engine import ManagementOptions, SeasonResult, simulate_season
from .impact import season_indicators
from .soil import SoilParams
from .weather import WeatherSeries, apply_climate_scenario


@dataclass
class ScenarioSpec:
    label: str = "baseline"
    precip_delta_pct: float = 0.0
    temp_delta_c: float = 0.0


@dataclass
class EnsembleResult:
    scenario: ScenarioSpec
    years: list[dict] = field(default_factory=list)  # um item por ano histórico
    summary: dict = field(default_factory=dict)
    representative: dict = field(default_factory=dict)  # anos "típico" e "ruim" com estados diários
    skipped_years: list[int] = field(default_factory=list)


def _percentile(values: list[float], q: float) -> float:
    if not values:
        return float("nan")
    s = sorted(values)
    k = (len(s) - 1) * q
    lo, hi = int(k), min(int(k) + 1, len(s) - 1)
    return s[lo] + (s[hi] - s[lo]) * (k - lo)


def _dist(values: list[float]) -> dict:
    return {
        "p10": round(_percentile(values, 0.10), 2),
        "p50": round(_percentile(values, 0.50), 2),
        "p90": round(_percentile(values, 0.90), 2),
        "mean": round(statistics.fmean(values), 2),
        "min": round(min(values), 2),
        "max": round(max(values), 2),
    }


def run_ensemble(
    series: WeatherSeries,
    crop: CropParams,
    soil: SoilParams,
    sowing_month: int,
    sowing_day: int,
    first_year: int,
    last_year: int,
    management: ManagementOptions,
    reference_yield_kg_ha: float | None,
    scenario: ScenarioSpec,
    economics: EconomicInputs | None = None,
) -> EnsembleResult:
    s = apply_climate_scenario(series, scenario.precip_delta_pct, scenario.temp_delta_c)
    out = EnsembleResult(scenario=scenario)
    results: list[tuple[int, SeasonResult, dict, dict | None]] = []

    for year in range(first_year, last_year + 1):
        try:
            sow = date(year, sowing_month, sowing_day)
        except ValueError:  # 29/02 em ano não bissexto
            sow = date(year, sowing_month, 28)
        window = s.window(sow, crop.cycle_days)
        if window is None:
            out.skipped_years.append(year)
            continue
        res = simulate_season(crop, soil, window, reference_yield_kg_ha, management)
        ind = season_indicators(res)
        eco = season_economics(res.yield_kg_ha, res.totals["irrigation_applied"], economics) if economics else None
        results.append((year, res, ind, eco))

    if not results:
        return out

    for year, res, ind, eco in results:
        out.years.append({
            "season_year": year,
            "sowing_date": res.sowing_date,
            "harvest_date": res.harvest_date,
            "yield_kg_ha": res.yield_kg_ha,
            "relative_yield": res.relative_yield,
            "totals": res.totals,
            "indicators": ind,
            "economics": eco,
        })

    yields = [r.yield_kg_ha for _, r, _, _ in results]
    summary: dict = {
        "n_seasons": len(results),
        "yield_kg_ha": _dist(yields),
        "relative_yield": _dist([r.relative_yield for _, r, _, _ in results]),
        "indicators": {
            k: _dist([ind[k] for _, _, ind, _ in results if ind[k] is not None])
            for k in results[0][2]
            if any(ind[k] is not None for _, _, ind, _ in results)
        },
    }
    if economics:
        profits = [eco["profit_per_ha"] for *_, eco in results]
        summary["economics"] = {
            "profit_per_ha": _dist(profits),
            "revenue_per_ha": _dist([eco["revenue_per_ha"] for *_, eco in results]),
            "total_cost_per_ha": _dist([eco["total_cost_per_ha"] for *_, eco in results]),
            "probability_of_loss": round(sum(p < 0 for p in profits) / len(profits), 3),
            "breakeven_bags_per_ha": results[0][3]["breakeven_bags_per_ha"],
        }
    out.summary = summary

    # anos representativos para o 3D: o mais próximo da mediana e o mais próximo do P10
    p50, p10 = _percentile(yields, 0.5), _percentile(yields, 0.1)
    typical = min(results, key=lambda r: abs(r[1].yield_kg_ha - p50))
    bad = min(results, key=lambda r: abs(r[1].yield_kg_ha - p10))
    out.representative = {
        "typical": {"season_year": typical[0], "daily": typical[1].to_dict()["daily"],
                    "phase_water": typical[1].phase_water},
        "dry": {"season_year": bad[0], "daily": bad[1].to_dict()["daily"],
                "phase_water": bad[1].phase_water},
    }
    return out


def compare(baseline: EnsembleResult, alt: EnsembleResult) -> dict:
    """Diferença (alternativa − baseline) em P50, P10 e média de cada distribuição.

    Campos legados (contrato 0.1.0): baseline_p50, scenario_p50, delta (= Δ P50), delta_pct (= Δ% P50).
    Campos novos: baseline_p10, scenario_p10, delta_p10, baseline_mean, scenario_mean, delta_mean.
    Os percentis são de cada distribuição separadamente (não pareados ano a ano).
    """
    def stat(e: EnsembleResult, path: list[str], q: str):
        v = e.summary
        for k in path:
            v = v.get(k, {}) if isinstance(v, dict) else {}
        return v.get(q) if isinstance(v, dict) else None

    keys = {
        "yield_kg_ha": ["yield_kg_ha"],
        "crop_water_use_m3_ha": ["indicators", "crop_water_use_m3_ha"],
        "blue_water_m3_ha": ["indicators", "blue_water_m3_ha"],
        "water_stress_days": ["indicators", "water_stress_days"],
        "profit_per_ha": ["economics", "profit_per_ha"],
    }
    out = {}
    for name, path in keys.items():
        a, b = stat(baseline, path, "p50"), stat(alt, path, "p50")
        if a is None or b is None:
            continue
        item = {"baseline_p50": a, "scenario_p50": b, "delta": round(b - a, 2),
                "delta_pct": round(100 * (b - a) / a, 1) if a else None}
        for q in ("p10", "mean"):
            qa, qb = stat(baseline, path, q), stat(alt, path, q)
            if qa is not None and qb is not None:
                item.update({f"baseline_{q}": qa, f"scenario_{q}": qb, f"delta_{q}": round(qb - qa, 2)})
        out[name] = item
    pl_a = baseline.summary.get("economics", {}).get("probability_of_loss")
    pl_b = alt.summary.get("economics", {}).get("probability_of_loss")
    if pl_a is not None and pl_b is not None:
        out["probability_of_loss"] = {"baseline": pl_a, "scenario": pl_b, "delta": round(pl_b - pl_a, 3)}
    return out


def run_rotation(
    series: WeatherSeries,
    plan: list[tuple[CropParams, int, int, float | None, EconomicInputs | None]],
    soil: SoilParams,
    first_year: int,
    last_year: int,
    management: ManagementOptions,
    scenario: ScenarioSpec,
) -> dict:
    """Sequência de culturas no mesmo ano agrícola (ex.: soja out → milho safrinha fev).

    A depleção do solo no fim de uma cultura vira condição inicial da seguinte.
    Cada item do plano: (cultura, mês, dia, rendimento_ref, economia).
    """
    s = apply_climate_scenario(series, scenario.precip_delta_pct, scenario.temp_delta_c)
    seasons = []
    skipped = []
    for year in range(first_year, last_year + 1):
        carry = None
        last_harvest: date | None = None
        items = []
        ok = True
        y = year
        for crop, m, d, ref, econ in plan:
            sow = date(y, m, d)
            if last_harvest and sow <= last_harvest:
                sow = date(y + 1, m, d)
                y += 1
            window = s.window(sow, crop.cycle_days)
            if window is None:
                ok = False
                break
            res = simulate_season(crop, soil, window, ref, management, initial_depletion_mm=carry)
            carry = res.final_depletion_mm
            last_harvest = date.fromisoformat(res.harvest_date)
            eco = season_economics(res.yield_kg_ha, res.totals["irrigation_applied"], econ) if econ else None
            items.append({"crop": crop.key, "sowing_date": res.sowing_date, "harvest_date": res.harvest_date,
                          "yield_kg_ha": res.yield_kg_ha, "indicators": season_indicators(res),
                          "economics": eco})
        if not ok:
            skipped.append(year)
            continue
        covered = sum(i["indicators"]["soil_cover_days"] for i in items)
        profit = sum(i["economics"]["profit_per_ha"] for i in items if i["economics"]) if all(
            i["economics"] for i in items) else None
        seasons.append({
            "agricultural_year": year,
            "crops": items,
            "soil_cover_days_per_365": covered,
            "exposed_soil_days_proxy": max(0, 365 - covered),
            "water_use_m3_ha": round(sum(i["indicators"]["crop_water_use_m3_ha"] for i in items), 1),
            "profit_per_ha": round(profit, 2) if profit is not None else None,
        })
    summary = {}
    if seasons:
        summary["soil_cover_days"] = _dist([x["soil_cover_days_per_365"] for x in seasons])
        summary["water_use_m3_ha"] = _dist([x["water_use_m3_ha"] for x in seasons])
        if all(x["profit_per_ha"] is not None for x in seasons):
            profits = [x["profit_per_ha"] for x in seasons]
            summary["profit_per_ha"] = _dist(profits)
            summary["probability_of_loss"] = round(sum(p < 0 for p in profits) / len(profits), 3)
    return {"seasons": seasons, "summary": summary, "skipped_years": skipped}
