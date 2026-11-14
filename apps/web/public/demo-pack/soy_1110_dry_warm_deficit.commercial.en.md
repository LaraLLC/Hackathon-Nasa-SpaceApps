# Business simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:30:34.246673+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Crop:** Soybean (experimental)
- **Sowing:** 11-10 · Simulated seasons: 24 (2001–2024)
- **Soil:** Clayey (e.g., Latosol/Oxisol) · **Irrigation:** deficit irrigation
- **Location:** -18.9200, -48.2800 · IBGE 3170206
- **Scenario:** dry and warm (Δrain -20.0%, ΔT 1.5 °C)

## Summary

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Yield (bags/ha) | 66.3 | 66.6 | 66.7 |

## Water and soil

- Crop water use (typical): 4610 m³/ha
- Irrigation water (typical): 741 m³/ha
- Water-stress days (typical / bad year): 1 / 3
- Runoff (erosion proxy, typical): 15 mm

### Climate scenario vs historical

- Yield (kg/ha): P10 3985.72 → 3976.85 (Δ -8.87) · P50 4000.0 → 3996.3 (Δ -3.7) · mean 3995.64 → 3991.88 (Δ -3.76)
- Crop water use (m³/ha): P10 4261.42 → 4430.12 (Δ 168.7) · P50 4438.9 → 4610.2 (Δ 171.3) · mean 4558.08 → 4732.78 (Δ 174.7)
- Irrigation water (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 0.0 → 740.9 (Δ 740.9) · mean 554.27 → 807.43 (Δ 253.16)
- Water-stress days: P10 0.0 → 0.0 (Δ 0.0) · P50 0.0 → 1.0 (Δ 1.0) · mean 0.75 → 1.12 (Δ 0.37)

### Rainfed vs deficit irrigation

- Yield (kg/ha): P10 3976.85 → 2134.99 (Δ -1841.86) · P50 3996.3 → 3892.35 (Δ -103.95) · mean 3991.88 → 3436.13 (Δ -555.75)
- Crop water use (m³/ha): P10 4430.12 → 4141.47 (Δ -288.65) · P50 4610.2 → 4435.8 (Δ -174.4) · mean 4732.78 → 4414.65 (Δ -318.13)
- Irrigation water (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 740.9 → 0.0 (Δ -740.9) · mean 807.43 → 0.0 (Δ -807.43)
- Water-stress days: P10 0.0 → 0.0 (Δ 0.0) · P50 1.0 → 9.0 (Δ 8.0) · mean 1.12 → 17.38 (Δ 16.26)

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