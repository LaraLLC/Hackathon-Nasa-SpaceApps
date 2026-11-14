"""Motor de uma safra: balanço hídrico diário (FAO-56 cap. 8, Kc único) + resposta de rendimento
à água (FAO-33, Ky por fase, forma multiplicativa).

Ya/Ym = Π_fases [1 − Ky_f · (1 − ΣETa_f / ΣETc_f)]

Ym (rendimento sem limitação hídrica) é o rendimento de referência informado/calibrado.
O motor NÃO modela pragas, doenças, nutrição, geada, encharcamento nem efeito direto de calor
sobre o rendimento — esses limites vão para `warnings`.
"""
from __future__ import annotations

from dataclasses import dataclass, field, asdict
from datetime import date, timedelta

from .crops import KY_PHASES, CropParams
from .soil import SoilParams, scs_runoff_mm
from .weather import DayWeather

IRRIGATION_MODES = ("rainfed", "deficit", "full")


@dataclass
class ManagementOptions:
    irrigation: str = "rainfed"  # rainfed | deficit (repõe quando Dr ≥ RAW) | full (repõe quando Dr ≥ 0,5·RAW)
    irrigation_efficiency: float = 0.85
    initial_available_fraction: float = 0.8  # fração da água disponível no início (1 = capacidade de campo)
    initial_theta_m3_m3: float | None = None  # umidade da estaca CALIBRADA; substitui a fração acima


@dataclass
class DailyState:
    """Estado diário — base para gráficos e para o gêmeo digital 3D."""
    day: str
    das: int  # dias após semeadura
    stage: str  # initial | development | mid | late
    ky_phase: str
    kc: float
    root_depth_m: float
    plant_height_m: float
    canopy_cover: float  # 0–1
    et0_mm: float
    etc_mm: float
    eta_mm: float
    precip_mm: float
    runoff_mm: float
    irrigation_mm: float
    deep_percolation_mm: float
    depletion_mm: float
    taw_mm: float
    raw_mm: float
    soil_water_fraction: float  # 1 = capacidade de campo, 0 = ponto de murcha
    ks: float  # coeficiente de estresse hídrico (1 = sem estresse)
    stress_level: str  # none | moderate | severe
    heat_stress: bool
    relative_yield_so_far: float
    tmax_c: float
    tmin_c: float
    weather_filled: bool


@dataclass
class SeasonResult:
    crop: str
    sowing_date: str
    harvest_date: str
    cycle_days: int
    reference_yield_kg_ha: float
    relative_yield: float
    yield_kg_ha: float
    totals: dict = field(default_factory=dict)
    phase_water: dict = field(default_factory=dict)
    final_depletion_mm: float = 0.0
    daily: list[DailyState] = field(default_factory=list)

    def to_dict(self, include_daily: bool = True) -> dict:
        d = asdict(self)
        if not include_daily:
            d.pop("daily")
        return d


def _stage_for(das: int, crop: CropParams) -> tuple[str, float]:
    """Retorna (fase FAO-56, progresso 0–1 dentro da fase)."""
    names = ("initial", "development", "mid", "late")
    acc = 0
    for name, length in zip(names, crop.stage_days):
        if das < acc + length:
            return name, (das - acc) / length
        acc += length
    return "late", 1.0


def _kc_for(stage: str, prog: float, crop: CropParams) -> float:
    if stage == "initial":
        return crop.kc_ini
    if stage == "development":
        return crop.kc_ini + (crop.kc_mid - crop.kc_ini) * prog
    if stage == "mid":
        return crop.kc_mid
    return crop.kc_mid + (crop.kc_end - crop.kc_mid) * prog


def _ky_phase(stage: str, prog: float, crop: CropParams) -> str:
    if stage == "mid":
        return "flowering" if prog < crop.flowering_share_of_mid else "yield_formation"
    return stage


