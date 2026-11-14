# Technical simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:12:40.633580+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

## Identification

- **Crop:** Second-season maize (experimental)
- **Sowing:** 02-01 · Simulated seasons: 24 (2001–2024)
- **Soil:** Médio (franco) · **Irrigation:** deficit
- **Location:** -18.9200, -48.2800 · IBGE 3170206
- **Scenario:** dry_warm (Δrain -20.0%, ΔT 1.5 °C)
- model_version: `gaiapus-sim-0.1.0` · data_version: `nasa_power:2001-01-01..2025-12-31`

## Methods

FAO-56 Penman-Monteith ET0 + balanço hídrico diário (Kc único) + resposta de rendimento à água FAO-33 (Ky por fase), ensemble sobre anos NASA POWER

## Assumptions

- Ciclo de 125 dias; ajustar por híbrido e data de semeadura.
- Rendimento de referência 6000 kg/ha é placeholder; calibrar com IBGE/PAM (2ª safra).
- Limiar de calor 35 °C no pendoamento é indicador, não entra no cálculo de rendimento.
- Solo 'Médio (franco)': CC 0.25, PMP 0.12 m³/m³, CN 78 (FAO-56 tab. 19, valores centrais).
- Raiz cresce linearmente até o início da fase intermediária; solo novo explorado em capacidade de campo.
- Reference yield: 6000 kg/ha

## Results (distribution over historical years)

| Metric | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Yield (kg/ha) | 5970.79 | 5994.3 | 5999.37 |
| Ya/Ym | 1.0 | 1.0 | 1.0 |
| crop_water_use_m3_ha | 3564.55 | 3920.35 | 4271.93 |
| blue_water_m3_ha | 1088.71 | 2002.95 | 2188.93 |
| green_water_m3_ha | 2101.16 | 2530.05 | 2878.2 |
| water_productivity_kg_m3 | 1.4 | 1.53 | 1.68 |
| deep_percolation_mm | 70.55 | 131.65 | 243.18 |
| runoff_mm | 0.03 | 1.78 | 5.38 |
| water_stress_days | 1.0 | 2.0 | 2.0 |
| severe_stress_days | 0.0 | 0.0 | 0.0 |
| heat_stress_days_flowering | 0.0 | 0.0 | 0.0 |
| soil_cover_days | 71.0 | 71.0 | 71.0 |

## Water by phase (typical year) — 2020

| Phase | ETc (mm) | ETa (mm) | ETa/ETc | Ky |
| --- | --- | --- | --- | --- |
| initial | 24.42 | 24.42 | 1.00 | 0.4 |
| development | 108.26 | 108.26 | 1.00 | 0.4 |
| flowering | 65.94 | 65.91 | 1.00 | 1.5 |
| yield_formation | 108.38 | 108.3 | 1.00 | 0.5 |
| late | 69.85 | 69.85 | 1.00 | 0.2 |

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
| Yield (kg/ha) | 5990.16 | 5970.79 | -19.37 | 5997.9 | 5994.3 | -3.6 | -0.1 | 5995.6 | 5989.68 | -5.92 |
| Crop water use (m³/ha) | 3415.66 | 3564.55 | 148.89 | 3753.15 | 3920.35 | 167.2 | 4.5 | 3745.86 | 3906.64 | 160.78 |
| Irrigation water (m³/ha) | 0.0 | 1088.71 | 1088.71 | 1211.6 | 2002.95 | 791.35 | 65.3 | 1331.62 | 1654.98 | 323.36 |
| Water-stress days | 0.0 | 1.0 | 1.0 | 1.0 | 2.0 | 1.0 | 100.0 | 1.21 | 1.54 | 0.33 |

## Scenario comparison: Rainfed vs deficit irrigation

| Metric | baseline P10 | scenario P10 | Δ P10 | baseline P50 | scenario P50 | Δ P50 | Δ% P50 | baseline mean | scenario mean | Δ mean |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Yield (kg/ha) | 5970.79 | 3859.27 | -2111.52 | 5994.3 | 4704.4 | -1289.9 | -21.5 | 5989.68 | 4863.69 | -1125.99 |
| Crop water use (m³/ha) | 3564.55 | 3008.42 | -556.13 | 3920.35 | 3328.2 | -592.15 | -15.1 | 3906.64 | 3283.72 | -622.92 |
| Irrigation water (m³/ha) | 1088.71 | 0.0 | -1088.71 | 2002.95 | 0.0 | -2002.95 | -100.0 | 1654.98 | 0.0 | -1654.98 |
| Water-stress days | 1.0 | 14.4 | 13.4 | 2.0 | 44.0 | 42.0 | 2100.0 | 1.54 | 38.96 | 37.42 |

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

## Provenance

- NASA POWER Daily API (community=AG), https://power.larc.nasa.gov/api/temporal/daily/point
- FAO-56 (Allen et al., 1998)
- FAO-33 (Doorenbos & Kassam, 1979)
- generated_at: 2026-11-14T18:12:40.633580+00:00 · observed_through: 2025-12-31