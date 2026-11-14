# Relatório técnico de simulação

> **Fonte do clima: NASA POWER (dados reais)**  
> Gerado em: 2026-11-14T18:12:41.058363+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

## Identificação

- **Cultura:** Milho safrinha (experimental)
- **Semeadura:** 02-15 · Safras simuladas: 24 (2001–2024)
- **Solo:** Médio (franco) · **Irrigação:** rainfed
- **Local:** -18.9200, -48.2800 · IBGE 3170206
- **Cenário:** baseline (Δchuva 0.0%, ΔT 0.0 °C)
- model_version: `gaiapus-sim-0.1.0` · data_version: `nasa_power:2001-01-01..2025-12-31`

## Métodos

FAO-56 Penman-Monteith ET0 + balanço hídrico diário (Kc único) + resposta de rendimento à água FAO-33 (Ky por fase), ensemble sobre anos NASA POWER

## Premissas

- Ciclo de 125 dias; ajustar por híbrido e data de semeadura.
- Rendimento de referência 6000 kg/ha é placeholder; calibrar com IBGE/PAM (2ª safra).
- Limiar de calor 35 °C no pendoamento é indicador, não entra no cálculo de rendimento.
- Solo 'Médio (franco)': CC 0.25, PMP 0.12 m³/m³, CN 78 (FAO-56 tab. 19, valores centrais).
- Raiz cresce linearmente até o início da fase intermediária; solo novo explorado em capacidade de campo.
- Rendimento de referência: 6000 kg/ha

## Resultados (distribuição sobre anos históricos)

| Métrica | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Rendimento (kg/ha) | 3654.69 | 4862.85 | 5870.77 |
| Ya/Ym | 0.61 | 0.81 | 0.98 |
| crop_water_use_m3_ha | 2665.85 | 3061.2 | 3255.7 |
| blue_water_m3_ha | 0.0 | 0.0 | 0.0 |
| green_water_m3_ha | 2665.85 | 3061.2 | 3255.7 |
| water_productivity_kg_m3 | 1.34 | 1.59 | 1.86 |
| deep_percolation_mm | 78.86 | 169.69 | 309.11 |
| runoff_mm | 0.32 | 3.23 | 11.99 |
| water_stress_days | 22.3 | 45.5 | 60.4 |
| severe_stress_days | 0.0 | 27.5 | 47.7 |
| heat_stress_days_flowering | 0.0 | 0.0 | 0.0 |
| soil_cover_days | 71.0 | 71.0 | 71.0 |

## Água por fase (ano típico) — 2018

| Fase | ETc (mm) | ETa (mm) | ETa/ETc | Ky |
| --- | --- | --- | --- | --- |
| initial | 24.31 | 24.31 | 1.00 | 0.4 |
| development | 101.39 | 101.39 | 1.00 | 0.4 |
| flowering | 55.21 | 55.21 | 1.00 | 1.5 |
| yield_formation | 110.1 | 92.69 | 0.84 | 0.5 |
| late | 76.38 | 31.73 | 0.42 | 0.2 |

## Indicadores ambientais

| Métrica | Método |
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

## Comparação de cenários: Irrigação deficitária vs sequeiro

| Métrica | baseline P10 | cenário P10 | Δ P10 | baseline P50 | cenário P50 | Δ P50 | Δ% P50 | baseline média | cenário média | Δ média |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Rendimento (kg/ha) | 3654.69 | 5980.09 | 2325.4 | 4862.85 | 5995.05 | 1132.2 | 23.3 | 4825.41 | 5991.82 | 1166.41 |
| Água consumida (m³/ha) | 2665.85 | 3228.77 | 562.92 | 3061.2 | 3564.3 | 503.1 | 16.4 | 3004.15 | 3570.47 | 566.32 |
| Água de irrigação (m³/ha) | 0.0 | 1065.11 | 1065.11 | 0.0 | 1223.75 | 1223.75 | — | 0.0 | 1652.67 | 1652.67 |
| Dias de estresse hídrico | 22.3 | 1.0 | -21.3 | 45.5 | 1.0 | -44.5 | -97.8 | 40.83 | 1.5 | -39.33 |

## Dados NASA utilizados

- **Produto:** NASA POWER Daily API (temporal/daily/point), community=AG
- **Parâmetros diários:** `T2M_MAX` (temperatura máxima do ar a 2 m (°C)); `T2M_MIN` (temperatura mínima do ar a 2 m (°C)); `RH2M` (umidade relativa a 2 m (%)); `WS2M` (velocidade do vento a 2 m (m/s)); `ALLSKY_SFC_SW_DWN` (radiação solar de onda curta na superfície (MJ/m²/dia)); `PRECTOTCORR` (precipitação corrigida (mm/dia))
- **Período baixado:** 2001-01-01 → 2025-12-31 · Safras simuladas: 2001–2024
- **Ponto consultado:** -18.9200, -48.2800 · **Resolução:** ~0.5° x 0.625° (MERRA-2) (o clima representa a região, não o talhão)
- **Data de acesso:** 2026-11-14
- **API:** <https://power.larc.nasa.gov/api/temporal/daily/point> · **Documentação:** <https://power.larc.nasa.gov/docs/services/api/temporal/daily/>
- **Requisição reprodutível:** `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M_MAX,T2M_MIN,RH2M,WS2M,ALLSKY_SFC_SW_DWN,PRECTOTCORR&community=AG&latitude=-18.9200&longitude=-48.2800&start=20010101&end=20251231&format=JSON`

## Limitações e avisos

- Rendimento é estimativa por modelo físico simplificado (só limitação hídrica); não considera pragas, doenças, nutrição, geada, encharcamento nem efeito direto de calor.
- NASA POWER tem resolução de ~0,5° (dezenas de km): o clima representa a região, não o talhão.
- Cenários de Δchuva/ΔT são testes de sensibilidade, não projeções climáticas.
- Rendimento de referência padrão (6000 kg/ha) é placeholder; calibre com IBGE/PAM do município.
- Sem preço/custo informados: resultados econômicos omitidos.

## Proveniência

- NASA POWER Daily API (community=AG), https://power.larc.nasa.gov/api/temporal/daily/point
- FAO-56 (Allen et al., 1998)
- FAO-33 (Doorenbos & Kassam, 1979)
- generated_at: 2026-11-14T18:12:41.058363+00:00 · observed_through: 2025-12-31