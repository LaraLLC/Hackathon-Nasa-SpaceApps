"""Textos do simulador em PT e EN. SÓ TEXTO: nenhum valor numérico ou regra de cálculo mora aqui.

O português continua definido onde sempre esteve (crops.py, soil.py, impact.py, service.py) para que a
saída com lang="pt" seja idêntica à anterior; este módulo acrescenta o inglês e escolhe pelo idioma.
"""
from __future__ import annotations

from typing import Literal

from .crops import CROPS, CropParams
from .impact import INDICATOR_METHODS as INDICATOR_METHODS_PT
from .soil import SoilParams

Lang = Literal["pt", "en"]

ENGINE_DESCRIPTION_EN = ("FAO-56 Penman-Monteith ET0 + daily root-zone water balance (single Kc) + "
                         "FAO-33 yield response to water (Ky by phase), ensemble over NASA POWER years")

COMMON_WARNINGS_EN = [
    "Yield is an estimate from a simplified physical model (water limitation only); it does not account for pests, "
    "diseases, nutrition, frost, waterlogging or the direct effect of heat.",
    "NASA POWER resolution is ~0.5° (tens of km): weather represents the region, not the field.",
    "Δrain/ΔT scenarios are sensitivity tests, not climate projections.",
]

WARNINGS = {
    "conceptual": {"pt": "CENÁRIO CONCEITUAL: esta cultura não tem modelo validado no Gaiapus.",
                   "en": "CONCEPTUAL SCENARIO: this crop has no validated model in Gaiapus."},
    "ref_yield": {"pt": "Rendimento de referência padrão ({y:.0f} kg/ha) é placeholder; calibre com IBGE/PAM do município.",
                  "en": "Default reference yield ({y:.0f} kg/ha) is a placeholder; calibrate with municipal IBGE/PAM data."},
    "synthetic": {"pt": "DADOS SINTÉTICOS DE TESTE — não usar em apresentação.",
                  "en": "SYNTHETIC TEST DATA — do not use in presentations."},
    "no_economics": {"pt": "Sem preço/custo informados: resultados econômicos omitidos.",
                     "en": "No price/cost provided: economic results omitted."},
    "no_data": {"pt": "Nenhuma safra completa no período com dados disponíveis.",
                "en": "No complete season with available data in the period."},
    "filled": {"pt": "{n} dias com variáveis meteorológicas preenchidas por interpolação.",
               "en": "{n} days with weather variables filled by interpolation."},
    "rotation_cover": {"pt": "Dias de solo exposto são proxy (cobertura do dossel < 30%); palhada/cobertura morta não é modelada.",
                       "en": "Bare-soil days are a proxy (canopy cover < 30%); straw/mulch is not modelled."},
}

CROP_ASSUMPTIONS_EN: dict[str, tuple[str, ...]] = {
    "soy": (
        "Phase durations fitted to a 120-day cycle (medium-cycle cultivar); adjust per cultivar.",
        "Late-phase Ky (0.2) is an assumption; FAO-33 does not tabulate soybean maturation.",
        "Reference yield of 4000 kg/ha is a placeholder; calibrate with IBGE/PAM.",
        "35 °C heat threshold at flowering is an indicator; it does not enter the yield calculation.",
    ),
    "maize_safrinha": (
        "125-day cycle; adjust per hybrid and sowing date.",
        "Reference yield of 6000 kg/ha is a placeholder; calibrate with IBGE/PAM (second season).",
        "35 °C heat threshold at tasseling is an indicator; it does not enter the yield calculation.",
    ),
    "coffee": (
        "CONCEPTUAL SCENARIO: coffee has no validated model in Gaiapus.",
        "Kc 0.90–0.95 (FAO-56, coffee without weed cover); the other Ky values are hypotheses.",
        "Biennial bearing, post-rain flowering and pruning management are not modelled.",
        "Reference yield of 1800 kg/ha (30 bags/ha) is a placeholder.",
    ),
}

