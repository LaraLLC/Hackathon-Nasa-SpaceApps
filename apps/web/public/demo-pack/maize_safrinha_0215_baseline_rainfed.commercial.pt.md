# Relatório comercial de simulação

> **Fonte do clima: NASA POWER (dados reais)**  
> Gerado em: 2026-11-14T18:12:41.058363+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Cultura:** Milho safrinha (experimental)
- **Semeadura:** 02-15 · Safras simuladas: 24 (2001–2024)
- **Solo:** Médio (franco) · **Irrigação:** rainfed
- **Local:** -18.9200, -48.2800 · IBGE 3170206
- **Cenário:** baseline (Δchuva 0.0%, ΔT 0.0 °C)

## Resumo

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Rendimento (sc/ha) | 60.9 | 81.0 | 97.8 |

## Água e solo

- Água consumida pela lavoura (típico): 3061 m³/ha
- Água de irrigação (típico): 0 m³/ha
- Dias com falta de água (típico / ano ruim): 46 / 60
- Enxurrada (proxy de erosão, típico): 3 mm

### Irrigação deficitária vs sequeiro

- Rendimento (kg/ha): P10 3654.69 → 5980.09 (Δ 2325.4) · P50 4862.85 → 5995.05 (Δ 1132.2) · média 4825.41 → 5991.82 (Δ 1166.41)
- Água consumida (m³/ha): P10 2665.85 → 3228.77 (Δ 562.92) · P50 3061.2 → 3564.3 (Δ 503.1) · média 3004.15 → 3570.47 (Δ 566.32)
- Água de irrigação (m³/ha): P10 0.0 → 1065.11 (Δ 1065.11) · P50 0.0 → 1223.75 (Δ 1223.75) · média 0.0 → 1652.67 (Δ 1652.67)
- Dias de estresse hídrico: P10 22.3 → 1.0 (Δ -21.3) · P50 45.5 → 1.0 (Δ -44.5) · média 40.83 → 1.5 (Δ -39.33)

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