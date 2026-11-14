"""Classes de solo simplificadas (FAO-56, tabela 19, valores centrais).

São premissas para quando não há análise de solo. Com estaca calibrada, use a umidade
medida apenas como condição inicial — nunca a contagem bruta do oscilador.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SoilParams:
    key: str
    name_pt: str
    theta_fc: float  # m³/m³ capacidade de campo
    theta_wp: float  # m³/m³ ponto de murcha
    curve_number: int  # SCS-CN para escoamento superficial (premissa, cultivo em linha, condição média)

    @property
    def available_water_mm_per_m(self) -> float:
        return 1000.0 * (self.theta_fc - self.theta_wp)


SOILS: dict[str, SoilParams] = {
    "sandy": SoilParams("sandy", "Arenoso", 0.12, 0.05, 68),
    "loam": SoilParams("loam", "Médio (franco)", 0.25, 0.12, 78),
    "clay": SoilParams("clay", "Argiloso (ex.: Latossolo)", 0.36, 0.22, 82),
}


def get_soil(key: str) -> SoilParams:
    try:
        return SOILS[key]
    except KeyError as exc:
        raise ValueError(f"Solo desconhecido: {key}. Opções: {sorted(SOILS)}") from exc


def scs_runoff_mm(precip_mm: float, curve_number: int) -> float:
    """Escoamento superficial diário pelo método SCS-CN (Ia = 0,2 S)."""
    if precip_mm <= 0:
        return 0.0
    s = 25400.0 / curve_number - 254.0
    ia = 0.2 * s
    if precip_mm <= ia:
        return 0.0
    return (precip_mm - ia) ** 2 / (precip_mm + 0.8 * s)
