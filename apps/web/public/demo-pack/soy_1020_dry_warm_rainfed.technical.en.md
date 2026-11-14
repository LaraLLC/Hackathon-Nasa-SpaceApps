# Technical simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:12:36.999151+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

## Identification

- **Crop:** Soybean (experimental)
- **Sowing:** 10-20 · Simulated seasons: 24 (2001–2024)
- **Soil:** Argiloso (ex.: Latossolo) · **Irrigation:** rainfed
- **Location:** -18.9200, -48.2800 · IBGE 3170206
- **Scenario:** dry_warm (Δrain -20.0%, ΔT 1.5 °C)
- model_version: `gaiapus-sim-0.1.0` · data_version: `nasa_power:2001-01-01..2025-12-31`

## Methods

FAO-56 Penman-Monteith ET0 + balanço hídrico diário (Kc único) + resposta de rendimento à água FAO-33 (Ky por fase), ensemble sobre anos NASA POWER

## Assumptions

- Duração de fases ajustada a ciclo de 120 dias (cultivar de ciclo médio); ajustar por cultivar.
- Ky da fase final (0,2) é premissa; FAO-33 não tabela a maturação da soja.
- Rendimento de referência 4000 kg/ha é placeholder; calibrar com IBGE/PAM.
- Limiar de calor 35 °C na floração é indicador, não entra no cálculo de rendimento.
- Solo 'Argiloso (ex.: Latossolo)': CC 0.36, PMP 0.22 m³/m³, CN 82 (FAO-56 tab. 19, valores centrais).
- Raiz cresce linearmente até o início da fase intermediária; solo novo explorado em capacidade de campo.
- Reference yield: 4000 kg/ha

## Results (distribution over historical years)

| Metric | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Yield (kg/ha) | 2622.57 | 3982.6 | 4000.0 |
| Ya/Ym | 0.66 | 1.0 | 1.0 |
| crop_water_use_m3_ha | 4280.06 | 4570.25 | 4723.3 |
| blue_water_m3_ha | 0.0 | 0.0 | 0.0 |
| green_water_m3_ha | 4280.06 | 4570.25 | 4723.3 |
| water_productivity_kg_m3 | 0.61 | 0.85 | 0.89 |
| deep_percolation_mm | 78.22 | 186.26 | 260.11 |
| runoff_mm | 4.29 | 16.87 | 27.69 |
| water_stress_days | 0.0 | 1.0 | 47.9 |
| severe_stress_days | 0.0 | 0.0 | 19.4 |
| heat_stress_days_flowering | 0.0 | 0.0 | 0.0 |
| soil_cover_days | 82.0 | 82.0 | 82.0 |

## Water by phase (typical year) — 2001

| Phase | ETc (mm) | ETa (mm) | ETa/ETc | Ky |
| --- | --- | --- | --- | --- |
| initial | 42.86 | 42.86 | 1.00 | 0.2 |
| development | 100.49 | 100.49 | 1.00 | 0.2 |
| flowering | 95.52 | 95.52 | 1.00 | 0.8 |
| yield_formation | 146.64 | 146.64 | 1.00 | 1.0 |
| late | 71.41 | 71.41 | 1.00 | 0.2 |

## Environmental indicators

| Metric | Method |
| --- | --- |
| crop_water_use_m3_ha | ETa acumulada (mm) × 10 — consumo de água pela cultura (FAO-56). |
| blue_water_m3_ha | Irrigação aplicada (mm, bruta) × 10 — água retirada de rios/poços. |
| green_water_m3_ha | max(0, ETa − irrigação líquida) × 10 — água da chuva usada pela cultura. |
| water_productivity_kg_m3 | Rendimento / (ETa × 10). |
| deep_percolation_mm | Drenagem abaixo da raiz — PROXY de risco de lixiviação de nutrientes. |
| runoff_mm | Escoamento SCS-CN — PROXY de risco de erosão e perda de solo. |
| water_stress_days | Dias com Ks < 1 (água abaixo da fração facilmente disponível). |
| severe_stress_days | Dias com Ks < 0,6. |
| heat_stress_days_flowering | Dias com Tmax acima do limiar da cultura durante a floração. |
| soil_cover_days | Dias com cobertura do dossel ≥ 30% — PROXY de proteção do solo. |

## Scenario comparison: Climate scenario vs historical

| Metric | baseline P10 | scenario P10 | Δ P10 | baseline P50 | scenario P50 | Δ P50 | Δ% P50 | baseline mean | scenario mean | Δ mean |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Yield (kg/ha) | 3417.99 | 2622.57 | -795.42 | 4000.0 | 3982.6 | -17.4 | -0.4 | 3811.3 | 3580.13 | -231.17 |
| Crop water use (m³/ha) | 4302.03 | 4280.06 | -21.97 | 4515.0 | 4570.25 | 55.25 | 1.2 | 4497.59 | 4531.8 | 34.21 |
| Irrigation water (m³/ha) | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | — | 0.0 | 0.0 | 0.0 |
| Water-stress days | 0.0 | 0.0 | 0.0 | 0.0 | 1.0 | 1.0 | — | 8.5 | 14.12 | 5.62 |

## Scenario comparison: Deficit irrigation vs rainfed

| Metric | baseline P10 | scenario P10 | Δ P10 | baseline P50 | scenario P50 | Δ P50 | Δ% P50 | baseline mean | scenario mean | Δ mean |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Yield (kg/ha) | 2622.57 | 3982.15 | 1359.58 | 3982.6 | 3999.6 | 17.0 | 0.4 | 3580.13 | 3993.44 | 413.31 |
| Crop water use (m³/ha) | 4280.06 | 4507.34 | 227.28 | 4570.25 | 4717.4 | 147.15 | 3.2 | 4531.8 | 4793.47 | 261.67 |
| Irrigation water (m³/ha) | 0.0 | 0.0 | 0.0 | 0.0 | 362.7 | 362.7 | — | 0.0 | 711.63 | 711.63 |
| Water-stress days | 0.0 | 0.0 | 0.0 | 1.0 | 0.5 | -0.5 | -50.0 | 14.12 | 0.96 | -13.16 |

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

## Provenance

- NASA POWER Daily API (community=AG), https://power.larc.nasa.gov/api/temporal/daily/point
- FAO-56 (Allen et al., 1998)
- FAO-33 (Doorenbos & Kassam, 1979)
- generated_at: 2026-11-14T18:12:36.999151+00:00 · observed_through: 2025-12-31