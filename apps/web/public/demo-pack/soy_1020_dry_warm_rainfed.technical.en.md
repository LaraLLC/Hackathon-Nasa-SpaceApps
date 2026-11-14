# Technical simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:30:30.192887+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

## Identification

- **Crop:** Soybean (experimental)
- **Sowing:** 10-20 · Simulated seasons: 24 (2001–2024)
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
| Yield (kg/ha) | 2622.57 | 3982.6 | 4000.0 |
| Ya/Ym | 0.66 | 1.0 | 1.0 |
| crop_water_use_m3_ha | 4280.06 | 4570.25 | 4723.3 |
| blue_water_m3_ha | 0.0 | 0.0 | 0.0 |
| green_water_m3_ha | 4280.06 | 4570.25 | 4723.3 |
| water_productivity_kg_m3 | 0.61 | 0.85 | 0.89 |
| deep_percolation_mm | 78.22 | 186.26 | 260.11 |
| runoff_mm | 4.29 | 16.87 | 27.69 |
| water_stress_days | 0.0 | 1.0 | 47.9 |
| severe_stress_days | 0.0 | 0.0 | 19.4 |
| heat_stress_days_flowering | 0.0 | 0.0 | 0.0 |
| soil_cover_days | 82.0 | 82.0 | 82.0 |

## Water by phase (typical year) — 2001

| Phase | ETc (mm) | ETa (mm) | ETa/ETc | Ky |
| --- | --- | --- | --- | --- |
| initial | 42.86 | 42.86 | 1.00 | 0.2 |
| development | 100.49 | 100.49 | 1.00 | 0.2 |
| flowering | 95.52 | 95.52 | 1.00 | 0.8 |
| yield_formation | 146.64 | 146.64 | 1.00 | 1.0 |
| late | 71.41 | 71.41 | 1.00 | 0.2 |

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
| Yield (kg/ha) | 3417.99 | 2622.57 | -795.42 | 4000.0 | 3982.6 | -17.4 | -0.4 | 3811.3 | 3580.13 | -231.17 |
| Crop water use (m³/ha) | 4302.03 | 4280.06 | -21.97 | 4515.0 | 4570.25 | 55.25 | 1.2 | 4497.59 | 4531.8 | 34.21 |
| Irrigation water (m³/ha) | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | — | 0.0 | 0.0 | 0.0 |
| Water-stress days | 0.0 | 0.0 | 0.0 | 0.0 | 1.0 | 1.0 | — | 8.5 | 14.12 | 5.62 |

## Scenario comparison: Deficit irrigation vs rainfed

| Metric | baseline P10 | scenario P10 | Δ P10 | baseline P50 | scenario P50 | Δ P50 | Δ% P50 | baseline mean | scenario mean | Δ mean |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Yield (kg/ha) | 2622.57 | 3982.15 | 1359.58 | 3982.6 | 3999.6 | 17.0 | 0.4 | 3580.13 | 3993.44 | 413.31 |
| Crop water use (m³/ha) | 4280.06 | 4507.34 | 227.28 | 4570.25 | 4717.4 | 147.15 | 3.2 | 4531.8 | 4793.47 | 261.67 |
| Irrigation water (m³/ha) | 0.0 | 0.0 | 0.0 | 0.0 | 362.7 | 362.7 | — | 0.0 | 711.63 | 711.63 |
| Water-stress days | 0.0 | 0.0 | 0.0 | 1.0 | 0.5 | -0.5 | -50.0 | 14.12 | 0.96 | -13.16 |

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
- generated_at: 2026-11-14T18:30:30.192887+00:00 · observed_through: 2025-12-31