# Relatório técnico de simulação

> **Fonte do clima: NASA POWER (dados reais)**  
> Gerado em: 2026-11-14T18:12:43.820270+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

## Identificação

- **Cultura:** Milho safrinha (experimental)
- **Semeadura:** 03-10 · Safras simuladas: 24 (2001–2024)
- **Solo:** Médio (franco) · **Irrigação:** deficit
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
| Rendimento (kg/ha) | 5924.91 | 5991.6 | 5996.45 |
| Ya/Ym | 0.99 | 1.0 | 1.0 |
| crop_water_use_m3_ha | 3150.91 | 3452.35 | 3847.56 |
| blue_water_m3_ha | 1153.28 | 2244.55 | 3359.37 |
| green_water_m3_ha | 956.23 | 1548.1 | 2147.87 |
| water_productivity_kg_m3 | 1.56 | 1.73 | 1.9 |
| deep_percolation_mm | 25.14 | 76.16 | 167.03 |
| runoff_mm | 0.0 | 0.24 | 2.36 |
| water_stress_days | 1.0 | 2.0 | 3.0 |
| severe_stress_days | 0.0 | 0.0 | 0.0 |
| heat_stress_days_flowering | 0.0 | 0.0 | 0.0 |
| soil_cover_days | 71.0 | 71.0 | 71.0 |

## Água por fase (ano típico) — 2022

| Fase | ETc (mm) | ETa (mm) | ETa/ETc | Ky |
| --- | --- | --- | --- | --- |
| initial | 26.68 | 26.68 | 1.00 | 0.4 |
| development | 112.24 | 112.24 | 1.00 | 0.4 |
| flowering | 55.86 | 55.85 | 1.00 | 1.5 |
| yield_formation | 101.78 | 101.61 | 1.00 | 0.5 |
| late | 85.85 | 85.8 | 1.00 | 0.2 |

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
| Rendimento (kg/ha) | 5959.48 | 5924.91 | -34.57 | 5989.3 | 5991.6 | 2.3 | 0.0 | 5981.32 | 5974.18 | -7.14 |
| Água consumida (m³/ha) | 3007.19 | 3150.91 | 143.72 | 3297.85 | 3452.35 | 154.5 | 4.7 | 3364.49 | 3518.39 | 153.9 |
| Água de irrigação (m³/ha) | 1128.16 | 1153.28 | 25.12 | 2227.2 | 2244.55 | 17.35 | 0.8 | 2023.4 | 2320.59 | 297.19 |
| Dias de estresse hídrico | 1.0 | 1.0 | 0.0 | 2.0 | 2.0 | 0.0 | 0.0 | 1.79 | 2.08 | 0.29 |

## Comparação de cenários: Sequeiro vs irrigação deficitária

| Métrica | baseline P10 | cenário P10 | Δ P10 | baseline P50 | cenário P50 | Δ P50 | Δ% P50 | baseline média | cenário média | Δ média |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Rendimento (kg/ha) | 5924.91 | 1914.69 | -4010.22 | 5991.6 | 3596.9 | -2394.7 | -40.0 | 5974.18 | 3424.71 | -2549.47 |
| Água consumida (m³/ha) | 3150.91 | 2159.79 | -991.12 | 3452.35 | 2418.55 | -1033.8 | -29.9 | 3518.39 | 2424.34 | -1094.05 |
| Água de irrigação (m³/ha) | 1153.28 | 0.0 | -1153.28 | 2244.55 | 0.0 | -2244.55 | -100.0 | 2320.59 | 0.0 | -2320.59 |
| Dias de estresse hídrico | 1.0 | 46.3 | 45.3 | 2.0 | 59.0 | 57.0 | 2850.0 | 2.08 | 58.79 | 56.71 |

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
- generated_at: 2026-11-14T18:12:43.820270+00:00 · observed_through: 2025-12-31