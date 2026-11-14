import os
from datetime import date, timedelta

import pytest

os.environ["GAIAPUS_WEATHER_SOURCE"] = "synthetic_test"

from simulation.crops import CROPS  # noqa: E402
from simulation.engine import ManagementOptions, simulate_season  # noqa: E402
from simulation.et0 import et0_penman_monteith  # noqa: E402
from simulation.reports import build_report  # noqa: E402
from simulation.schemas import RotationRequest, SimulationRequest  # noqa: E402
from simulation.service import simulate, simulate_rotation  # noqa: E402
from simulation.soil import SOILS  # noqa: E402
from simulation.weather import DayWeather, parse_power_json, synthetic_series  # noqa: E402

LAT, LON = -18.92, -48.28  # Uberlândia


def test_et0_fao56_example18():
    # FAO-56 exemplo 18 (Bruxelas, 6 de julho): ET0 ≈ 3,9 mm/dia
    v = et0_penman_monteith(date(2023, 7, 6), 50.8, 100, 21.5, 12.3, (63 + 84) / 2, 2.078, 22.07)
    assert 3.6 < v < 4.2


def _flat(n, precip, et0=5.0):
    d0 = date(2020, 10, 15)
    return [DayWeather(d0 + timedelta(days=i), 30, 18, 70, 2, 20, precip, et0) for i in range(n)]


def test_no_stress_with_ample_rain():
    r = simulate_season(CROPS["soy"], SOILS["clay"], _flat(130, 15.0))
    assert r.relative_yield > 0.99
    assert r.totals["stress_days"] == 0


def test_drought_reduces_yield_and_irrigation_recovers():
    dry = _flat(130, 0.0)
    rainfed = simulate_season(CROPS["soy"], SOILS["sandy"], dry)
    irrigated = simulate_season(CROPS["soy"], SOILS["sandy"], dry, management=ManagementOptions("deficit"))
    assert rainfed.relative_yield < 0.4
    assert irrigated.relative_yield > 0.98
    assert irrigated.totals["irrigation_applied"] > irrigated.totals["irrigation"]  # eficiência < 1


def test_mass_balance_closes():
    w = synthetic_series(LAT, LON, date(2020, 10, 1), date(2021, 3, 1)).window(date(2020, 10, 15), 120)
    r = simulate_season(CROPS["soy"], SOILS["loam"], w, management=ManagementOptions(initial_available_fraction=1.0))
    t = r.totals
    # Δ armazenamento = entradas − saídas  →  Dr_final − Dr_inicial = ETa + DP + RO − P − I
    lhs = r.final_depletion_mm - 0.0
    rhs = t["eta"] + t["deep_percolation"] + t["runoff"] - t["precip"] - t["irrigation"]
    assert abs(lhs - rhs) < 0.5


def _req(**kw):
    base = dict(location={"lat": LAT, "lon": LON, "area_id": "3170206"}, crop="soy", sowing_date="10-20",
                first_year=2001, last_year=2010, soil="clay",
                economics={"price_per_bag": 100, "cost_per_ha": 4000})
    base.update(kw)
    return SimulationRequest(**base)


def test_full_simulation_contract():
    out = simulate(_req(climate={"precip_delta_pct": -20, "temp_delta_c": 1.5}, compare_irrigation=True))
    assert out["status"] == "ok"
    for k in ("area_id", "spatial_scope", "data_version", "source_refs", "observed_through", "generated_at",
              "warnings", "model_version", "scenario_type", "summary", "seasons", "representative_seasons"):
        assert k in out
    assert out["summary"]["n_seasons"] == 10
    assert "climate_vs_baseline" in out["comparisons"]
    assert out["comparisons"]["climate_vs_baseline"]["yield_kg_ha"]["delta"] <= 0
    assert any("SINTÉTICOS" in w for w in out["warnings"])
    assert len(out["representative_seasons"]["typical"]["daily"]) == CROPS["soy"].cycle_days
    assert 0 <= out["summary"]["economics"]["probability_of_loss"] <= 1


def test_comparison_has_p10_and_mean():
    out = simulate(_req(climate={"precip_delta_pct": -20, "temp_delta_c": 1.5}, compare_irrigation=True))
    for comp in out["comparisons"].values():
        for k, v in comp.items():
            if k == "probability_of_loss":
                assert set(v) == {"baseline", "scenario", "delta"}
                continue
            # campos legados preservados
            assert {"baseline_p50", "scenario_p50", "delta", "delta_pct"} <= set(v)
            for q in ("p10", "mean"):
                assert v[f"delta_{q}"] == pytest.approx(v[f"scenario_{q}"] - v[f"baseline_{q}"], abs=0.011)
    y = out["comparisons"]["climate_vs_baseline"]["yield_kg_ha"]
    assert y["scenario_p10"] == out["summary"]["yield_kg_ha"]["p10"]  # cenário = distribuição principal
    tech = build_report(out, "technical")
    assert "Δ P10" in tech and "média" in tech
    assert "P10 " in build_report(out, "commercial")


def test_data_access_and_report_header_synthetic():
    out = simulate(_req())
    assert out["data_access"]["synthetic"] is True
    for kind in ("technical", "commercial"):
        pt = build_report(out, kind, lang="pt")
        en = build_report(out, kind, lang="en")
        assert "DADOS SINTÉTICOS" in pt and "SYNTHETIC TEST DATA" in en
        assert "## Dados NASA utilizados" in pt and "## NASA data used" in en
        assert "Nenhum dado NASA" in pt  # sintético: não finge ter usado NASA
        assert f"model_version `{out['model_version']}`" in pt and out["data_version"] in pt


