"""Séries meteorológicas diárias: NASA POWER (fonte principal), cache local e perturbações de cenário.

NASA POWER Daily API: https://power.larc.nasa.gov/docs/services/api/temporal/daily/
Parâmetros: T2M_MAX, T2M_MIN, RH2M, WS2M, ALLSKY_SFC_SW_DWN, PRECTOTCORR (community=AG).
A resolução do POWER é de ~0,5° (meteorologia MERRA-2) — muito maior que um talhão; a interface
precisa dizer isso.

O gerador sintético existe só para testes automatizados. Nunca exibir resultado sintético como real.
"""
from __future__ import annotations

import json
import math
import random
from dataclasses import dataclass, replace
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

from .et0 import et0_penman_monteith

POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
POWER_PARAMS = ("T2M_MAX", "T2M_MIN", "RH2M", "WS2M", "ALLSKY_SFC_SW_DWN", "PRECTOTCORR")
POWER_FILL = -999.0


@dataclass(frozen=True)
class DayWeather:
    day: date
    tmax: float
    tmin: float
    rh: float
    ws2: float
    rs: float
    precip: float
    et0: float
    filled: bool = False  # True quando algum campo foi preenchido por interpolação


@dataclass
class WeatherSeries:
    lat: float
    lon: float
    elevation_m: float
    days: dict[date, DayWeather]
    source: str  # "nasa_power" | "synthetic_test" | "fixture"
    source_refs: list[str]
    retrieved_at: str

    def window(self, start: date, n_days: int) -> list[DayWeather] | None:
        out = []
        for i in range(n_days):
            d = start + timedelta(days=i)
            if d not in self.days:
                return None
            out.append(self.days[d])
        return out

    @property
    def first_day(self) -> date:
        return min(self.days)

    @property
    def last_day(self) -> date:
        return max(self.days)


# --------------------------------------------------------------------------- NASA POWER

def _cache_path(cache_dir: Path, lat: float, lon: float, start: date, end: date) -> Path:
    return cache_dir / f"power_{lat:.3f}_{lon:.3f}_{start:%Y%m%d}_{end:%Y%m%d}.json"


def fetch_nasa_power(
    lat: float,
    lon: float,
    start: date,
    end: date,
    cache_dir: Path | str = "data/cache/power",
    timeout_s: float = 60.0,
) -> WeatherSeries:
    """Baixa (ou lê do cache) a série diária do NASA POWER e calcula ET0."""
    cache_dir = Path(cache_dir)
    cache_dir.mkdir(parents=True, exist_ok=True)
    path = _cache_path(cache_dir, lat, lon, start, end)
    if path.exists():
        raw = json.loads(path.read_text())
    else:
        import httpx  # import tardio: testes não dependem de rede

        params = {
            "parameters": ",".join(POWER_PARAMS),
            "community": "AG",
            "latitude": f"{lat:.4f}",
            "longitude": f"{lon:.4f}",
            "start": start.strftime("%Y%m%d"),
            "end": end.strftime("%Y%m%d"),
            "format": "JSON",
        }
        resp = httpx.get(POWER_URL, params=params, timeout=timeout_s)
        resp.raise_for_status()
        raw = resp.json()
        raw["_retrieved_at"] = datetime.now(timezone.utc).isoformat()
        path.write_text(json.dumps(raw))
    return parse_power_json(raw, lat, lon)


def parse_power_json(raw: dict, lat: float, lon: float) -> WeatherSeries:
    props = raw["properties"]["parameter"]
    coords = raw.get("geometry", {}).get("coordinates", [lon, lat, 0.0])
    elevation = float(coords[2]) if len(coords) > 2 and coords[2] is not None else 0.0
    keys = sorted(props["T2M_MAX"].keys())

    def val(param: str, k: str) -> float | None:
        v = props[param].get(k)
        if v is None or float(v) <= POWER_FILL + 1:
            return None
        return float(v)

    rows: dict[date, dict] = {}
    for k in keys:
        d = datetime.strptime(k, "%Y%m%d").date()
        rows[d] = {p: val(p, k) for p in POWER_PARAMS}

    days = _build_days(rows, lat, elevation)
    return WeatherSeries(
        lat=lat,
        lon=lon,
        elevation_m=elevation,
        days=days,
        source="nasa_power",
        source_refs=["NASA POWER Daily API (community=AG), " + POWER_URL],
        retrieved_at=raw.get("_retrieved_at", "unknown"),
    )


