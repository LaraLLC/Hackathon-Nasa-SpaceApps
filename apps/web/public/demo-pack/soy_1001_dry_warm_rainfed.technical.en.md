# Technical simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:30:26.932808+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

## Identification

- **Crop:** Soybean (experimental)
- **Sowing:** 10-01 · Simulated seasons: 24 (2001–2024)
- **Soil:** Clayey (e.g., Latosol/Oxisol) · **Irrigation:** rainfed
- **Location:** -18.9200, -48.2800 · IBGE 3170206
- **Scenario:** dry and warm (Δrain -20.0%, ΔT 1.5 °C)
- model_version: `gaiapus-sim-0.1.0` · data_version: `nasa_power:2001-01-01..2025-12-31`

## Methods

FAO-56 Penman-Monteith ET0 + daily root-zone water balance (single Kc) + FAO-33 yield response to water (Ky by phase), ensemble over NASA POWER years

## Assumptions

- Phase durations fitted to a 120-day cycle (medium-cycle cultivar); adjust per cultivar.
- Late-phase Ky (0.2) is an assumption; FAO-33 does not tabulate soybean maturation.
- Reference yield of 4000 kg/ha is a placeholder; calibrate with IBGE/PAM.
- 35 °C heat threshold at flowering is an indicator; it does not enter the yield calculation.
- Soil 'Clayey (e.g., Latosol/Oxisol)': FC 0.36, WP 0.22 m³/m³, CN 82 (FAO-56 table 19, central values).
- Roots grow linearly until the start of the mid-season phase; newly explored soil starts at field capacity.
- Reference yield: 4000 kg/ha

## Results (distribution over historical years)

| Metric | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Yield (kg/ha) | 2588.38 | 3841.7 | 4000.0 |
| Ya/Ym | 0.65 | 0.96 | 1.0 |
| crop_water_use_m3_ha | 4314.11 | 4655.1 | 4945.64 |
| blue_water_m3_ha | 0.0 | 0.0 | 0.0 |
| green_water_m3_ha | 4314.11 | 4655.1 | 4945.64 |
| water_productivity_kg_m3 | 0.6 | 0.79 | 0.88 |
| deep_percolation_mm | 22.9 | 114.32 | 205.93 |
| runoff_mm | 3.88 | 15.34 | 26.57 |
| water_stress_days | 0.0 | 15.5 | 46.4 |
| severe_stress_days | 0.0 | 0.0 | 11.4 |
| heat_stress_days_flowering | 0.0 | 0.0 | 0.0 |
| soil_cover_days | 82.0 | 82.0 | 82.0 |

## Water by phase (typical year) — 2015

| Phase | ETc (mm) | ETa (mm) | ETa/ETc | Ky |
| --- | --- | --- | --- | --- |
| initial | 63.58 | 48.55 | 0.76 | 0.2 |
| development | 117.55 | 113.89 | 0.97 | 0.2 |
| flowering | 104.89 | 104.89 | 1.00 | 0.8 |
| yield_formation | 155.45 | 155.45 | 1.00 | 1.0 |
| late | 61.96 | 61.96 | 1.00 | 0.2 |

## Environmental indicators

| Metric | Method |
| --- | --- |
| crop_water_use_m3_ha | Cumulative ETa (mm) × 10 — crop water consumption (FAO-56). |
| blue_water_m3_ha | Applied irrigation (mm, gross) × 10 — water withdrawn from rivers/wells. |
| green_water_m3_ha | max(0, ETa − net irrigation) × 10 — rainwater used by the crop. |
| water_productivity_kg_m3 | Yield / (ETa × 10). |
| deep_percolation_mm | Drainage below the root zone — PROXY for nutrient-leaching risk. |
| runoff_mm | SCS-CN runoff — PROXY for erosion and soil-loss risk. |
| water_stress_days | Days with Ks < 1 (water below the readily available fraction). |
| severe_stress_days | Days with Ks < 0.6. |
| heat_stress_days_flowering | Days with Tmax above the crop threshold during flowering. |
| soil_cover_days | Days with canopy cover ≥ 30% — PROXY for soil protection. |

