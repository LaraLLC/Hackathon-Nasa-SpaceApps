# Business simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:30:32.460125+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Crop:** Soybean (experimental)
- **Sowing:** 11-10 · Simulated seasons: 24 (2001–2024)
- **Soil:** Clayey (e.g., Latosol/Oxisol) · **Irrigation:** deficit irrigation
- **Location:** -18.9200, -48.2800 · IBGE 3170206
- **Scenario:** historical (Δrain 0.0%, ΔT 0.0 °C)

## Summary

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Yield (bags/ha) | 66.4 | 66.7 | 66.7 |

## Water and soil

- Crop water use (typical): 4439 m³/ha
- Irrigation water (typical): 0 m³/ha
- Water-stress days (typical / bad year): 0 / 2
- Runoff (erosion proxy, typical): 33 mm

### Rainfed vs deficit irrigation

- Yield (kg/ha): P10 3985.72 → 2893.18 (Δ -1092.54) · P50 4000.0 → 4000.0 (Δ 0.0) · mean 3995.64 → 3677.28 (Δ -318.36)
- Crop water use (m³/ha): P10 4261.42 → 4201.73 (Δ -59.69) · P50 4438.9 → 4379.75 (Δ -59.15) · mean 4558.08 → 4384.32 (Δ -173.76)
- Irrigation water (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 0.0 → 0.0 (Δ 0.0) · mean 554.27 → 0.0 (Δ -554.27)
- Water-stress days: P10 0.0 → 0.0 (Δ 0.0) · P50 0.0 → 0.0 (Δ 0.0) · mean 0.75 → 9.58 (Δ 8.83)

## How to read

P10 = bad year (only 1 in 10 historical years was worse); P50 = typical year; P90 = good year. Values come from running the same decision over every NASA POWER year.

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