# Relatório comercial de simulação

> **Fonte do clima: NASA POWER (dados reais)**  
> Gerado em: 2026-11-14T18:30:42.693030+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Cultura:** Milho safrinha (experimental)
- **Semeadura:** 03-10 · Safras simuladas: 24 (2001–2024)
- **Solo:** Médio (franco) · **Irrigação:** sequeiro
- **Local:** -18.9200, -48.2800 · IBGE 3170206
- **Cenário:** seco e quente (Δchuva -20.0%, ΔT 1.5 °C)

## Resumo

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Rendimento (sc/ha) | 31.9 | 59.9 | 79.5 |

## Água e solo

- Água consumida pela lavoura (típico): 2419 m³/ha
- Água de irrigação (típico): 0 m³/ha
- Dias com falta de água (típico / ano ruim): 59 / 70
- Enxurrada (proxy de erosão, típico): 0 mm

### Cenário climático vs histórico

- Rendimento (kg/ha): P10 2497.37 → 1914.69 (Δ -582.68) · P50 4016.9 → 3596.9 (Δ -420.0) · média 4000.62 → 3424.71 (Δ -575.91)
- Água consumida (m³/ha): P10 2234.45 → 2159.79 (Δ -74.66) · P50 2469.05 → 2418.55 (Δ -50.5) · média 2506.9 → 2424.34 (Δ -82.56)
- Água de irrigação (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 0.0 → 0.0 (Δ 0.0) · média 0.0 → 0.0 (Δ 0.0)
- Dias de estresse hídrico: P10 37.3 → 46.3 (Δ 9.0) · P50 57.0 → 59.0 (Δ 2.0) · média 52.88 → 58.79 (Δ 5.91)

### Irrigação deficitária vs sequeiro

- Rendimento (kg/ha): P10 1914.69 → 5924.91 (Δ 4010.22) · P50 3596.9 → 5991.6 (Δ 2394.7) · média 3424.71 → 5974.18 (Δ 2549.47)
- Água consumida (m³/ha): P10 2159.79 → 3150.91 (Δ 991.12) · P50 2418.55 → 3452.35 (Δ 1033.8) · média 2424.34 → 3518.39 (Δ 1094.05)
- Água de irrigação (m³/ha): P10 0.0 → 1153.28 (Δ 1153.28) · P50 0.0 → 2244.55 (Δ 2244.55) · média 0.0 → 2320.59 (Δ 2320.59)
- Dias de estresse hídrico: P10 46.3 → 1.0 (Δ -45.3) · P50 59.0 → 2.0 (Δ -57.0) · média 58.79 → 2.08 (Δ -56.71)

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
- Rendimento de referência padrão (6000 kg/ha) é placeholder; calibre com IBGE/PAM do município.
- Sem preço/custo informados: resultados econômicos omitidos.