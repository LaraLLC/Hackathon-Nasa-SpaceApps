"""Orquestra requisição → clima → ensemble → resposta com campos comuns do contrato Gaiapus."""
from __future__ import annotations

import os
from dataclasses import asdict
from datetime import date, datetime, timezone

from .crops import get_crop
from .economics import EconomicInputs
from .engine import ManagementOptions
from .impact import INDICATOR_METHODS
from .scenarios import ScenarioSpec, compare, run_ensemble, run_rotation
from .schemas import RotationRequest, SimulationRequest
from .soil import get_soil
from .weather import WeatherSeries, fetch_nasa_power, synthetic_series

MODEL_VERSION = "gaiapus-sim-0.1.0"
ENGINE_DESCRIPTION = ("FAO-56 Penman-Monteith ET0 + balanço hídrico diário (Kc único) + "
                      "resposta de rendimento à água FAO-33 (Ky por fase), ensemble sobre anos NASA POWER")

COMMON_WARNINGS = [
    "Rendimento é estimativa por modelo físico simplificado (só limitação hídrica); não considera pragas, "
    "doenças, nutrição, geada, encharcamento nem efeito direto de calor.",
    "NASA POWER tem resolução de ~0,5° (dezenas de km): o clima representa a região, não o talhão.",
    "Cenários de Δchuva/ΔT são testes de sensibilidade, não projeções climáticas.",
]


def get_weather(lat: float, lon: float, first_year: int, last_year: int) -> WeatherSeries:
    start = date(first_year, 1, 1)
    end = date(last_year + 1, 12, 31)  # safras que cruzam o ano
    today = date.today()
    if end >= today:
        end = date(today.year, today.month, 1)
    source = os.getenv("GAIAPUS_WEATHER_SOURCE", "nasa_power")
    if source == "synthetic_test":
        return synthetic_series(lat, lon, start, end)
    return fetch_nasa_power(lat, lon, start, end, cache_dir=os.getenv("GAIAPUS_POWER_CACHE", "data/cache/power"))


def _econ(e) -> EconomicInputs | None:
    if e is None:
        return None
    return EconomicInputs(e.price_per_bag, e.cost_per_ha, e.irrigation_cost_per_mm_ha, e.area_ha,
                          price_source=e.price_source, cost_source=e.cost_source)


def _mgmt(m) -> ManagementOptions:
    return ManagementOptions(m.irrigation, m.irrigation_efficiency, m.initial_available_fraction,
                             m.initial_theta_m3_m3)


def _common(series: WeatherSeries, area_id, status: str, warnings: list[str], scenario_type: str) -> dict:
    return {
        "status": status,
        "area_id": area_id,
        "spatial_scope": {"type": "point", "lat": series.lat, "lon": series.lon,
                          "weather_resolution": "NASA POWER ~0.5° x 0.625° (MERRA-2)"
                          if series.source == "nasa_power" else series.source},
        "data_version": f"{series.source}:{series.first_day.isoformat()}..{series.last_day.isoformat()}",
        "source_refs": series.source_refs + ["FAO-56 (Allen et al., 1998)", "FAO-33 (Doorenbos & Kassam, 1979)"],
        "observed_through": series.last_day.isoformat(),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "model_version": MODEL_VERSION,
        "engine": ENGINE_DESCRIPTION,
        "scenario_type": scenario_type,
        "warnings": warnings,
    }