## Scenario comparison: Climate scenario vs historical

| Metric | baseline P10 | scenario P10 | Δ P10 | baseline P50 | scenario P50 | Δ P50 | Δ% P50 | baseline mean | scenario mean | Δ mean |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Yield (kg/ha) | 3257.42 | 2588.38 | -669.04 | 3976.95 | 3841.7 | -135.25 | -3.4 | 3772.29 | 3549.89 | -222.4 |
| Crop water use (m³/ha) | 4381.12 | 4314.11 | -67.01 | 4657.7 | 4655.1 | -2.6 | -0.1 | 4609.39 | 4645.39 | 36.0 |
| Irrigation water (m³/ha) | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | — | 0.0 | 0.0 | 0.0 |
| Water-stress days | 0.0 | 0.0 | 0.0 | 7.0 | 15.5 | 8.5 | 121.4 | 11.75 | 20.0 | 8.25 |

## Scenario comparison: Deficit irrigation vs rainfed

| Metric | baseline P10 | scenario P10 | Δ P10 | baseline P50 | scenario P50 | Δ P50 | Δ% P50 | baseline mean | scenario mean | Δ mean |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Yield (kg/ha) | 2588.38 | 3978.7 | 1390.32 | 3841.7 | 3994.6 | 152.9 | 4.0 | 3549.89 | 3991.99 | 442.1 |
| Crop water use (m³/ha) | 4314.11 | 4552.79 | 238.68 | 4655.1 | 4880.85 | 225.75 | 4.8 | 4645.39 | 4908.4 | 263.01 |
| Irrigation water (m³/ha) | 0.0 | 0.0 | 0.0 | 0.0 | 920.05 | 920.05 | — | 0.0 | 957.9 | 957.9 |
| Water-stress days | 0.0 | 0.0 | 0.0 | 15.5 | 2.0 | -13.5 | -87.1 | 20.0 | 1.54 | -18.46 |

## NASA data used

- **Product:** NASA POWER Daily API (temporal/daily/point), community=AG
- **Daily parameters:** `T2M_MAX` (maximum air temperature at 2 m (°C)); `T2M_MIN` (minimum air temperature at 2 m (°C)); `RH2M` (relative humidity at 2 m (%)); `WS2M` (wind speed at 2 m (m/s)); `ALLSKY_SFC_SW_DWN` (all-sky surface shortwave radiation (MJ/m²/day)); `PRECTOTCORR` (bias-corrected precipitation (mm/day))
- **Period downloaded:** 2001-01-01 → 2025-12-31 · Simulated seasons: 2001–2024
- **Point queried:** -18.9200, -48.2800 · **Resolution:** ~0.5° x 0.625° (MERRA-2) (weather represents the region, not the field)
- **Access date:** 2026-11-14
- **API:** <https://power.larc.nasa.gov/api/temporal/daily/point> · **Documentation:** <https://power.larc.nasa.gov/docs/services/api/temporal/daily/>
- **Reproducible request:** `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M_MAX,T2M_MIN,RH2M,WS2M,ALLSKY_SFC_SW_DWN,PRECTOTCORR&community=AG&latitude=-18.9200&longitude=-48.2800&start=20010101&end=20251231&format=JSON`

## Limitations and warnings

- Yield is an estimate from a simplified physical model (water limitation only); it does not account for pests, diseases, nutrition, frost, waterlogging or the direct effect of heat.
- NASA POWER resolution is ~0.5° (tens of km): weather represents the region, not the field.
- Δrain/ΔT scenarios are sensitivity tests, not climate projections.
- Default reference yield (4000 kg/ha) is a placeholder; calibrate with municipal IBGE/PAM data.
- No price/cost provided: economic results omitted.

## Provenance

- NASA POWER Daily API (community=AG), https://power.larc.nasa.gov/api/temporal/daily/point
- FAO-56 (Allen et al., 1998)
- FAO-33 (Doorenbos & Kassam, 1979)
- generated_at: 2026-11-14T18:30:26.932808+00:00 · observed_through: 2025-12-31