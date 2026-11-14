# Technical simulation report

> **Weather source: NASA POWER (real data)**  
> Generated at: 2026-11-14T18:12:39.370033+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

## Identification

- **Crop:** Second-season maize (experimental)
- **Sowing:** 02-01 · Simulated seasons: 24 (2001–2024)
- **Soil:** Médio (franco) · **Irrigation:** rainfed
- **Location:** -18.9200, -48.2800 · IBGE 3170206
- **Scenario:** baseline (Δrain 0.0%, ΔT 0.0 °C)
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
| Yield (kg/ha) | 4388.81 | 5218.0 | 6000.0 |
| Ya/Ym | 0.73 | 0.87 | 1.0 |
| crop_water_use_m3_ha | 3054.52 | 3395.4 | 3545.03 |
| blue_water_m3_ha | 0.0 | 0.0 | 0.0 |
| green_water_m3_ha | 3054.52 | 3395.4 | 3545.03 |
| water_productivity_kg_m3 | 1.37 | 1.55 | 1.76 |
| deep_percolation_mm | 118.91 | 195.34 | 330.92 |
| runoff_mm | 0.8 | 4.88 | 14.97 |
| water_stress_days | 0.0 | 34.5 | 50.7 |
| severe_stress_days | 0.0 | 20.5 | 38.4 |
| heat_stress_days_flowering | 0.0 | 0.0 | 0.0 |
| soil_cover_days | 71.0 | 71.0 | 71.0 |

## Water by phase (typical year) — 2001

| Phase | ETc (mm) | ETa (mm) | ETa/ETc | Ky |
| --- | --- | --- | --- | --- |
| initial | 28.86 | 28.86 | 1.00 | 0.4 |
| development | 106.71 | 106.71 | 1.00 | 0.4 |
| flowering | 63.31 | 63.31 | 1.00 | 1.5 |
| yield_formation | 122.24 | 106.81 | 0.87 | 0.5 |
| late | 69.08 | 42.92 | 0.62 | 0.2 |

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
| Yield (kg/ha) | 4388.81 | 5990.16 | 1601.35 | 5218.0 | 5997.9 | 779.9 | 14.9 | 5253.23 | 5995.6 | 742.37 |
| Crop water use (m³/ha) | 3054.52 | 3415.66 | 361.14 | 3395.4 | 3753.15 | 357.75 | 10.5 | 3332.61 | 3745.86 | 413.25 |
| Irrigation water (m³/ha) | 0.0 | 0.0 | 0.0 | 0.0 | 1211.6 | 1211.6 | — | 0.0 | 1331.62 | 1331.62 |
| Water-stress days | 0.0 | 0.0 | 0.0 | 34.5 | 1.0 | -33.5 | -97.1 | 28.46 | 1.21 | -27.25 |

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
- generated_at: 2026-11-14T18:12:39.370033+00:00 · observed_through: 2025-12-31