def simulate(req: SimulationRequest, series: WeatherSeries | None = None) -> dict:
    crop = get_crop(req.crop)
    soil = get_soil(req.soil)
    series = series or get_weather(req.location.lat, req.location.lon, req.first_year, req.last_year)
    m, d = map(int, req.sowing_date.split("-"))
    mgmt = _mgmt(req.management)
    econ = _econ(req.economics)

    warnings = list(COMMON_WARNINGS)
    if crop.status == "conceptual":
        warnings.insert(0, "CENÁRIO CONCEITUAL: esta cultura não tem modelo validado no Gaiapus.")
    if req.reference_yield_kg_ha is None:
        warnings.append(f"Rendimento de referência padrão ({crop.reference_yield_kg_ha:.0f} kg/ha) é placeholder; "
                        "calibre com IBGE/PAM do município.")
    if series.source != "nasa_power":
        warnings.insert(0, "DADOS SINTÉTICOS DE TESTE — não usar em apresentação.")
    if econ is None:
        warnings.append("Sem preço/custo informados: resultados econômicos omitidos.")

    scen = ScenarioSpec(req.climate.label or ("baseline" if req.climate.precip_delta_pct == 0 and
                                              req.climate.temp_delta_c == 0 else "climate_delta"),
                        req.climate.precip_delta_pct, req.climate.temp_delta_c)
    main = run_ensemble(series, crop, soil, m, d, req.first_year, req.last_year, mgmt,
                        req.reference_yield_kg_ha, scen, econ)
    if not main.years:
        out = _common(series, req.location.area_id, "no_data",
                      warnings + ["Nenhuma safra completa no período com dados disponíveis."], scen.label)
        out["skipped_years"] = main.skipped_years
        return out

    filled = sum(y["totals"]["filled_weather_days"] for y in main.years)
    if filled:
        warnings.append(f"{filled} dias com variáveis meteorológicas preenchidas por interpolação.")

    out = _common(series, req.location.area_id, "ok", warnings, scen.label)
    out.update({
        "request": req.model_dump(),
        "crop": {"key": crop.key, "name_pt": crop.name_pt, "name_en": crop.name_en, "status": crop.status,
                 "cycle_days": crop.cycle_days, "stage_days": crop.stage_days},
        "soil": asdict(soil) | {"available_water_mm_per_m": soil.available_water_mm_per_m},
        "assumptions": list(crop.assumptions) + [
            f"Solo '{soil.name_pt}': CC {soil.theta_fc}, PMP {soil.theta_wp} m³/m³, CN {soil.curve_number} (FAO-56 tab. 19, valores centrais).",
            "Raiz cresce linearmente até o início da fase intermediária; solo novo explorado em capacidade de campo.",
        ],
        "indicator_methods": INDICATOR_METHODS,
        "scenario": asdict(main.scenario),
        "summary": main.summary,
        "seasons": main.years,
        "skipped_years": main.skipped_years,
    })
    if req.include_daily:
        out["representative_seasons"] = main.representative

    comparisons = {}
    if req.compare_with_baseline and scen.label != "baseline":
        base = run_ensemble(series, crop, soil, m, d, req.first_year, req.last_year, mgmt,
                            req.reference_yield_kg_ha, ScenarioSpec(), econ)
        comparisons["climate_vs_baseline"] = compare(base, main)
    if req.compare_irrigation:
        alt_mode = "deficit" if mgmt.irrigation == "rainfed" else "rainfed"
        alt_mgmt = ManagementOptions(alt_mode, mgmt.irrigation_efficiency, mgmt.initial_available_fraction,
                                     mgmt.initial_theta_m3_m3)
        alt = run_ensemble(series, crop, soil, m, d, req.first_year, req.last_year, alt_mgmt,
                           req.reference_yield_kg_ha, scen, econ)
        comparisons[f"{alt_mode}_vs_{mgmt.irrigation}"] = compare(main, alt)
    if comparisons:
        out["comparisons"] = comparisons
    return out


def simulate_rotation(req: RotationRequest, series: WeatherSeries | None = None) -> dict:
    soil = get_soil(req.soil)
    series = series or get_weather(req.location.lat, req.location.lon, req.first_year, req.last_year)
    plan = []
    for it in req.plan:
        m, d = map(int, it.sowing_date.split("-"))
        plan.append((get_crop(it.crop), m, d, it.reference_yield_kg_ha, _econ(it.economics)))
    scen = ScenarioSpec(req.climate.label or "rotation", req.climate.precip_delta_pct, req.climate.temp_delta_c)
    res = run_rotation(series, plan, soil, req.first_year, req.last_year, _mgmt(req.management), scen)
    warnings = list(COMMON_WARNINGS) + [
        "Dias de solo exposto são proxy (cobertura do dossel < 30%); palhada/cobertura morta não é modelada."]
    out = _common(series, req.location.area_id, "ok" if res["seasons"] else "no_data", warnings, "rotation")
    out.update({"plan": [it.model_dump() for it in req.plan], **res})
    return out
