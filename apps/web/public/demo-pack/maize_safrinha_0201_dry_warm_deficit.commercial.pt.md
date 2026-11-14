# Relatório comercial de simulação

> **Fonte do clima: NASA POWER (dados reais)**  
> Gerado em: 2026-11-14T18:30:36.966845+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Cultura:** Milho safrinha (experimental)
- **Semeadura:** 02-01 · Safras simuladas: 24 (2001–2024)
- **Solo:** Médio (franco) · **Irrigação:** irrigação deficitária
- **Local:** -18.9200, -48.2800 · IBGE 3170206
- **Cenário:** seco e quente (Δchuva -20.0%, ΔT 1.5 °C)

## Resumo

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Rendimento (sc/ha) | 99.5 | 99.9 | 100.0 |

## Água e solo

- Água consumida pela lavoura (típico): 3920 m³/ha
- Água de irrigação (típico): 2003 m³/ha
- Dias com falta de água (típico / ano ruim): 2 / 2
- Enxurrada (proxy de erosão, típico): 2 mm

### Cenário climático vs histórico

- Rendimento (kg/ha): P10 5990.16 → 5970.79 (Δ -19.37) · P50 5997.9 → 5994.3 (Δ -3.6) · média 5995.6 → 5989.68 (Δ -5.92)
- Água consumida (m³/ha): P10 3415.66 → 3564.55 (Δ 148.89) · P50 3753.15 → 3920.35 (Δ 167.2) · média 3745.86 → 3906.64 (Δ 160.78)
- Água de irrigação (m³/ha): P10 0.0 → 1088.71 (Δ 1088.71) · P50 1211.6 → 2002.95 (Δ 791.35) · média 1331.62 → 1654.98 (Δ 323.36)
- Dias de estresse hídrico: P10 0.0 → 1.0 (Δ 1.0) · P50 1.0 → 2.0 (Δ 1.0) · média 1.21 → 1.54 (Δ 0.33)

### Sequeiro vs irrigação deficitária

- Rendimento (kg/ha): P10 5970.79 → 3859.27 (Δ -2111.52) · P50 5994.3 → 4704.4 (Δ -1289.9) · média 5989.68 → 4863.69 (Δ -1125.99)
- Água consumida (m³/ha): P10 3564.55 → 3008.42 (Δ -556.13) · P50 3920.35 → 3328.2 (Δ -592.15) · média 3906.64 → 3283.72 (Δ -622.92)
- Água de irrigação (m³/ha): P10 1088.71 → 0.0 (Δ -1088.71) · P50 2002.95 → 0.0 (Δ -2002.95) · média 1654.98 → 0.0 (Δ -1654.98)
- Dias de estresse hídrico: P10 1.0 → 14.4 (Δ 13.4) · P50 2.0 → 44.0 (Δ 42.0) · média 1.54 → 38.96 (Δ 37.42)

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