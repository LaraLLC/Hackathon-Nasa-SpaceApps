# Business simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:12:39.649666+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Crop:** Second-season maize (experimental)
- **Sowing:** 02-01 · Simulated seasons: 24 (2001–2024)
- **Soil:** Médio (franco) · **Irrigation:** deficit
- **Location:** -18.9200, -48.2800 · IBGE 3170206
- **Scenario:** baseline (Δrain 0.0%, ΔT 0.0 °C)

## Summary

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Yield (bags/ha) | 99.8 | 100.0 | 100.0 |

## Water and soil

- Crop water use (typical): 3753 m³/ha
- Irrigation water (typical): 1212 m³/ha
- Water-stress days (typical / bad year): 1 / 2
- Runoff (erosion proxy, typical): 5 mm

### Rainfed vs deficit irrigation

- Yield (kg/ha): P10 5990.16 → 4388.81 (Δ -1601.35) · P50 5997.9 → 5218.0 (Δ -779.9) · mean 5995.6 → 5253.23 (Δ -742.37)
- Crop water use (m³/ha): P10 3415.66 → 3054.52 (Δ -361.14) · P50 3753.15 → 3395.4 (Δ -357.75) · mean 3745.86 → 3332.61 (Δ -413.25)
- Irrigation water (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 1211.6 → 0.0 (Δ -1211.6) · mean 1331.62 → 0.0 (Δ -1331.62)
- Water-stress days: P10 0.0 → 0.0 (Δ 0.0) · P50 1.0 → 34.5 (Δ 33.5) · mean 1.21 → 28.46 (Δ 27.25)

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
- Rendimento de referência padrão (6000 kg/ha) é placeholder; calibre com IBGE/PAM do município.
- Sem preço/custo informados: resultados econômicos omitidos.