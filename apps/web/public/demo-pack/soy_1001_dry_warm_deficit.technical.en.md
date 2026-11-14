# Technical simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:12:35.992248+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

## Identification

- **Crop:** Soybean (experimental)
- **Sowing:** 10-01 · Simulated seasons: 24 (2001–2024)
- **Soil:** Argiloso (ex.: Latossolo) · **Irrigation:** deficit
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
| Yield (kg/ha) | 3978.7 | 3994.6 | 4000.0 |
| Ya/Ym | 0.99 | 1.0 | 1.0 |
| crop_water_use_m3_ha | 4552.79 | 4880.85 | 5283.61 |
| blue_water_m3_ha | 0.0 | 920.05 | 2089.47 |
| green_water_m3_ha | 3478.12 | 3990.6 | 4666.27 |
| water_productivity_kg_m3 | 0.76 | 0.82 | 0.88 |
| deep_percolation_mm | 66.27 | 146.84 | 245.12 |
| runoff_mm | 3.88 | 15.34 | 26.57 |
| water_stress_days | 0.0 | 2.0 | 3.7 |
| severe_stress_days | 0.0 | 0.0 | 0.0 |
| heat_stress_days_flowering | 0.0 | 0.0 | 0.0 |
| soil_cover_days | 82.0 | 82.0 | 82.0 |

## Water by phase (typical year) — 2014

| Phase | ETc (mm) | ETa (mm) | ETa/ETc | Ky |
| --- | --- | --- | --- | --- |
| initial | 62.07 | 62.03 | 1.00 | 0.2 |
| development | 111.64 | 111.64 | 1.00 | 0.2 |
| flowering | 86.97 | 86.97 | 1.00 | 0.8 |
| yield_formation | 164.56 | 164.48 | 1.00 | 1.0 |
| late | 106.83 | 106.58 | 1.00 | 0.2 |

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
| Yield (kg/ha) | 3986.86 | 3978.7 | -8.16 | 3999.6 | 3994.6 | -5.0 | -0.1 | 3995.88 | 3991.99 | -3.89 |
| Crop water use (m³/ha) | 4381.12 | 4552.79 | 171.67 | 4699.45 | 4880.85 | 181.4 | 3.9 | 4729.53 | 4908.4 | 178.87 |
| Irrigation water (m³/ha) | 0.0 | 0.0 | 0.0 | 568.3 | 920.05 | 351.75 | 61.9 | 548.86 | 957.9 | 409.04 |
| Water-stress days | 0.0 | 0.0 | 0.0 | 1.0 | 2.0 | 1.0 | 100.0 | 0.96 | 1.54 | 0.58 |

## Scenario comparison: Rainfed vs deficit irrigation

| Metric | baseline P10 | scenario P10 | Δ P10 | baseline P50 | scenario P50 | Δ P50 | Δ% P50 | baseline mean | scenario mean | Δ mean |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Yield (kg/ha) | 3978.7 | 2588.38 | -1390.32 | 3994.6 | 3841.7 | -152.9 | -3.8 | 3991.99 | 3549.89 | -442.1 |
| Crop water use (m³/ha) | 4552.79 | 4314.11 | -238.68 | 4880.85 | 4655.1 | -225.75 | -4.6 | 4908.4 | 4645.39 | -263.01 |
| Irrigation water (m³/ha) | 0.0 | 0.0 | 0.0 | 920.05 | 0.0 | -920.05 | -100.0 | 957.9 | 0.0 | -957.9 |
| Water-stress days | 0.0 | 0.0 | 0.0 | 2.0 | 15.5 | 13.5 | 675.0 | 1.54 | 20.0 | 18.46 |

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
- generated_at: 2026-11-14T18:12:35.992248+00:00 · observed_through: 2025-12-31