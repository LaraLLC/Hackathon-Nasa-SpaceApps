# Business simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:30:40.958136+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Crop:** Second-season maize (experimental)
- **Sowing:** 02-15 · Simulated seasons: 24 (2001–2024)
- **Soil:** Medium (loam) · **Irrigation:** deficit irrigation
- **Location:** -18.9200, -48.2800 · IBGE 3170206
- **Scenario:** dry and warm (Δrain -20.0%, ΔT 1.5 °C)

## Summary

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Yield (bags/ha) | 99.3 | 99.9 | 100.0 |

## Water and soil

- Crop water use (typical): 3725 m³/ha
- Irrigation water (typical): 2042 m³/ha
- Water-stress days (typical / bad year): 2 / 2
- Runoff (erosion proxy, typical): 1 mm

### Climate scenario vs historical

- Yield (kg/ha): P10 5980.09 → 5960.7 (Δ -19.39) · P50 5995.05 → 5992.0 (Δ -3.05) · mean 5991.82 → 5984.52 (Δ -7.3)
- Crop water use (m³/ha): P10 3228.77 → 3375.02 (Δ 146.25) · P50 3564.3 → 3725.1 (Δ 160.8) · mean 3570.47 → 3727.35 (Δ 156.88)
- Irrigation water (m³/ha): P10 1065.11 → 1100.97 (Δ 35.86) · P50 1223.75 → 2041.95 (Δ 818.2) · mean 1652.67 → 1737.62 (Δ 84.95)
- Water-stress days: P10 1.0 → 1.0 (Δ 0.0) · P50 1.0 → 2.0 (Δ 1.0) · mean 1.5 → 1.62 (Δ 0.12)

### Rainfed vs deficit irrigation

- Yield (kg/ha): P10 5960.7 → 3133.38 (Δ -2827.32) · P50 5992.0 → 4257.85 (Δ -1734.15) · mean 5984.52 → 4370.32 (Δ -1614.2)
- Crop water use (m³/ha): P10 3375.02 → 2626.82 (Δ -748.2) · P50 3725.1 → 2997.8 (Δ -727.3) · mean 3727.35 → 2931.68 (Δ -795.67)
- Irrigation water (m³/ha): P10 1100.97 → 0.0 (Δ -1100.97) · P50 2041.95 → 0.0 (Δ -2041.95) · mean 1737.62 → 0.0 (Δ -1737.62)
- Water-stress days: P10 1.0 → 31.0 (Δ 30.0) · P50 2.0 → 51.0 (Δ 49.0) · mean 1.62 → 47.92 (Δ 46.3)

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