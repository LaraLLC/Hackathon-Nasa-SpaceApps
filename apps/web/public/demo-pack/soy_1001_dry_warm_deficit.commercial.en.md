# Business simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:12:35.992248+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Crop:** Soybean (experimental)
- **Sowing:** 10-01 · Simulated seasons: 24 (2001–2024)
- **Soil:** Argiloso (ex.: Latossolo) · **Irrigation:** deficit
- **Location:** -18.9200, -48.2800 · IBGE 3170206
- **Scenario:** dry_warm (Δrain -20.0%, ΔT 1.5 °C)

## Summary

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Yield (bags/ha) | 66.3 | 66.6 | 66.7 |

## Water and soil

- Crop water use (typical): 4881 m³/ha
- Irrigation water (typical): 920 m³/ha
- Water-stress days (typical / bad year): 2 / 4
- Runoff (erosion proxy, typical): 15 mm

### Climate scenario vs historical

- Yield (kg/ha): P10 3986.86 → 3978.7 (Δ -8.16) · P50 3999.6 → 3994.6 (Δ -5.0) · mean 3995.88 → 3991.99 (Δ -3.89)
- Crop water use (m³/ha): P10 4381.12 → 4552.79 (Δ 171.67) · P50 4699.45 → 4880.85 (Δ 181.4) · mean 4729.53 → 4908.4 (Δ 178.87)
- Irrigation water (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 568.3 → 920.05 (Δ 351.75) · mean 548.86 → 957.9 (Δ 409.04)
- Water-stress days: P10 0.0 → 0.0 (Δ 0.0) · P50 1.0 → 2.0 (Δ 1.0) · mean 0.96 → 1.54 (Δ 0.58)

### Rainfed vs deficit irrigation

- Yield (kg/ha): P10 3978.7 → 2588.38 (Δ -1390.32) · P50 3994.6 → 3841.7 (Δ -152.9) · mean 3991.99 → 3549.89 (Δ -442.1)
- Crop water use (m³/ha): P10 4552.79 → 4314.11 (Δ -238.68) · P50 4880.85 → 4655.1 (Δ -225.75) · mean 4908.4 → 4645.39 (Δ -263.01)
- Irrigation water (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 920.05 → 0.0 (Δ -920.05) · mean 957.9 → 0.0 (Δ -957.9)
- Water-stress days: P10 0.0 → 0.0 (Δ 0.0) · P50 2.0 → 15.5 (Δ 13.5) · mean 1.54 → 20.0 (Δ 18.46)

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