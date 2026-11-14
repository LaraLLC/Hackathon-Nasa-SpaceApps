# Technical simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:30:39.019016+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

## Identification

- **Crop:** Second-season maize (experimental)
- **Sowing:** 02-15 · Simulated seasons: 24 (2001–2024)
- **Soil:** Medium (loam) · **Irrigation:** deficit irrigation
- **Location:** -18.9200, -48.2800 · IBGE 3170206
- **Scenario:** historical (Δrain 0.0%, ΔT 0.0 °C)
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
| Yield (kg/ha) | 5980.09 | 5995.05 | 5999.49 |
| Ya/Ym | 1.0 | 1.0 | 1.0 |
| crop_water_use_m3_ha | 3228.77 | 3564.3 | 3900.79 |
| blue_water_m3_ha | 1065.11 | 1223.75 | 2276.3 |
| green_water_m3_ha | 1691.29 | 2179.95 | 2710.12 |
| water_productivity_kg_m3 | 1.53 | 1.68 | 1.86 |
| deep_percolation_mm | 94.75 | 174.67 | 309.11 |
| runoff_mm | 0.32 | 3.23 | 11.99 |
| water_stress_days | 1.0 | 1.0 | 2.0 |
| severe_stress_days | 0.0 | 0.0 | 0.0 |
| heat_stress_days_flowering | 0.0 | 0.0 | 0.0 |
| soil_cover_days | 71.0 | 71.0 | 71.0 |

## Water by phase (typical year) — 2001

| Phase | ETc (mm) | ETa (mm) | ETa/ETc | Ky |
| --- | --- | --- | --- | --- |
| initial | 27.46 | 27.46 | 1.00 | 0.4 |
| development | 101.32 | 101.32 | 1.00 | 0.4 |
| flowering | 64.77 | 64.77 | 1.00 | 1.5 |
| yield_formation | 108.23 | 108.06 | 1.00 | 0.5 |
| late | 67.65 | 67.65 | 1.00 | 0.2 |

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

## Scenario comparison: Rainfed vs deficit irrigation

| Metric | baseline P10 | scenario P10 | Δ P10 | baseline P50 | scenario P50 | Δ P50 | Δ% P50 | baseline mean | scenario mean | Δ mean |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Yield (kg/ha) | 5980.09 | 3654.69 | -2325.4 | 5995.05 | 4862.85 | -1132.2 | -18.9 | 5991.82 | 4825.41 | -1166.41 |
| Crop water use (m³/ha) | 3228.77 | 2665.85 | -562.92 | 3564.3 | 3061.2 | -503.1 | -14.1 | 3570.47 | 3004.15 | -566.32 |
| Irrigation water (m³/ha) | 1065.11 | 0.0 | -1065.11 | 1223.75 | 0.0 | -1223.75 | -100.0 | 1652.67 | 0.0 | -1652.67 |
| Water-stress days | 1.0 | 22.3 | 21.3 | 1.0 | 45.5 | 44.5 | 4450.0 | 1.5 | 40.83 | 39.33 |

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
- generated_at: 2026-11-14T18:30:39.019016+00:00 · observed_through: 2025-12-31