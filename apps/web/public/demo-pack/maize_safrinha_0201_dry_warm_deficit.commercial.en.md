# Business simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:12:40.633580+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Crop:** Second-season maize (experimental)
- **Sowing:** 02-01 · Simulated seasons: 24 (2001–2024)
- **Soil:** Médio (franco) · **Irrigation:** deficit
- **Location:** -18.9200, -48.2800 · IBGE 3170206
- **Scenario:** dry_warm (Δrain -20.0%, ΔT 1.5 °C)

## Summary

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Yield (bags/ha) | 99.5 | 99.9 | 100.0 |

## Water and soil

- Crop water use (typical): 3920 m³/ha
- Irrigation water (typical): 2003 m³/ha
- Water-stress days (typical / bad year): 2 / 2
- Runoff (erosion proxy, typical): 2 mm

### Climate scenario vs historical

- Yield (kg/ha): P10 5990.16 → 5970.79 (Δ -19.37) · P50 5997.9 → 5994.3 (Δ -3.6) · mean 5995.6 → 5989.68 (Δ -5.92)
- Crop water use (m³/ha): P10 3415.66 → 3564.55 (Δ 148.89) · P50 3753.15 → 3920.35 (Δ 167.2) · mean 3745.86 → 3906.64 (Δ 160.78)
- Irrigation water (m³/ha): P10 0.0 → 1088.71 (Δ 1088.71) · P50 1211.6 → 2002.95 (Δ 791.35) · mean 1331.62 → 1654.98 (Δ 323.36)
- Water-stress days: P10 0.0 → 1.0 (Δ 1.0) · P50 1.0 → 2.0 (Δ 1.0) · mean 1.21 → 1.54 (Δ 0.33)

### Rainfed vs deficit irrigation

- Yield (kg/ha): P10 5970.79 → 3859.27 (Δ -2111.52) · P50 5994.3 → 4704.4 (Δ -1289.9) · mean 5989.68 → 4863.69 (Δ -1125.99)
- Crop water use (m³/ha): P10 3564.55 → 3008.42 (Δ -556.13) · P50 3920.35 → 3328.2 (Δ -592.15) · mean 3906.64 → 3283.72 (Δ -622.92)
- Irrigation water (m³/ha): P10 1088.71 → 0.0 (Δ -1088.71) · P50 2002.95 → 0.0 (Δ -2002.95) · mean 1654.98 → 0.0 (Δ -1654.98)
- Water-stress days: P10 1.0 → 14.4 (Δ 13.4) · P50 2.0 → 44.0 (Δ 42.0) · mean 1.54 → 38.96 (Δ 37.42)

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