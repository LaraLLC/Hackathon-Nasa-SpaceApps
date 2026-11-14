from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, model_validator

CropKey = Literal["soy", "maize_safrinha", "coffee"]
SoilKey = Literal["sandy", "loam", "clay"]


class Location(BaseModel):
    lat: float = Field(..., ge=-60, le=15, description="Latitude (cobertura agrícola atual: Brasil)")
    lon: float = Field(..., ge=-75, le=-30)
    area_id: str | None = Field(None, description="Código IBGE do município ou ID do talhão, se houver")


class Management(BaseModel):
    irrigation: Literal["rainfed", "deficit", "full"] = "rainfed"
    irrigation_efficiency: float = Field(0.85, gt=0.3, le=1.0)
    initial_available_fraction: float = Field(0.8, ge=0, le=1)
    initial_theta_m3_m3: float | None = Field(
        None, ge=0, le=0.6,
        description="Umidade volumétrica CALIBRADA da estaca. Não enviar contagem bruta.")


class Climate(BaseModel):
    precip_delta_pct: float = Field(0, ge=-80, le=80)
    temp_delta_c: float = Field(0, ge=-3, le=6)
    label: str | None = None


class Economics(BaseModel):
    price_per_bag: float = Field(..., gt=0, description="R$/saca de 60 kg")
    cost_per_ha: float = Field(..., ge=0, description="R$/ha, custo operacional sem irrigação")
    irrigation_cost_per_mm_ha: float = Field(0, ge=0)
    area_ha: float = Field(1, gt=0)
    price_source: str = "informado pelo usuário"
    cost_source: str = "informado pelo usuário"


class SimulationRequest(BaseModel):
    location: Location
    crop: CropKey
    sowing_date: str = Field(..., pattern=r"^\d{2}-\d{2}$", description="MM-DD, repetido em cada ano histórico")
    first_year: int = Field(2001, ge=1984)
    last_year: int = Field(2024, le=2100)
    soil: SoilKey = "clay"
    reference_yield_kg_ha: float | None = Field(None, gt=0, description="Calibrar com IBGE/PAM")
    management: Management = Management()
    climate: Climate = Climate()
    economics: Economics | None = None
    compare_with_baseline: bool = True
    compare_irrigation: bool = False
    include_daily: bool = True
    lang: Literal["pt", "en"] = Field("pt", description="Idioma dos textos (avisos, premissas, métodos). Não altera cálculos.")

    @model_validator(mode="after")
    def _check(self):
        if self.last_year < self.first_year:
            raise ValueError("last_year deve ser ≥ first_year")
        if self.last_year - self.first_year > 45:
            raise ValueError("Máximo de 46 safras por simulação")
        m, d = map(int, self.sowing_date.split("-"))
        if not (1 <= m <= 12 and 1 <= d <= 31):
            raise ValueError("sowing_date inválida")
        return self


class RotationItem(BaseModel):
    crop: CropKey
    sowing_date: str = Field(..., pattern=r"^\d{2}-\d{2}$")
    reference_yield_kg_ha: float | None = None
    economics: Economics | None = None


class RotationRequest(BaseModel):
    location: Location
    plan: list[RotationItem] = Field(..., min_length=1, max_length=3)
    first_year: int = 2001
    last_year: int = 2023
    soil: SoilKey = "clay"
    management: Management = Management()
    climate: Climate = Climate()
    lang: Literal["pt", "en"] = "pt"


class ReportRequest(BaseModel):
    kind: Literal["technical", "commercial"]
    result: dict
    farm_name: str | None = None
