# Relatório comercial de simulação

> **Fonte do clima: NASA POWER (dados reais)**  
> Gerado em: 2026-11-14T18:30:35.292039+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Cultura:** Milho safrinha (experimental)
- **Semeadura:** 02-01 · Safras simuladas: 24 (2001–2024)
- **Solo:** Médio (franco) · **Irrigação:** irrigação deficitária
- **Local:** -18.9200, -48.2800 · IBGE 3170206
- **Cenário:** histórico (Δchuva 0.0%, ΔT 0.0 °C)

## Resumo

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Rendimento (sc/ha) | 99.8 | 100.0 | 100.0 |

## Água e solo

- Água consumida pela lavoura (típico): 3753 m³/ha
- Água de irrigação (típico): 1212 m³/ha
- Dias com falta de água (típico / ano ruim): 1 / 2
- Enxurrada (proxy de erosão, típico): 5 mm

### Sequeiro vs irrigação deficitária

- Rendimento (kg/ha): P10 5990.16 → 4388.81 (Δ -1601.35) · P50 5997.9 → 5218.0 (Δ -779.9) · média 5995.6 → 5253.23 (Δ -742.37)
- Água consumida (m³/ha): P10 3415.66 → 3054.52 (Δ -361.14) · P50 3753.15 → 3395.4 (Δ -357.75) · média 3745.86 → 3332.61 (Δ -413.25)
- Água de irrigação (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 1211.6 → 0.0 (Δ -1211.6) · média 1331.62 → 0.0 (Δ -1331.62)
- Dias de estresse hídrico: P10 0.0 → 0.0 (Δ 0.0) · P50 1.0 → 34.5 (Δ 33.5) · média 1.21 → 28.46 (Δ 27.25)

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