# Business simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:12:41.391780+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Crop:** Second-season maize (experimental)
- **Sowing:** 02-15 · Simulated seasons: 24 (2001–2024)
- **Soil:** Médio (franco) · **Irrigation:** deficit
- **Location:** -18.9200, -48.2800 · IBGE 3170206
- **Scenario:** baseline (Δrain 0.0%, ΔT 0.0 °C)

## Summary

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Yield (bags/ha) | 99.7 | 99.9 | 100.0 |

## Water and soil

- Crop water use (typical): 3564 m³/ha
- Irrigation water (typical): 1224 m³/ha
- Water-stress days (typical / bad year): 1 / 2
- Runoff (erosion proxy, typical): 3 mm

### Rainfed vs deficit irrigation

- Yield (kg/ha): P10 5980.09 → 3654.69 (Δ -2325.4) · P50 5995.05 → 4862.85 (Δ -1132.2) · mean 5991.82 → 4825.41 (Δ -1166.41)
- Crop water use (m³/ha): P10 3228.77 → 2665.85 (Δ -562.92) · P50 3564.3 → 3061.2 (Δ -503.1) · mean 3570.47 → 3004.15 (Δ -566.32)
- Irrigation water (m³/ha): P10 1065.11 → 0.0 (Δ -1065.11) · P50 1223.75 → 0.0 (Δ -1223.75) · mean 1652.67 → 0.0 (Δ -1652.67)
- Water-stress days: P10 1.0 → 22.3 (Δ 21.3) · P50 1.0 → 45.5 (Δ 44.5) · mean 1.5 → 40.83 (Δ 39.33)

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