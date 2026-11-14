# Business simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:12:36.665444+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Crop:** Soybean (experimental)
- **Sowing:** 10-20 · Simulated seasons: 24 (2001–2024)
- **Soil:** Argiloso (ex.: Latossolo) · **Irrigation:** deficit
- **Location:** -18.9200, -48.2800 · IBGE 3170206
- **Scenario:** baseline (Δrain 0.0%, ΔT 0.0 °C)

## Summary

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Yield (bags/ha) | 66.5 | 66.7 | 66.7 |

## Water and soil

- Crop water use (typical): 4542 m³/ha
- Irrigation water (typical): 0 m³/ha
- Water-stress days (typical / bad year): 0 / 2
- Runoff (erosion proxy, typical): 39 mm

### Rainfed vs deficit irrigation

- Yield (kg/ha): P10 3992.63 → 3417.99 (Δ -574.64) · P50 4000.0 → 4000.0 (Δ 0.0) · mean 3997.59 → 3811.3 (Δ -186.29)
- Crop water use (m³/ha): P10 4336.35 → 4302.03 (Δ -34.32) · P50 4541.9 → 4515.0 (Δ -26.9) · mean 4617.95 → 4497.59 (Δ -120.36)
- Irrigation water (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 0.0 → 0.0 (Δ 0.0) · mean 396.66 → 0.0 (Δ -396.66)
- Water-stress days: P10 0.0 → 0.0 (Δ 0.0) · P50 0.0 → 0.0 (Δ 0.0) · mean 0.54 → 8.5 (Δ 7.96)

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

- Rendimento é estimativa por modelo físico simplificado (só limitação hídrica); não considera pragas, doenças, nutrição, geada, encharcamento nem efeito direto de calor.
- NASA POWER tem resolução de ~0,5° (dezenas de km): o clima representa a região, não o talhão.
- Cenários de Δchuva/ΔT são testes de sensibilidade, não projeções climáticas.
- Rendimento de referência padrão (4000 kg/ha) é placeholder; calibre com IBGE/PAM do município.
- Sem preço/custo informados: resultados econômicos omitidos.