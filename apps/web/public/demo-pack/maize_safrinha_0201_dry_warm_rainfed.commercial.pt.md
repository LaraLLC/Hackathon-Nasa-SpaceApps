# Relatório comercial de simulação

> **Fonte do clima: NASA POWER (dados reais)**  
> Gerado em: 2026-11-14T18:30:35.980438+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Cultura:** Milho safrinha (experimental)
- **Semeadura:** 02-01 · Safras simuladas: 24 (2001–2024)
- **Solo:** Médio (franco) · **Irrigação:** sequeiro
- **Local:** -18.9200, -48.2800 · IBGE 3170206
- **Cenário:** seco e quente (Δchuva -20.0%, ΔT 1.5 °C)

## Resumo

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Rendimento (sc/ha) | 64.3 | 78.4 | 99.0 |

## Água e solo

- Água consumida pela lavoura (típico): 3328 m³/ha
- Água de irrigação (típico): 0 m³/ha
- Dias com falta de água (típico / ano ruim): 44 / 60
- Enxurrada (proxy de erosão, típico): 2 mm

### Cenário climático vs histórico

- Rendimento (kg/ha): P10 4388.81 → 3859.27 (Δ -529.54) · P50 5218.0 → 4704.4 (Δ -513.6) · média 5253.23 → 4863.69 (Δ -389.54)
- Água consumida (m³/ha): P10 3054.52 → 3008.42 (Δ -46.1) · P50 3395.4 → 3328.2 (Δ -67.2) · média 3332.61 → 3283.72 (Δ -48.89)
- Água de irrigação (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 0.0 → 0.0 (Δ 0.0) · média 0.0 → 0.0 (Δ 0.0)
- Dias de estresse hídrico: P10 0.0 → 14.4 (Δ 14.4) · P50 34.5 → 44.0 (Δ 9.5) · média 28.46 → 38.96 (Δ 10.5)

### Irrigação deficitária vs sequeiro

- Rendimento (kg/ha): P10 3859.27 → 5970.79 (Δ 2111.52) · P50 4704.4 → 5994.3 (Δ 1289.9) · média 4863.69 → 5989.68 (Δ 1125.99)
- Água consumida (m³/ha): P10 3008.42 → 3564.55 (Δ 556.13) · P50 3328.2 → 3920.35 (Δ 592.15) · média 3283.72 → 3906.64 (Δ 622.92)
- Água de irrigação (m³/ha): P10 0.0 → 1088.71 (Δ 1088.71) · P50 0.0 → 2002.95 (Δ 2002.95) · média 0.0 → 1654.98 (Δ 1654.98)
- Dias de estresse hídrico: P10 14.4 → 1.0 (Δ -13.4) · P50 44.0 → 2.0 (Δ -42.0) · média 38.96 → 1.54 (Δ -37.42)

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