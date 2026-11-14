# Technical simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:12:34.837054+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

## Identification

- **Crop:** Soybean (experimental)
- **Sowing:** 10-01 · Simulated seasons: 24 (2001–2024)
- **Soil:** Argiloso (ex.: Latossolo) · **Irrigation:** rainfed
- **Location:** -18.9200, -48.2800 · IBGE 3170206
- **Scenario:** baseline (Δrain 0.0%, ΔT 0.0 °C)
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
| Yield (kg/ha) | 3257.42 | 3976.95 | 4000.0 |
| Ya/Ym | 0.81 | 0.99 | 1.0 |
| crop_water_use_m3_ha | 4381.12 | 4657.7 | 4852.81 |
| blue_water_m3_ha | 0.0 | 0.0 | 0.0 |
| green_water_m3_ha | 4381.12 | 4657.7 | 4852.81 |
| water_productivity_kg_m3 | 0.73 | 0.84 | 0.91 |
| deep_percolation_mm | 117.92 | 261.25 | 357.14 |
| runoff_mm | 10.63 | 31.75 | 54.58 |
| water_stress_days | 0.0 | 7.0 | 32.7 |
| severe_stress_days | 0.0 | 0.0 | 6.1 |
| heat_stress_days_flowering | 0.0 | 0.0 | 0.0 |
| soil_cover_days | 82.0 | 82.0 | 82.0 |

## Water by phase (typical year) — 2017

| Phase | ETc (mm) | ETa (mm) | ETa/ETc | Ky |
| --- | --- | --- | --- | --- |
| initial | 52.59 | 51.68 | 0.98 | 0.2 |
| development | 103.6 | 100.51 | 0.97 | 0.2 |
| flowering | 87.43 | 87.43 | 1.00 | 0.8 |
| yield_formation | 142.74 | 142.74 | 1.00 | 1.0 |
| late | 83.02 | 83.02 | 1.00 | 0.2 |

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

## Scenario comparison: Deficit irrigation vs rainfed

| Metric | baseline P10 | scenario P10 | Δ P10 | baseline P50 | scenario P50 | Δ P50 | Δ% P50 | baseline mean | scenario mean | Δ mean |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Yield (kg/ha) | 3257.42 | 3986.86 | 729.44 | 3976.95 | 3999.6 | 22.65 | 0.6 | 3772.29 | 3995.88 | 223.59 |
| Crop water use (m³/ha) | 4381.12 | 4381.12 | 0.0 | 4657.7 | 4699.45 | 41.75 | 0.9 | 4609.39 | 4729.53 | 120.14 |
| Irrigation water (m³/ha) | 0.0 | 0.0 | 0.0 | 0.0 | 568.3 | 568.3 | — | 0.0 | 548.86 | 548.86 |
| Water-stress days | 0.0 | 0.0 | 0.0 | 7.0 | 1.0 | -6.0 | -85.7 | 11.75 | 0.96 | -10.79 |

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
- generated_at: 2026-11-14T18:12:34.837054+00:00 · observed_through: 2025-12-31