# Relatório comercial de simulação

> **Fonte do clima: NASA POWER (dados reais)**  
> Gerado em: 2026-11-14T18:12:35.992248+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Cultura:** Soja (experimental)
- **Semeadura:** 10-01 · Safras simuladas: 24 (2001–2024)
- **Solo:** Argiloso (ex.: Latossolo) · **Irrigação:** deficit
- **Local:** -18.9200, -48.2800 · IBGE 3170206
- **Cenário:** dry_warm (Δchuva -20.0%, ΔT 1.5 °C)

## Resumo

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Rendimento (sc/ha) | 66.3 | 66.6 | 66.7 |

## Água e solo

- Água consumida pela lavoura (típico): 4881 m³/ha
- Água de irrigação (típico): 920 m³/ha
- Dias com falta de água (típico / ano ruim): 2 / 4
- Enxurrada (proxy de erosão, típico): 15 mm

### Cenário climático vs histórico

- Rendimento (kg/ha): P10 3986.86 → 3978.7 (Δ -8.16) · P50 3999.6 → 3994.6 (Δ -5.0) · média 3995.88 → 3991.99 (Δ -3.89)
- Água consumida (m³/ha): P10 4381.12 → 4552.79 (Δ 171.67) · P50 4699.45 → 4880.85 (Δ 181.4) · média 4729.53 → 4908.4 (Δ 178.87)
- Água de irrigação (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 568.3 → 920.05 (Δ 351.75) · média 548.86 → 957.9 (Δ 409.04)
- Dias de estresse hídrico: P10 0.0 → 0.0 (Δ 0.0) · P50 1.0 → 2.0 (Δ 1.0) · média 0.96 → 1.54 (Δ 0.58)

### Sequeiro vs irrigação deficitária

- Rendimento (kg/ha): P10 3978.7 → 2588.38 (Δ -1390.32) · P50 3994.6 → 3841.7 (Δ -152.9) · média 3991.99 → 3549.89 (Δ -442.1)
- Água consumida (m³/ha): P10 4552.79 → 4314.11 (Δ -238.68) · P50 4880.85 → 4655.1 (Δ -225.75) · média 4908.4 → 4645.39 (Δ -263.01)
- Água de irrigação (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 920.05 → 0.0 (Δ -920.05) · média 957.9 → 0.0 (Δ -957.9)
- Dias de estresse hídrico: P10 0.0 → 0.0 (Δ 0.0) · P50 2.0 → 15.5 (Δ 13.5) · média 1.54 → 20.0 (Δ 18.46)

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