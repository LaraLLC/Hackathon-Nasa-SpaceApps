# Relatório comercial de simulação

> **Fonte do clima: NASA POWER (dados reais)**  
> Gerado em: 2026-11-14T18:12:36.665444+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Cultura:** Soja (experimental)
- **Semeadura:** 10-20 · Safras simuladas: 24 (2001–2024)
- **Solo:** Argiloso (ex.: Latossolo) · **Irrigação:** deficit
- **Local:** -18.9200, -48.2800 · IBGE 3170206
- **Cenário:** baseline (Δchuva 0.0%, ΔT 0.0 °C)

## Resumo

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Rendimento (sc/ha) | 66.5 | 66.7 | 66.7 |

## Água e solo

- Água consumida pela lavoura (típico): 4542 m³/ha
- Água de irrigação (típico): 0 m³/ha
- Dias com falta de água (típico / ano ruim): 0 / 2
- Enxurrada (proxy de erosão, típico): 39 mm

### Sequeiro vs irrigação deficitária

- Rendimento (kg/ha): P10 3992.63 → 3417.99 (Δ -574.64) · P50 4000.0 → 4000.0 (Δ 0.0) · média 3997.59 → 3811.3 (Δ -186.29)
- Água consumida (m³/ha): P10 4336.35 → 4302.03 (Δ -34.32) · P50 4541.9 → 4515.0 (Δ -26.9) · média 4617.95 → 4497.59 (Δ -120.36)
- Água de irrigação (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 0.0 → 0.0 (Δ 0.0) · média 396.66 → 0.0 (Δ -396.66)
- Dias de estresse hídrico: P10 0.0 → 0.0 (Δ 0.0) · P50 0.0 → 0.0 (Δ 0.0) · média 0.54 → 8.5 (Δ 7.96)

## Como ler

P10 = ano ruim (só 1 em cada 10 anos históricos foi pior); P50 = ano típico; P90 = ano bom. Valores vêm de rodar a mesma decisão em cada ano do histórico NASA POWER.

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
- Rendimento de referência padrão (4000 kg/ha) é placeholder; calibre com IBGE/PAM do município.
- Sem preço/custo informados: resultados econômicos omitidos.