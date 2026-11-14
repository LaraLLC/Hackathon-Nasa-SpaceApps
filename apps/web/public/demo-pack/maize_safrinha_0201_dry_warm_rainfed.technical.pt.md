# Relatório técnico de simulação

> **Fonte do clima: NASA POWER (dados reais)**  
> Gerado em: 2026-11-14T18:12:40.042507+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

## Identificação

- **Cultura:** Milho safrinha (experimental)
- **Semeadura:** 02-01 · Safras simuladas: 24 (2001–2024)
- **Solo:** Médio (franco) · **Irrigação:** rainfed
- **Local:** -18.9200, -48.2800 · IBGE 3170206
- **Cenário:** dry_warm (Δchuva -20.0%, ΔT 1.5 °C)
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
| Rendimento (kg/ha) | 3859.27 | 4704.4 | 5939.97 |
| Ya/Ym | 0.64 | 0.78 | 0.99 |
| crop_water_use_m3_ha | 3008.42 | 3328.2 | 3555.1 |
| blue_water_m3_ha | 0.0 | 0.0 | 0.0 |
| green_water_m3_ha | 3008.42 | 3328.2 | 3555.1 |
| water_productivity_kg_m3 | 1.27 | 1.44 | 1.68 |
| deep_percolation_mm | 70.55 | 131.65 | 243.18 |
| runoff_mm | 0.03 | 1.78 | 5.38 |
| water_stress_days | 14.4 | 44.0 | 60.4 |
| severe_stress_days | 0.0 | 32.0 | 46.1 |
| heat_stress_days_flowering | 0.0 | 0.0 | 0.0 |
| soil_cover_days | 71.0 | 71.0 | 71.0 |

## Água por fase (ano típico) — 2023

| Fase | ETc (mm) | ETa (mm) | ETa/ETc | Ky |
| --- | --- | --- | --- | --- |
| initial | 27.24 | 27.24 | 1.00 | 0.4 |
| development | 104.76 | 104.76 | 1.00 | 0.4 |
| flowering | 68.11 | 68.11 | 1.00 | 1.5 |
| yield_formation | 112.9 | 91.34 | 0.81 | 0.5 |
| late | 87.23 | 23.96 | 0.27 | 0.2 |

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

## Comparação de cenários: Cenário climático vs histórico

| Métrica | baseline P10 | cenário P10 | Δ P10 | baseline P50 | cenário P50 | Δ P50 | Δ% P50 | baseline média | cenário média | Δ média |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Rendimento (kg/ha) | 4388.81 | 3859.27 | -529.54 | 5218.0 | 4704.4 | -513.6 | -9.8 | 5253.23 | 4863.69 | -389.54 |
| Água consumida (m³/ha) | 3054.52 | 3008.42 | -46.1 | 3395.4 | 3328.2 | -67.2 | -2.0 | 3332.61 | 3283.72 | -48.89 |
| Água de irrigação (m³/ha) | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | — | 0.0 | 0.0 | 0.0 |
| Dias de estresse hídrico | 0.0 | 14.4 | 14.4 | 34.5 | 44.0 | 9.5 | 27.5 | 28.46 | 38.96 | 10.5 |

## Comparação de cenários: Irrigação deficitária vs sequeiro

| Métrica | baseline P10 | cenário P10 | Δ P10 | baseline P50 | cenário P50 | Δ P50 | Δ% P50 | baseline média | cenário média | Δ média |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Rendimento (kg/ha) | 3859.27 | 5970.79 | 2111.52 | 4704.4 | 5994.3 | 1289.9 | 27.4 | 4863.69 | 5989.68 | 1125.99 |
| Água consumida (m³/ha) | 3008.42 | 3564.55 | 556.13 | 3328.2 | 3920.35 | 592.15 | 17.8 | 3283.72 | 3906.64 | 622.92 |
| Água de irrigação (m³/ha) | 0.0 | 1088.71 | 1088.71 | 0.0 | 2002.95 | 2002.95 | — | 0.0 | 1654.98 | 1654.98 |
| Dias de estresse hídrico | 14.4 | 1.0 | -13.4 | 44.0 | 2.0 | -42.0 | -95.5 | 38.96 | 1.54 | -37.42 |

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
- generated_at: 2026-11-14T18:12:40.042507+00:00 · observed_through: 2025-12-31