SOIL_NAMES_EN = {"sandy": "Sandy", "loam": "Medium (loam)", "clay": "Clayey (e.g., Latosol/Oxisol)"}

INDICATOR_METHODS_EN = {
    "crop_water_use_m3_ha": "Cumulative ETa (mm) × 10 — crop water consumption (FAO-56).",
    "blue_water_m3_ha": "Applied irrigation (mm, gross) × 10 — water withdrawn from rivers/wells.",
    "green_water_m3_ha": "max(0, ETa − net irrigation) × 10 — rainwater used by the crop.",
    "water_productivity_kg_m3": "Yield / (ETa × 10).",
    "deep_percolation_mm": "Drainage below the root zone — PROXY for nutrient-leaching risk.",
    "runoff_mm": "SCS-CN runoff — PROXY for erosion and soil-loss risk.",
    "water_stress_days": "Days with Ks < 1 (water below the readily available fraction).",
    "severe_stress_days": "Days with Ks < 0.6.",
    "heat_stress_days_flowering": "Days with Tmax above the crop threshold during flowering.",
    "soil_cover_days": "Days with canopy cover ≥ 30% — PROXY for soil protection.",
}

_SOIL_ASSUMPTION = {
    "pt": "Solo '{name}': CC {fc}, PMP {wp} m³/m³, CN {cn} (FAO-56 tab. 19, valores centrais).",
    "en": "Soil '{name}': FC {fc}, WP {wp} m³/m³, CN {cn} (FAO-56 table 19, central values).",
}
_ROOT_ASSUMPTION = {
    "pt": "Raiz cresce linearmente até o início da fase intermediária; solo novo explorado em capacidade de campo.",
    "en": "Roots grow linearly until the start of the mid-season phase; newly explored soil starts at field capacity.",
}


def warning(key: str, lang: Lang, **kw) -> str:
    return WARNINGS[key][lang].format(**kw)


def common_warnings(lang: Lang, pt: list[str]) -> list[str]:
    return list(pt) if lang == "pt" else list(COMMON_WARNINGS_EN)


def engine_description(lang: Lang, pt: str) -> str:
    return pt if lang == "pt" else ENGINE_DESCRIPTION_EN


def soil_name(soil: SoilParams, lang: Lang) -> str:
    return soil.name_pt if lang == "pt" else SOIL_NAMES_EN[soil.key]


def crop_assumptions(crop: CropParams, soil: SoilParams, lang: Lang) -> list[str]:
    base = list(crop.assumptions) if lang == "pt" else list(CROP_ASSUMPTIONS_EN[crop.key])
    return base + [
        _SOIL_ASSUMPTION[lang].format(name=soil_name(soil, lang), fc=soil.theta_fc, wp=soil.theta_wp, cn=soil.curve_number),
        _ROOT_ASSUMPTION[lang],
    ]


_SOURCE_REFS_EN = {"SYNTHETIC — gerado para testes, não representa observação":
                   "SYNTHETIC — generated for tests, does not represent observations"}


def source_refs(refs: list[str], lang: Lang) -> list[str]:
    """Referências da série (as do NASA POWER já são em inglês; só a sintética de teste precisa de tradução)."""
    return list(refs) if lang == "pt" else [_SOURCE_REFS_EN.get(r, r) for r in refs]


def indicator_methods(lang: Lang) -> dict[str, str]:
    return dict(INDICATOR_METHODS_PT) if lang == "pt" else dict(INDICATOR_METHODS_EN)


# Garantia estrutural: toda cultura tem premissas EN na mesma quantidade das PT.
assert all(len(CROP_ASSUMPTIONS_EN[k]) == len(c.assumptions) for k, c in CROPS.items()), "premissas EN incompletas"
assert set(INDICATOR_METHODS_EN) == set(INDICATOR_METHODS_PT), "métodos EN incompletos"
