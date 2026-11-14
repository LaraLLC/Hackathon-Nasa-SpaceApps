# Business simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:30:39.940654+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Crop:** Second-season maize (experimental)
- **Sowing:** 02-15 · Simulated seasons: 24 (2001–2024)
- **Soil:** Medium (loam) · **Irrigation:** rainfed
- **Location:** -18.9200, -48.2800 · IBGE 3170206
- **Scenario:** dry and warm (Δrain -20.0%, ΔT 1.5 °C)

## Summary

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Yield (bags/ha) | 52.2 | 71.0 | 92.4 |

## Water and soil

- Crop water use (typical): 2998 m³/ha
- Irrigation water (typical): 0 m³/ha
- Water-stress days (typical / bad year): 51 / 64
- Runoff (erosion proxy, typical): 1 mm

### Climate scenario vs historical

- Yield (kg/ha): P10 3654.69 → 3133.38 (Δ -521.31) · P50 4862.85 → 4257.85 (Δ -605.0) · mean 4825.41 → 4370.32 (Δ -455.09)
- Crop water use (m³/ha): P10 2665.85 → 2626.82 (Δ -39.03) · P50 3061.2 → 2997.8 (Δ -63.4) · mean 3004.15 → 2931.68 (Δ -72.47)
- Irrigation water (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 0.0 → 0.0 (Δ 0.0) · mean 0.0 → 0.0 (Δ 0.0)
- Water-stress days: P10 22.3 → 31.0 (Δ 8.7) · P50 45.5 → 51.0 (Δ 5.5) · mean 40.83 → 47.92 (Δ 7.09)

### Deficit irrigation vs rainfed

- Yield (kg/ha): P10 3133.38 → 5960.7 (Δ 2827.32) · P50 4257.85 → 5992.0 (Δ 1734.15) · mean 4370.32 → 5984.52 (Δ 1614.2)
- Crop water use (m³/ha): P10 2626.82 → 3375.02 (Δ 748.2) · P50 2997.8 → 3725.1 (Δ 727.3) · mean 2931.68 → 3727.35 (Δ 795.67)
- Irrigation water (m³/ha): P10 0.0 → 1100.97 (Δ 1100.97) · P50 0.0 → 2041.95 (Δ 2041.95) · mean 0.0 → 1737.62 (Δ 1737.62)
- Water-stress days: P10 31.0 → 1.0 (Δ -30.0) · P50 51.0 → 2.0 (Δ -49.0) · mean 47.92 → 1.62 (Δ -46.3)

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