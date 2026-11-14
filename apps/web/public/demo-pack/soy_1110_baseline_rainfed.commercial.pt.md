# Relatório comercial de simulação

> **Fonte do clima: NASA POWER (dados reais)**  
> Gerado em: 2026-11-14T18:12:37.859988+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Cultura:** Soja (experimental)
- **Semeadura:** 11-10 · Safras simuladas: 24 (2001–2024)
- **Solo:** Argiloso (ex.: Latossolo) · **Irrigação:** rainfed
- **Local:** -18.9200, -48.2800 · IBGE 3170206
- **Cenário:** baseline (Δchuva 0.0%, ΔT 0.0 °C)

## Resumo

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Rendimento (sc/ha) | 48.2 | 66.7 | 66.7 |

## Água e solo

- Água consumida pela lavoura (típico): 4380 m³/ha
- Água de irrigação (típico): 0 m³/ha
- Dias com falta de água (típico / ano ruim): 0 / 30
- Enxurrada (proxy de erosão, típico): 33 mm

### Irrigação deficitária vs sequeiro

- Rendimento (kg/ha): P10 2893.18 → 3985.72 (Δ 1092.54) · P50 4000.0 → 4000.0 (Δ 0.0) · média 3677.28 → 3995.64 (Δ 318.36)
- Água consumida (m³/ha): P10 4201.73 → 4261.42 (Δ 59.69) · P50 4379.75 → 4438.9 (Δ 59.15) · média 4384.32 → 4558.08 (Δ 173.76)
- Água de irrigação (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 0.0 → 0.0 (Δ 0.0) · média 0.0 → 554.27 (Δ 554.27)
- Dias de estresse hídrico: P10 0.0 → 0.0 (Δ 0.0) · P50 0.0 → 0.0 (Δ 0.0) · média 9.58 → 0.75 (Δ -8.83)

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