def simulate_season(
    crop: CropParams,
    soil: SoilParams,
    weather: list[DayWeather],
    reference_yield_kg_ha: float | None = None,
    management: ManagementOptions | None = None,
    initial_depletion_mm: float | None = None,
) -> SeasonResult:
    mgmt = management or ManagementOptions()
    if mgmt.irrigation not in IRRIGATION_MODES:
        raise ValueError(f"irrigation deve ser um de {IRRIGATION_MODES}")
    n = crop.cycle_days
    if len(weather) < n:
        raise ValueError(f"Série meteorológica com {len(weather)} dias; ciclo exige {n}.")
    ym = reference_yield_kg_ha or crop.reference_yield_kg_ha
    aw = soil.available_water_mm_per_m
    ramp_days = crop.stage_days[0] + crop.stage_days[1]

    # condição inicial
    zr0 = crop.root_min_m
    taw0 = aw * zr0
    if initial_depletion_mm is not None:
        dr = min(max(0.0, initial_depletion_mm), taw0)
    elif mgmt.initial_theta_m3_m3 is not None:
        theta = min(max(mgmt.initial_theta_m3_m3, soil.theta_wp), soil.theta_fc)
        dr = 1000 * (soil.theta_fc - theta) * zr0
    else:
        dr = (1 - mgmt.initial_available_fraction) * taw0

    phase_etc = {p: 0.0 for p in KY_PHASES}
    phase_eta = {p: 0.0 for p in KY_PHASES}
    tot = dict(precip=0.0, runoff=0.0, irrigation=0.0, irrigation_applied=0.0, deep_percolation=0.0,
               etc=0.0, eta=0.0, stress_days=0, severe_stress_days=0, heat_stress_days=0,
               covered_days=0, filled_weather_days=0)
    daily: list[DailyState] = []
    kc_min, kc_max = min(crop.kc_ini, crop.kc_end), max(crop.kc_mid, crop.kc_ini)

    prev_zr = zr0
    for das in range(n):
        w = weather[das]
        stage, prog = _stage_for(das, crop)
        kc = _kc_for(stage, prog, crop)
        phase = _ky_phase(stage, prog, crop)

        zr = crop.root_min_m + (crop.root_max_m - crop.root_min_m) * min(1.0, das / max(1, ramp_days))
        # raiz nova explora solo em capacidade de campo (premissa FAO-56): depleção absoluta mantida
        prev_zr = zr
        height = crop.max_height_m * min(1.0, das / max(1, ramp_days)) if crop.status != "conceptual" else crop.max_height_m
        cover = max(0.0, min(0.99, ((kc - kc_min) / max(1e-6, kc_max - kc_min)) ** (1 + 0.5 * height)))
        if crop.status == "conceptual":
            cover = 0.7  # perene: cobertura aproximadamente constante (premissa)

        taw = aw * zr
        etc = kc * w.et0
        p = min(0.8, max(0.1, crop.p_table + 0.04 * (5 - etc)))
        raw = p * taw
        dr = min(dr, taw)

        # irrigação antes do balanço do dia
        irr_net = 0.0
        trigger = {"deficit": raw, "full": 0.5 * raw}.get(mgmt.irrigation)
        if trigger is not None and dr >= trigger:
            irr_net = dr
            tot["irrigation_applied"] += irr_net / mgmt.irrigation_efficiency

        ro = scs_runoff_mm(w.precip, soil.curve_number)
        ks = 1.0 if dr <= raw else max(0.0, (taw - dr) / max(1e-6, taw - raw))
        eta = ks * etc

        water_in = w.precip - ro + irr_net
        dp = max(0.0, water_in - eta - dr)
        dr = min(taw, max(0.0, dr - water_in + eta + dp))

        phase_etc[phase] += etc
        phase_eta[phase] += eta
        tot["precip"] += w.precip
        tot["runoff"] += ro
        tot["irrigation"] += irr_net
        tot["deep_percolation"] += dp
        tot["etc"] += etc
        tot["eta"] += eta
        tot["stress_days"] += ks < 1.0
        tot["severe_stress_days"] += ks < 0.6
        heat = phase == "flowering" and w.tmax > crop.heat_threshold_c
        tot["heat_stress_days"] += heat
        tot["covered_days"] += cover >= 0.3
        tot["filled_weather_days"] += w.filled

        rel_so_far = _relative_yield(crop, phase_etc, phase_eta)
        daily.append(DailyState(
            day=w.day.isoformat(), das=das, stage=stage, ky_phase=phase, kc=round(kc, 3),
            root_depth_m=round(zr, 3), plant_height_m=round(height, 3), canopy_cover=round(cover, 3),
            et0_mm=round(w.et0, 2), etc_mm=round(etc, 2), eta_mm=round(eta, 2),
            precip_mm=round(w.precip, 2), runoff_mm=round(ro, 2), irrigation_mm=round(irr_net, 2),
            deep_percolation_mm=round(dp, 2), depletion_mm=round(dr, 2), taw_mm=round(taw, 2),
            raw_mm=round(raw, 2), soil_water_fraction=round(1 - dr / taw if taw else 0.0, 3),
            ks=round(ks, 3), stress_level="none" if ks >= 1 else ("moderate" if ks >= 0.6 else "severe"),
            heat_stress=heat, relative_yield_so_far=round(rel_so_far, 4),
            tmax_c=round(w.tmax, 1), tmin_c=round(w.tmin, 1), weather_filled=w.filled,
        ))

    rel = _relative_yield(crop, phase_etc, phase_eta)
    sow = weather[0].day
    return SeasonResult(
        crop=crop.key,
        sowing_date=sow.isoformat(),
        harvest_date=(sow + timedelta(days=n - 1)).isoformat(),
        cycle_days=n,
        reference_yield_kg_ha=ym,
        relative_yield=round(rel, 4),
        yield_kg_ha=round(rel * ym, 1),
        totals={k: (round(v, 2) if isinstance(v, float) else int(v)) for k, v in tot.items()},
        phase_water={p: {"etc_mm": round(phase_etc[p], 2), "eta_mm": round(phase_eta[p], 2),
                         "ky": crop.ky[p]} for p in KY_PHASES},
        final_depletion_mm=round(dr, 2),
        daily=daily,
    )


def _relative_yield(crop: CropParams, etc: dict, eta: dict) -> float:
    rel = 1.0
    for p in KY_PHASES:
        if etc[p] > 0:
            rel *= max(0.0, 1 - crop.ky[p] * (1 - eta[p] / etc[p]))
    return max(0.0, min(1.0, rel))
