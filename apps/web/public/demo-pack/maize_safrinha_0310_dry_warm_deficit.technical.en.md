# Technical simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:30:44.196501+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

## Identification

- **Crop:** Second-season maize (experimental)
- **Sowing:** 03-10 · Simulated seasons: 24 (2001–2024)
- **Soil:** Medium (loam) · **Irrigation:** deficit irrigation
- **Location:** -18.9200, -48.2800 · IBGE 3170206
- **Scenario:** dry and warm (Δrain -20.0%, ΔT 1.5 °C)
- model_version: `gaiapus-sim-0.1.0` · data_version: `nasa_power:2001-01-01..2025-12-31`

## Methods

FAO-56 Penman-Monteith ET0 + daily root-zone water balance (single Kc) + FAO-33 yield response to water (Ky by phase), ensemble over NASA POWER years

## Assumptions

- 125-day cycle; adjust per hybrid and sowing date.
- Reference yield of 6000 kg/ha is a placeholder; calibrate with IBGE/PAM (second season).
- 35 °C heat threshold at tasseling is an indicator; it does not enter the yield calculation.
- Soil 'Medium (loam)': FC 0.25, WP 0.12 m³/m³, CN 78 (FAO-56 table 19, central values).
- Roots grow linearly until the start of the mid-season phase; newly explored soil starts at field capacity.
- Reference yield: 6000 kg/ha

## Results (distribution over historical years)

| Metric | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Yield (kg/ha) | 5924.91 | 5991.6 | 5996.45 |
| Ya/Ym | 0.99 | 1.0 | 1.0 |
| crop_water_use_m3_ha | 3150.91 | 3452.35 | 3847.56 |
| blue_water_m3_ha | 1153.28 | 2244.55 | 3359.37 |
| green_water_m3_ha | 956.23 | 1548.1 | 2147.87 |
| water_productivity_kg_m3 | 1.56 | 1.73 | 1.9 |
| deep_percolation_mm | 25.14 | 76.16 | 167.03 |
| runoff_mm | 0.0 | 0.24 | 2.36 |
| water_stress_days | 1.0 | 2.0 | 3.0 |
| severe_stress_days | 0.0 | 0.0 | 0.0 |
| heat_stress_days_flowering | 0.0 | 0.0 | 0.0 |
| soil_cover_days | 71.0 | 71.0 | 71.0 |

## Water by phase (typical year) — 2022

| Phase | ETc (mm) | ETa (mm) | ETa/ETc | Ky |
| --- | --- | --- | --- | --- |
| initial | 26.68 | 26.68 | 1.00 | 0.4 |
| development | 112.24 | 112.24 | 1.00 | 0.4 |
| flowering | 55.86 | 55.85 | 1.00 | 1.5 |
| yield_formation | 101.78 | 101.61 | 1.00 | 0.5 |
| late | 85.85 | 85.8 | 1.00 | 0.2 |

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
| Yield (kg/ha) | 5959.48 | 5924.91 | -34.57 | 5989.3 | 5991.6 | 2.3 | 0.0 | 5981.32 | 5974.18 | -7.14 |
| Crop water use (m³/ha) | 3007.19 | 3150.91 | 143.72 | 3297.85 | 3452.35 | 154.5 | 4.7 | 3364.49 | 3518.39 | 153.9 |
| Irrigation water (m³/ha) | 1128.16 | 1153.28 | 25.12 | 2227.2 | 2244.55 | 17.35 | 0.8 | 2023.4 | 2320.59 | 297.19 |
| Water-stress days | 1.0 | 1.0 | 0.0 | 2.0 | 2.0 | 0.0 | 0.0 | 1.79 | 2.08 | 0.29 |

## Scenario comparison: Rainfed vs deficit irrigation

| Metric | baseline P10 | scenario P10 | Δ P10 | baseline P50 | scenario P50 | Δ P50 | Δ% P50 | baseline mean | scenario mean | Δ mean |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Yield (kg/ha) | 5924.91 | 1914.69 | -4010.22 | 5991.6 | 3596.9 | -2394.7 | -40.0 | 5974.18 | 3424.71 | -2549.47 |
| Crop water use (m³/ha) | 3150.91 | 2159.79 | -991.12 | 3452.35 | 2418.55 | -1033.8 | -29.9 | 3518.39 | 2424.34 | -1094.05 |
| Irrigation water (m³/ha) | 1153.28 | 0.0 | -1153.28 | 2244.55 | 0.0 | -2244.55 | -100.0 | 2320.59 | 0.0 | -2320.59 |
| Water-stress days | 1.0 | 46.3 | 45.3 | 2.0 | 59.0 | 57.0 | 2850.0 | 2.08 | 58.79 | 56.71 |

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
- Default reference yield (6000 kg/ha) is a placeholder; calibrate with municipal IBGE/PAM data.
- No price/cost provided: economic results omitted.

## Provenance

- NASA POWER Daily API (community=AG), https://power.larc.nasa.gov/api/temporal/daily/point
- FAO-56 (Allen et al., 1998)
- FAO-33 (Doorenbos & Kassam, 1979)
- generated_at: 2026-11-14T18:30:44.196501+00:00 · observed_through: 2025-12-31