def test_report_nasa_section_with_real_like_series():
    raw = {"geometry": {"coordinates": [LON, LAT, 870.0]}, "_retrieved_at": "2026-11-14T10:00:00+00:00",
           "properties": {"parameter": {p: {} for p in
                                        ("T2M_MAX", "T2M_MIN", "RH2M", "WS2M", "ALLSKY_SFC_SW_DWN", "PRECTOTCORR")}}}
    d = date(2001, 1, 1)
    while d <= date(2002, 12, 31):
        k = d.strftime("%Y%m%d")
        for p, v in (("T2M_MAX", 30), ("T2M_MIN", 18), ("RH2M", 70), ("WS2M", 2), ("ALLSKY_SFC_SW_DWN", 20),
                     ("PRECTOTCORR", 5)):
            raw["properties"]["parameter"][p][k] = v
        d += timedelta(days=1)
    series = parse_power_json(raw, LAT, LON)
    out = simulate(_req(first_year=2001, last_year=2001), series=series)
    da = out["data_access"]
    assert da["synthetic"] is False and da["retrieved_at"].startswith("2026-11-14")
    assert da["request_url"].startswith("https://power.larc.nasa.gov/api/temporal/daily/point?")
    assert "PRECTOTCORR" in da["request_url"] and "community=AG" in da["request_url"]
    for kind in ("technical", "commercial"):
        pt = build_report(out, kind, lang="pt")
        assert "Fonte do clima: NASA POWER" in pt
        assert "**Data de acesso:** 2026-11-14" in pt
        assert "<https://power.larc.nasa.gov/api/temporal/daily/point>" in pt
        assert "`PRECTOTCORR`" in pt and "~0.5°" in pt
        en = build_report(out, kind, lang="en")
        assert "## NASA data used" in en and "**Access date:** 2026-11-14" in en


def test_report_accepts_legacy_comparison_without_p10():
    out = simulate(_req(climate={"precip_delta_pct": -20}))
    for comp in out["comparisons"].values():
        for v in comp.values():
            for k in [k for k in v if k.endswith(("_p10", "_mean"))]:
                del v[k]
    assert "—" in build_report(out, "technical")
    assert build_report(out, "commercial").startswith("#")


def test_report_reference_yield_is_exact():
    out = simulate(_req(crop="maize_safrinha", sowing_date="03-10", soil="loam", climate={"precip_delta_pct": -20}))
    assert out["crop"]["reference_yield_kg_ha"] == CROPS["maize_safrinha"].reference_yield_kg_ha
    assert f"Rendimento de referência: {CROPS['maize_safrinha'].reference_yield_kg_ha:.0f} kg/ha" in build_report(out, "technical")


def test_coffee_flagged_conceptual():
    out = simulate(_req(crop="coffee", sowing_date="09-01", economics=None))
    assert out["warnings"][0].startswith("DADOS SINTÉTICOS") or "CONCEITUAL" in " ".join(out["warnings"])
    assert any("CONCEITUAL" in w for w in out["warnings"])


def test_rotation_soy_then_safrinha():
    req = RotationRequest(location={"lat": LAT, "lon": LON}, first_year=2001, last_year=2008,
                          plan=[{"crop": "soy", "sowing_date": "10-15",
                                 "economics": {"price_per_bag": 100, "cost_per_ha": 4000}},
                                {"crop": "maize_safrinha", "sowing_date": "02-15",
                                 "economics": {"price_per_bag": 50, "cost_per_ha": 3500}}])
    out = simulate_rotation(req)
    assert out["status"] == "ok" and len(out["seasons"]) >= 7
    s0 = out["seasons"][0]
    assert s0["crops"][1]["sowing_date"] > s0["crops"][0]["harvest_date"]
    assert "probability_of_loss" in out["summary"]


def test_reports_render():
    out = simulate(_req(climate={"precip_delta_pct": -20}))
    tech = build_report(out, "technical")
    com = build_report(out, "commercial", lang="en", farm_name="Demo Farm")
    assert "FAO-56" in tech and "P50" in tech
    assert "Probability of loss" in com


def test_power_parser_handles_fill_values():
    raw = {"geometry": {"coordinates": [LON, LAT, 870.0]},
           "properties": {"parameter": {
               "T2M_MAX": {"20240101": 30, "20240102": -999, "20240103": 32},
               "T2M_MIN": {"20240101": 19, "20240102": 19, "20240103": 20},
               "RH2M": {"20240101": 70, "20240102": 72, "20240103": 71},
               "WS2M": {"20240101": 2, "20240102": 2, "20240103": 2},
               "ALLSKY_SFC_SW_DWN": {"20240101": 20, "20240102": 21, "20240103": 19},
               "PRECTOTCORR": {"20240101": 5, "20240102": -999, "20240103": 0}}}}
    s = parse_power_json(raw, LAT, LON)
    d2 = s.days[date(2024, 1, 2)]
    assert d2.tmax == pytest.approx(31.0) and d2.precip == 0 and d2.filled
    assert s.elevation_m == 870.0


def test_api_endpoints():
    from fastapi import FastAPI
    from fastapi.testclient import TestClient
    from simulation.router import router

    app = FastAPI()
    app.include_router(router)
    c = TestClient(app)
    assert c.get("/v1/simulations/catalog").status_code == 200
    r = c.post("/v1/simulations", json=_req().model_dump())
    assert r.status_code == 200
    assert c.post("/v1/simulations", json={"crop": "soy"}).status_code == 422
    rep = c.post("/v1/simulations/report", json={"kind": "technical", "result": r.json()})
    assert rep.status_code == 200 and rep.text.startswith("#")