def _build_days(rows: dict[date, dict], lat: float, elevation: float) -> dict[date, DayWeather]:
    """Preenche lacunas curtas por interpolação linear (chuva ausente → 0, marcado como filled)."""
    ordered = sorted(rows)
    for p in POWER_PARAMS:
        series = [rows[d][p] for d in ordered]
        n = len(series)
        for i in range(n):
            if series[i] is not None:
                continue
            if p == "PRECTOTCORR":
                continue
            prev_i = next((j for j in range(i - 1, -1, -1) if series[j] is not None), None)
            next_i = next((j for j in range(i + 1, n) if series[j] is not None), None)
            if prev_i is not None and next_i is not None:
                w = (i - prev_i) / (next_i - prev_i)
                series[i] = series[prev_i] * (1 - w) + series[next_i] * w
            elif prev_i is not None:
                series[i] = series[prev_i]
            elif next_i is not None:
                series[i] = series[next_i]
        for d, v in zip(ordered, series):
            rows[d][f"{p}_filled"] = rows[d][p] is None and v is not None or (p == "PRECTOTCORR" and v is None)
            rows[d][p] = v

    out: dict[date, DayWeather] = {}
    for d in ordered:
        r = rows[d]
        if any(r[p] is None for p in POWER_PARAMS if p != "PRECTOTCORR"):
            continue  # sem dado suficiente nem para interpolar
        precip = r["PRECTOTCORR"] if r["PRECTOTCORR"] is not None else 0.0
        filled = any(r.get(f"{p}_filled") for p in POWER_PARAMS)
        et0 = et0_penman_monteith(
            d, lat, elevation, r["T2M_MAX"], r["T2M_MIN"], r["RH2M"], r["WS2M"], r["ALLSKY_SFC_SW_DWN"]
        )
        out[d] = DayWeather(d, r["T2M_MAX"], r["T2M_MIN"], r["RH2M"], r["WS2M"],
                            r["ALLSKY_SFC_SW_DWN"], precip, et0, filled)
    return out


# --------------------------------------------------------------------------- cenários climáticos

def apply_climate_scenario(
    series: WeatherSeries, precip_delta_pct: float = 0.0, temp_delta_c: float = 0.0
) -> WeatherSeries:
    """Perturbação 'delta change': chuva × (1 + Δ%), Tmax/Tmin + ΔT, ET0 recalculada.

    Hipótese simplificada: umidade relativa, vento e radiação mantidos. Isto é um teste de
    sensibilidade, não uma projeção climática (CMIP6/NEX-GDDP seriam o próximo passo).
    """
    if precip_delta_pct == 0 and temp_delta_c == 0:
        return series
    factor = max(0.0, 1 + precip_delta_pct / 100.0)
    new_days = {}
    for d, w in series.days.items():
        tmax, tmin = w.tmax + temp_delta_c, w.tmin + temp_delta_c
        et0 = et0_penman_monteith(d, series.lat, series.elevation_m, tmax, tmin, w.rh, w.ws2, w.rs)
        new_days[d] = replace(w, tmax=tmax, tmin=tmin, precip=w.precip * factor, et0=et0)
    return replace(series, days=new_days)


# --------------------------------------------------------------------------- sintético (testes)

def synthetic_series(lat: float, lon: float, start: date, end: date, seed: int = 42,
                     elevation_m: float = 850.0) -> WeatherSeries:
    """Clima sintético com estação chuvosa out–mar (padrão do Cerrado). SOMENTE TESTES."""
    rng = random.Random(seed)
    days: dict[date, DayWeather] = {}
    d = start
    while d <= end:
        doy = d.timetuple().tm_yday
        wet = 0.5 + 0.5 * math.cos(2 * math.pi * (doy - 15) / 365)  # pico em janeiro
        tmax = 27 + 3 * wet + rng.gauss(0, 1.5)
        tmin = 13 + 6 * wet + rng.gauss(0, 1.2)
        rh = 45 + 35 * wet + rng.gauss(0, 5)
        ws2 = max(0.5, 2.0 + rng.gauss(0, 0.5))
        rs = max(5.0, 17 + 3 * (1 - wet) + rng.gauss(0, 3))
        precip = rng.expovariate(1 / 14.0) if rng.random() < 0.05 + 0.5 * wet else 0.0
        et0 = et0_penman_monteith(d, lat, elevation_m, tmax, tmin, min(100, rh), ws2, rs)
        days[d] = DayWeather(d, tmax, tmin, min(100, rh), ws2, rs, precip, et0)
        d += timedelta(days=1)
    return WeatherSeries(lat, lon, elevation_m, days, "synthetic_test",
                         ["SYNTHETIC — gerado para testes, não representa observação"],
                         datetime.now(timezone.utc).isoformat())
