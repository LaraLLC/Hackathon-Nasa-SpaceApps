"""Parâmetros de cultura usados pelo simulador.

Fontes dos valores tabelados:
- Kc, duração de fases, profundidade de raiz e fração p: FAO-56 (Allen et al., 1998), tabelas 11, 12 e 22.
- Ky por fase: FAO-33 (Doorenbos & Kassam, 1979) e FAO-66 (Steduto et al., 2012).

Valores marcados como `assumption` NÃO vêm dessas tabelas e devem aparecer na interface
como premissas editáveis. Rendimento de referência é sempre premissa: deve ser calibrado
com IBGE/PAM do município (ex.: média dos 3 melhores anos) antes de qualquer demonstração.
"""
from __future__ import annotations

from dataclasses import dataclass, field

# Fases usadas para o Ky (a fase "mid" da FAO-56 é dividida em floração e enchimento).
KY_PHASES = ("initial", "development", "flowering", "yield_formation", "late")


@dataclass(frozen=True)
class CropParams:
    key: str
    name_pt: str
    name_en: str
    status: str  # "experimental" (soja, milho safrinha) ou "conceptual" (café)
    stage_days: tuple[int, int, int, int]  # ini, dev, mid, late (FAO-56)
    kc_ini: float
    kc_mid: float
    kc_end: float
    root_min_m: float
    root_max_m: float
    p_table: float  # fração de esgotamento sem estresse (FAO-56 tab. 22)
    ky: dict[str, float]  # por fase em KY_PHASES
    flowering_share_of_mid: float  # fração inicial da fase mid tratada como floração
    max_height_m: float
    heat_threshold_c: float  # Tmax acima disso na floração conta como dia de estresse térmico
    reference_yield_kg_ha: float  # PREMISSA — calibrar com PAM
    bag_kg: float = 60.0
    assumptions: tuple[str, ...] = field(default_factory=tuple)

    @property
    def cycle_days(self) -> int:
        return sum(self.stage_days)


CROPS: dict[str, CropParams] = {
    "soy": CropParams(
        key="soy",
        name_pt="Soja",
        name_en="Soybean",
        status="experimental",
        stage_days=(20, 30, 50, 20),
        kc_ini=0.40,
        kc_mid=1.15,
        kc_end=0.50,
        root_min_m=0.15,
        root_max_m=1.0,
        p_table=0.50,
        ky={"initial": 0.2, "development": 0.2, "flowering": 0.8, "yield_formation": 1.0, "late": 0.2},
        flowering_share_of_mid=0.4,
        max_height_m=0.9,
        heat_threshold_c=35.0,
        reference_yield_kg_ha=4000.0,
        assumptions=(
            "Duração de fases ajustada a ciclo de 120 dias (cultivar de ciclo médio); ajustar por cultivar.",
            "Ky da fase final (0,2) é premissa; FAO-33 não tabela a maturação da soja.",
            "Rendimento de referência 4000 kg/ha é placeholder; calibrar com IBGE/PAM.",
            "Limiar de calor 35 °C na floração é indicador, não entra no cálculo de rendimento.",
        ),
    ),
    "maize_safrinha": CropParams(
        key="maize_safrinha",
        name_pt="Milho safrinha",
        name_en="Second-season maize",
        status="experimental",
        stage_days=(20, 35, 40, 30),
        kc_ini=0.30,
        kc_mid=1.20,
        kc_end=0.35,
        root_min_m=0.15,
        root_max_m=1.2,
        p_table=0.55,
        ky={"initial": 0.4, "development": 0.4, "flowering": 1.5, "yield_formation": 0.5, "late": 0.2},
        flowering_share_of_mid=0.35,
        max_height_m=2.2,
        heat_threshold_c=35.0,
        reference_yield_kg_ha=6000.0,
        assumptions=(
            "Ciclo de 125 dias; ajustar por híbrido e data de semeadura.",
            "Rendimento de referência 6000 kg/ha é placeholder; calibrar com IBGE/PAM (2ª safra).",
            "Limiar de calor 35 °C no pendoamento é indicador, não entra no cálculo de rendimento.",
        ),
    ),
    "coffee": CropParams(
        key="coffee",
        name_pt="Café (conceitual)",
        name_en="Coffee (conceptual)",
        status="conceptual",
        # Cultura perene: o "ciclo" é um ano de produção, dividido para fins de Ky.
        stage_days=(60, 60, 120, 125),
        kc_ini=0.90,
        kc_mid=0.95,
        kc_end=0.95,
        root_min_m=1.0,
        root_max_m=1.0,
        p_table=0.40,
        ky={"initial": 0.4, "development": 0.4, "flowering": 1.0, "yield_formation": 0.8, "late": 0.2},
        flowering_share_of_mid=0.3,
        max_height_m=2.0,
        heat_threshold_c=34.0,
        reference_yield_kg_ha=1800.0,
        assumptions=(
            "CENÁRIO CONCEITUAL: café não possui modelo validado no Gaiapus.",
            "Kc 0,90–0,95 (FAO-56, café sem cobertura de plantas daninhas); demais Ky são hipóteses.",
            "Bienalidade, florada pós-chuva e manejo de poda não são modelados.",
            "Rendimento de referência 1800 kg/ha (30 sc/ha) é placeholder.",
        ),
    ),
}


def get_crop(key: str) -> CropParams:
    try:
        return CROPS[key]
    except KeyError as exc:
        raise ValueError(f"Cultura desconhecida: {key}. Opções: {sorted(CROPS)}") from exc
