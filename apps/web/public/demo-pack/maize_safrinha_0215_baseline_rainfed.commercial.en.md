# Business simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:30:38.311193+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Crop:** Second-season maize (experimental)
- **Sowing:** 02-15 · Simulated seasons: 24 (2001–2024)
- **Soil:** Medium (loam) · **Irrigation:** rainfed
- **Location:** -18.9200, -48.2800 · IBGE 3170206
- **Scenario:** historical (Δrain 0.0%, ΔT 0.0 °C)

## Summary

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Yield (bags/ha) | 60.9 | 81.0 | 97.8 |

## Water and soil

- Crop water use (typical): 3061 m³/ha
- Irrigation water (typical): 0 m³/ha
- Water-stress days (typical / bad year): 46 / 60
- Runoff (erosion proxy, typical): 3 mm

### Deficit irrigation vs rainfed

- Yield (kg/ha): P10 3654.69 → 5980.09 (Δ 2325.4) · P50 4862.85 → 5995.05 (Δ 1132.2) · mean 4825.41 → 5991.82 (Δ 1166.41)
- Crop water use (m³/ha): P10 2665.85 → 3228.77 (Δ 562.92) · P50 3061.2 → 3564.3 (Δ 503.1) · mean 3004.15 → 3570.47 (Δ 566.32)
- Irrigation water (m³/ha): P10 0.0 → 1065.11 (Δ 1065.11) · P50 0.0 → 1223.75 (Δ 1223.75) · mean 0.0 → 1652.67 (Δ 1652.67)
- Water-stress days: P10 22.3 → 1.0 (Δ -21.3) · P50 45.5 → 1.0 (Δ -44.5) · mean 40.83 → 1.5 (Δ -39.33)

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
- Default reference yield (6000 kg/ha) is a placeholder; calibrate with municipal IBGE/PAM data.
- No price/cost provided: economic results omitted.