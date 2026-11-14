# Business simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:30:42.323008+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Crop:** Second-season maize (experimental)
- **Sowing:** 03-10 · Simulated seasons: 24 (2001–2024)
- **Soil:** Medium (loam) · **Irrigation:** deficit irrigation
- **Location:** -18.9200, -48.2800 · IBGE 3170206
- **Scenario:** historical (Δrain 0.0%, ΔT 0.0 °C)

## Summary

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Yield (bags/ha) | 99.3 | 99.8 | 100.0 |

## Water and soil

- Crop water use (typical): 3298 m³/ha
- Irrigation water (typical): 2227 m³/ha
- Water-stress days (typical / bad year): 2 / 2
- Runoff (erosion proxy, typical): 1 mm

### Rainfed vs deficit irrigation

- Yield (kg/ha): P10 5959.48 → 2497.37 (Δ -3462.11) · P50 5989.3 → 4016.9 (Δ -1972.4) · mean 5981.32 → 4000.62 (Δ -1980.7)
- Crop water use (m³/ha): P10 3007.19 → 2234.45 (Δ -772.74) · P50 3297.85 → 2469.05 (Δ -828.8) · mean 3364.49 → 2506.9 (Δ -857.59)
- Irrigation water (m³/ha): P10 1128.16 → 0.0 (Δ -1128.16) · P50 2227.2 → 0.0 (Δ -2227.2) · mean 2023.4 → 0.0 (Δ -2023.4)
- Water-stress days: P10 1.0 → 37.3 (Δ 36.3) · P50 2.0 → 57.0 (Δ 55.0) · mean 1.79 → 52.88 (Δ 51.09)

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