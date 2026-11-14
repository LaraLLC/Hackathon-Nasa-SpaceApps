# Relatório comercial de simulação

> **Fonte do clima: NASA POWER (dados reais)**  
> Gerado em: 2026-11-14T18:30:26.361626+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Cultura:** Soja (experimental)
- **Semeadura:** 10-01 · Safras simuladas: 24 (2001–2024)
- **Solo:** Argiloso (ex.: Latossolo) · **Irrigação:** sequeiro
- **Local:** -18.9200, -48.2800 · IBGE 3170206
- **Cenário:** seco e quente (Δchuva -20.0%, ΔT 1.5 °C)

## Resumo

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Rendimento (sc/ha) | 43.1 | 64.0 | 66.7 |

## Água e solo

- Água consumida pela lavoura (típico): 4655 m³/ha
- Água de irrigação (típico): 0 m³/ha
- Dias com falta de água (típico / ano ruim): 16 / 46
- Enxurrada (proxy de erosão, típico): 15 mm

### Cenário climático vs histórico

- Rendimento (kg/ha): P10 3257.42 → 2588.38 (Δ -669.04) · P50 3976.95 → 3841.7 (Δ -135.25) · média 3772.29 → 3549.89 (Δ -222.4)
- Água consumida (m³/ha): P10 4381.12 → 4314.11 (Δ -67.01) · P50 4657.7 → 4655.1 (Δ -2.6) · média 4609.39 → 4645.39 (Δ 36.0)
- Água de irrigação (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 0.0 → 0.0 (Δ 0.0) · média 0.0 → 0.0 (Δ 0.0)
- Dias de estresse hídrico: P10 0.0 → 0.0 (Δ 0.0) · P50 7.0 → 15.5 (Δ 8.5) · média 11.75 → 20.0 (Δ 8.25)

### Irrigação deficitária vs sequeiro

- Rendimento (kg/ha): P10 2588.38 → 3978.7 (Δ 1390.32) · P50 3841.7 → 3994.6 (Δ 152.9) · média 3549.89 → 3991.99 (Δ 442.1)
- Água consumida (m³/ha): P10 4314.11 → 4552.79 (Δ 238.68) · P50 4655.1 → 4880.85 (Δ 225.75) · média 4645.39 → 4908.4 (Δ 263.01)
- Água de irrigação (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 0.0 → 920.05 (Δ 920.05) · média 0.0 → 957.9 (Δ 957.9)
- Dias de estresse hídrico: P10 0.0 → 0.0 (Δ 0.0) · P50 15.5 → 2.0 (Δ -13.5) · média 20.0 → 1.54 (Δ -18.46)

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