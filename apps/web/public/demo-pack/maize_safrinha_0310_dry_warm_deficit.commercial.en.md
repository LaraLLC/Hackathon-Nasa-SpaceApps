# Business simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:30:44.196501+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Crop:** Second-season maize (experimental)
- **Sowing:** 03-10 · Simulated seasons: 24 (2001–2024)
- **Soil:** Medium (loam) · **Irrigation:** deficit irrigation
- **Location:** -18.9200, -48.2800 · IBGE 3170206
- **Scenario:** dry and warm (Δrain -20.0%, ΔT 1.5 °C)

## Summary

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Yield (bags/ha) | 98.7 | 99.9 | 99.9 |

## Water and soil

- Crop water use (typical): 3452 m³/ha
- Irrigation water (typical): 2245 m³/ha
- Water-stress days (typical / bad year): 2 / 3
- Runoff (erosion proxy, typical): 0 mm

### Climate scenario vs historical

- Yield (kg/ha): P10 5959.48 → 5924.91 (Δ -34.57) · P50 5989.3 → 5991.6 (Δ 2.3) · mean 5981.32 → 5974.18 (Δ -7.14)
- Crop water use (m³/ha): P10 3007.19 → 3150.91 (Δ 143.72) · P50 3297.85 → 3452.35 (Δ 154.5) · mean 3364.49 → 3518.39 (Δ 153.9)
- Irrigation water (m³/ha): P10 1128.16 → 1153.28 (Δ 25.12) · P50 2227.2 → 2244.55 (Δ 17.35) · mean 2023.4 → 2320.59 (Δ 297.19)
- Water-stress days: P10 1.0 → 1.0 (Δ 0.0) · P50 2.0 → 2.0 (Δ 0.0) · mean 1.79 → 2.08 (Δ 0.29)

### Rainfed vs deficit irrigation

- Yield (kg/ha): P10 5924.91 → 1914.69 (Δ -4010.22) · P50 5991.6 → 3596.9 (Δ -2394.7) · mean 5974.18 → 3424.71 (Δ -2549.47)
- Crop water use (m³/ha): P10 3150.91 → 2159.79 (Δ -991.12) · P50 3452.35 → 2418.55 (Δ -1033.8) · mean 3518.39 → 2424.34 (Δ -1094.05)
- Irrigation water (m³/ha): P10 1153.28 → 0.0 (Δ -1153.28) · P50 2244.55 → 0.0 (Δ -2244.55) · mean 2320.59 → 0.0 (Δ -2320.59)
- Water-stress days: P10 1.0 → 46.3 (Δ 45.3) · P50 2.0 → 59.0 (Δ 57.0) · mean 2.08 → 58.79 (Δ 56.71)

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