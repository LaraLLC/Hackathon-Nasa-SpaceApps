# Relatório técnico de simulação

## Identificação

- **Cultura:** Milho safrinha (experimental)
- **Semeadura:** 03-01 · Safras simuladas: 20 (2001–2020)
- **Solo:** Médio (franco) · **Irrigação:** rainfed
- Local: -18.9200, -48.2800 · 3170206
- Cenário: dry_warm (Δchuva -20.0%, ΔT 1.5 °C)
- model_version: `gaiapus-sim-0.1.0` · data_version: `synthetic_test:2001-01-01..2021-12-31`

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
| Rendimento (kg/ha) | 3024.94 | 4072.7 | 5321.36 |
| Ya/Ym | 0.5 | 0.68 | 0.89 |
| crop_water_use_m3_ha | 2841.82 | 3204.5 | 3844.84 |
| blue_water_m3_ha | 0.0 | 0.0 | 0.0 |
| green_water_m3_ha | 2841.82 | 3204.5 | 3844.84 |
| water_productivity_kg_m3 | 1.13 | 1.31 | 1.38 |
| deep_percolation_mm | 72.19 | 146.53 | 212.58 |
| runoff_mm | 5.28 | 20.42 | 49.44 |
| water_stress_days | 34.0 | 54.5 | 62.2 |
| severe_stress_days | 22.6 | 38.5 | 52.1 |
| heat_stress_days_flowering | 0.0 | 0.0 | 0.0 |
| soil_cover_days | 71.0 | 71.0 | 71.0 |
| Lucro (R$/ha) | -1027.14 | -66.69 | 1077.91 |
| Probabilidade de prejuízo |  | 50% |  |

## Água por fase (ano típico) — 2007

| Fase | ETc (mm) | ETa (mm) | ETa/ETc | Ky |
| --- | --- | --- | --- | --- |
| initial | 24.58 | 24.58 | 1.00 | 0.4 |
| development | 106.83 | 106.83 | 1.00 | 0.4 |
| flowering | 69.25 | 69.25 | 1.00 | 1.5 |
| yield_formation | 132.06 | 85.77 | 0.65 | 0.5 |
| late | 101.91 | 24.82 | 0.24 | 0.2 |

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

## Comparação de cenários: climate_vs_baseline

| Métrica | baseline P50 | cenário P50 | Δ | Δ% |
| --- | --- | --- | --- | --- |
| yield_kg_ha | 4729.3 | 4072.7 | -656.6 | -13.9 |
| crop_water_use_m3_ha | 3406.2 | 3204.5 | -201.7 | -5.9 |
| blue_water_m3_ha | 0.0 | 0.0 | 0.0 | None |
| water_stress_days | 48.0 | 54.5 | 6.5 | 13.5 |
| profit_per_ha | 535.19 | -66.69 | -601.88 | -112.5 |

## Comparação de cenários: deficit_vs_rainfed

| Métrica | baseline P50 | cenário P50 | Δ | Δ% |
| --- | --- | --- | --- | --- |
| yield_kg_ha | 4072.7 | 5984.85 | 1912.15 | 47.0 |
| crop_water_use_m3_ha | 3204.5 | 4405.6 | 1201.1 | 37.5 |
| blue_water_m3_ha | 0.0 | 2079.0 | 2079.0 | None |
| water_stress_days | 54.5 | 2.0 | -52.5 | -96.3 |
| profit_per_ha | -66.69 | 1686.11 | 1752.8 | -2628.3 |

## Limitações e avisos

- DADOS SINTÉTICOS DE TESTE — não usar em apresentação.
- Rendimento é estimativa por modelo físico simplificado (só limitação hídrica); não considera pragas, doenças, nutrição, geada, encharcamento nem efeito direto de calor.
- NASA POWER tem resolução de ~0,5° (dezenas de km): o clima representa a região, não o talhão.
- Cenários de Δchuva/ΔT são testes de sensibilidade, não projeções climáticas.
- Rendimento de referência padrão (6000 kg/ha) é placeholder; calibre com IBGE/PAM do município.

## Proveniência

- SYNTHETIC — gerado para testes, não representa observação
- FAO-56 (Allen et al., 1998)
- FAO-33 (Doorenbos & Kassam, 1979)
- generated_at: 2026-11-14T16:07:55.920012+00:00 · observed_through: 2021-12-31