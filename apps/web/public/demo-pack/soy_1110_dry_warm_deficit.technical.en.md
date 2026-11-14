# Technical simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:12:38.947633+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

## Identification

- **Crop:** Soybean (experimental)
- **Sowing:** 11-10 · Simulated seasons: 24 (2001–2024)
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
| Yield (kg/ha) | 3976.85 | 3996.3 | 4000.0 |
| Ya/Ym | 0.99 | 1.0 | 1.0 |
| crop_water_use_m3_ha | 4430.12 | 4610.2 | 5249.72 |
| blue_water_m3_ha | 0.0 | 740.9 | 2113.94 |
| green_water_m3_ha | 3459.61 | 3986.05 | 4559.3 |
| water_productivity_kg_m3 | 0.76 | 0.87 | 0.9 |
| deep_percolation_mm | 96.22 | 228.06 | 373.4 |
| runoff_mm | 4.84 | 15.1 | 33.31 |
| water_stress_days | 0.0 | 1.0 | 3.0 |
| severe_stress_days | 0.0 | 0.0 | 0.0 |
| heat_stress_days_flowering | 0.0 | 0.0 | 0.0 |
| soil_cover_days | 82.0 | 82.0 | 82.0 |

## Water by phase (typical year) — 2004

| Phase | ETc (mm) | ETa (mm) | ETa/ETc | Ky |
| --- | --- | --- | --- | --- |
| initial | 38.77 | 38.77 | 1.00 | 0.2 |
| development | 92.65 | 92.65 | 1.00 | 0.2 |
| flowering | 89.37 | 89.37 | 1.00 | 0.8 |
| yield_formation | 156.06 | 156.06 | 1.00 | 1.0 |
| late | 77.53 | 77.22 | 1.00 | 0.2 |

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
| Yield (kg/ha) | 3985.72 | 3976.85 | -8.87 | 4000.0 | 3996.3 | -3.7 | -0.1 | 3995.64 | 3991.88 | -3.76 |
| Crop water use (m³/ha) | 4261.42 | 4430.12 | 168.7 | 4438.9 | 4610.2 | 171.3 | 3.9 | 4558.08 | 4732.78 | 174.7 |
| Irrigation water (m³/ha) | 0.0 | 0.0 | 0.0 | 0.0 | 740.9 | 740.9 | — | 554.27 | 807.43 | 253.16 |
| Water-stress days | 0.0 | 0.0 | 0.0 | 0.0 | 1.0 | 1.0 | — | 0.75 | 1.12 | 0.37 |

## Scenario comparison: Rainfed vs deficit irrigation

| Metric | baseline P10 | scenario P10 | Δ P10 | baseline P50 | scenario P50 | Δ P50 | Δ% P50 | baseline mean | scenario mean | Δ mean |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Yield (kg/ha) | 3976.85 | 2134.99 | -1841.86 | 3996.3 | 3892.35 | -103.95 | -2.6 | 3991.88 | 3436.13 | -555.75 |
| Crop water use (m³/ha) | 4430.12 | 4141.47 | -288.65 | 4610.2 | 4435.8 | -174.4 | -3.8 | 4732.78 | 4414.65 | -318.13 |
| Irrigation water (m³/ha) | 0.0 | 0.0 | 0.0 | 740.9 | 0.0 | -740.9 | -100.0 | 807.43 | 0.0 | -807.43 |
| Water-stress days | 0.0 | 0.0 | 0.0 | 1.0 | 9.0 | 8.0 | 800.0 | 1.12 | 17.38 | 16.26 |

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
- generated_at: 2026-11-14T18:12:38.947633+00:00 · observed_through: 2025-12-31