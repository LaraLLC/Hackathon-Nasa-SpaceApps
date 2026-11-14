# Business simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:30:26.932808+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Crop:** Soybean (experimental)
- **Sowing:** 10-01 · Simulated seasons: 24 (2001–2024)
- **Soil:** Clayey (e.g., Latosol/Oxisol) · **Irrigation:** rainfed
- **Location:** -18.9200, -48.2800 · IBGE 3170206
- **Scenario:** dry and warm (Δrain -20.0%, ΔT 1.5 °C)

## Summary

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Yield (bags/ha) | 43.1 | 64.0 | 66.7 |

## Water and soil

- Crop water use (typical): 4655 m³/ha
- Irrigation water (typical): 0 m³/ha
- Water-stress days (typical / bad year): 16 / 46
- Runoff (erosion proxy, typical): 15 mm

### Climate scenario vs historical

- Yield (kg/ha): P10 3257.42 → 2588.38 (Δ -669.04) · P50 3976.95 → 3841.7 (Δ -135.25) · mean 3772.29 → 3549.89 (Δ -222.4)
- Crop water use (m³/ha): P10 4381.12 → 4314.11 (Δ -67.01) · P50 4657.7 → 4655.1 (Δ -2.6) · mean 4609.39 → 4645.39 (Δ 36.0)
- Irrigation water (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 0.0 → 0.0 (Δ 0.0) · mean 0.0 → 0.0 (Δ 0.0)
- Water-stress days: P10 0.0 → 0.0 (Δ 0.0) · P50 7.0 → 15.5 (Δ 8.5) · mean 11.75 → 20.0 (Δ 8.25)

### Deficit irrigation vs rainfed

- Yield (kg/ha): P10 2588.38 → 3978.7 (Δ 1390.32) · P50 3841.7 → 3994.6 (Δ 152.9) · mean 3549.89 → 3991.99 (Δ 442.1)
- Crop water use (m³/ha): P10 4314.11 → 4552.79 (Δ 238.68) · P50 4655.1 → 4880.85 (Δ 225.75) · mean 4645.39 → 4908.4 (Δ 263.01)
- Irrigation water (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 0.0 → 920.05 (Δ 920.05) · mean 0.0 → 957.9 (Δ 957.9)
- Water-stress days: P10 0.0 → 0.0 (Δ 0.0) · P50 15.5 → 2.0 (Δ -13.5) · mean 20.0 → 1.54 (Δ -18.46)

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