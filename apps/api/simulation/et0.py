"""Evapotranspiração de referência diária, FAO-56 Penman-Monteith (eq. 6).

Entradas compatíveis com NASA POWER (community=AG):
T2M_MAX, T2M_MIN (°C), RH2M (%), WS2M (m/s), ALLSKY_SFC_SW_DWN (MJ/m²/dia).
"""
from __future__ import annotations

import math
from datetime import date


def _svp(t: float) -> float:
    return 0.6108 * math.exp(17.27 * t / (t + 237.3))


def extraterrestrial_radiation(lat_deg: float, day: date) -> float:
    """Ra em MJ/m²/dia (FAO-56 eq. 21)."""
    j = day.timetuple().tm_yday
    phi = math.radians(lat_deg)
    dr = 1 + 0.033 * math.cos(2 * math.pi * j / 365)
    delta = 0.409 * math.sin(2 * math.pi * j / 365 - 1.39)
    ws = math.acos(max(-1.0, min(1.0, -math.tan(phi) * math.tan(delta))))
    return (24 * 60 / math.pi) * 0.0820 * dr * (
        ws * math.sin(phi) * math.sin(delta) + math.cos(phi) * math.cos(delta) * math.sin(ws)
    )


def et0_penman_monteith(
    day: date,
    lat_deg: float,
    elevation_m: float,
    tmax: float,
    tmin: float,
    rh_mean: float,
    ws2: float,
    rs: float,
) -> float:
    tmean = (tmax + tmin) / 2
    pressure = 101.3 * ((293 - 0.0065 * elevation_m) / 293) ** 5.26
    gamma = 0.000665 * pressure
    es = (_svp(tmax) + _svp(tmin)) / 2
    ea = max(0.0, min(es, es * rh_mean / 100.0))
    delta = 4098 * _svp(tmean) / (tmean + 237.3) ** 2

    ra = extraterrestrial_radiation(lat_deg, day)
    rso = (0.75 + 2e-5 * elevation_m) * ra
    rns = (1 - 0.23) * rs
    sigma = 4.903e-9
    ratio = min(1.0, rs / rso) if rso > 0 else 0.5
    rnl = (
        sigma
        * (((tmax + 273.16) ** 4 + (tmin + 273.16) ** 4) / 2)
        * (0.34 - 0.14 * math.sqrt(ea))
        * (1.35 * ratio - 0.35)
    )
    rn = rns - rnl
    g = 0.0

    num = 0.408 * delta * (rn - g) + gamma * (900 / (tmean + 273)) * ws2 * (es - ea)
    den = delta + gamma * (1 + 0.34 * ws2)
    return max(0.0, num / den)
