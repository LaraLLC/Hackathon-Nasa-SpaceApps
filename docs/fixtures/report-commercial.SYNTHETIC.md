# Relatório comercial de simulação — Fazenda Demo

- **Cultura:** Milho safrinha (experimental)
- **Semeadura:** 03-01 · Safras simuladas: 20 (2001–2020)
- **Solo:** Médio (franco) · **Irrigação:** rainfed
- Local: -18.9200, -48.2800 · 3170206
- Cenário: dry_warm (Δchuva -20.0%, ΔT 1.5 °C)

## Resumo

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Rendimento (sc/ha) | 50.4 | 67.9 | 88.7 |
| Lucro (R$/ha) | -1027.14 | -66.69 | 1077.91 |

## Resultado financeiro

- **Probabilidade de prejuízo:** 50%
- **Ponto de equilíbrio:** 69.09 sc/ha
- Risco de prejuízo ALTO nesta configuração (≥ 30% dos anos).
- Preço: 55.0 R$/sc (EXEMPLO); custo: 3800.0 R$/ha (EXEMPLO)

## Água e solo

- Água consumida pela lavoura (típico): 3204 m³/ha
- Água de irrigação (típico): 0 m³/ha
- Dias com falta de água (típico / ano ruim): 54 / 62
- Enxurrada (proxy de erosão, típico): 20 mm

### climate_vs_baseline

- yield_kg_ha: 4729.3 → 4072.7 (Δ -656.6)
- crop_water_use_m3_ha: 3406.2 → 3204.5 (Δ -201.7)
- blue_water_m3_ha: 0.0 → 0.0 (Δ 0.0)
- water_stress_days: 48.0 → 54.5 (Δ 6.5)
- profit_per_ha: 535.19 → -66.69 (Δ -601.88)
- probability_of_loss: 0.2 → 0.5

### deficit_vs_rainfed

- yield_kg_ha: 4072.7 → 5984.85 (Δ 1912.15)
- crop_water_use_m3_ha: 3204.5 → 4405.6 (Δ 1201.1)
- blue_water_m3_ha: 0.0 → 2079.0 (Δ 2079.0)
- water_stress_days: 54.5 → 2.0 (Δ -52.5)
- profit_per_ha: -66.69 → 1686.11 (Δ 1752.8)
- probability_of_loss: 0.5 → 0.0

## Como ler

P10 = ano ruim (só 1 em cada 10 anos históricos foi pior); P50 = ano típico; P90 = ano bom. Valores vêm de rodar a mesma decisão em cada ano do histórico NASA POWER.

## Limitações e avisos

- DADOS SINTÉTICOS DE TESTE — não usar em apresentação.
- Rendimento é estimativa por modelo físico simplificado (só limitação hídrica); não considera pragas, doenças, nutrição, geada, encharcamento nem efeito direto de calor.
- NASA POWER tem resolução de ~0,5° (dezenas de km): o clima representa a região, não o talhão.
- Cenários de Δchuva/ΔT são testes de sensibilidade, não projeções climáticas.
- Rendimento de referência padrão (6000 kg/ha) é placeholder; calibre com IBGE/PAM do município.