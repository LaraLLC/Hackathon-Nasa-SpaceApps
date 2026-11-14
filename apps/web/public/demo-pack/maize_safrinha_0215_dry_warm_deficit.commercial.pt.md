# Relatório comercial de simulação

> **Fonte do clima: NASA POWER (dados reais)**  
> Gerado em: 2026-11-14T18:30:40.445919+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Cultura:** Milho safrinha (experimental)
- **Semeadura:** 02-15 · Safras simuladas: 24 (2001–2024)
- **Solo:** Médio (franco) · **Irrigação:** irrigação deficitária
- **Local:** -18.9200, -48.2800 · IBGE 3170206
- **Cenário:** seco e quente (Δchuva -20.0%, ΔT 1.5 °C)

## Resumo

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Rendimento (sc/ha) | 99.3 | 99.9 | 100.0 |

## Água e solo

- Água consumida pela lavoura (típico): 3725 m³/ha
- Água de irrigação (típico): 2042 m³/ha
- Dias com falta de água (típico / ano ruim): 2 / 2
- Enxurrada (proxy de erosão, típico): 1 mm

### Cenário climático vs histórico

- Rendimento (kg/ha): P10 5980.09 → 5960.7 (Δ -19.39) · P50 5995.05 → 5992.0 (Δ -3.05) · média 5991.82 → 5984.52 (Δ -7.3)
- Água consumida (m³/ha): P10 3228.77 → 3375.02 (Δ 146.25) · P50 3564.3 → 3725.1 (Δ 160.8) · média 3570.47 → 3727.35 (Δ 156.88)
- Água de irrigação (m³/ha): P10 1065.11 → 1100.97 (Δ 35.86) · P50 1223.75 → 2041.95 (Δ 818.2) · média 1652.67 → 1737.62 (Δ 84.95)
- Dias de estresse hídrico: P10 1.0 → 1.0 (Δ 0.0) · P50 1.0 → 2.0 (Δ 1.0) · média 1.5 → 1.62 (Δ 0.12)

### Sequeiro vs irrigação deficitária

- Rendimento (kg/ha): P10 5960.7 → 3133.38 (Δ -2827.32) · P50 5992.0 → 4257.85 (Δ -1734.15) · média 5984.52 → 4370.32 (Δ -1614.2)
- Água consumida (m³/ha): P10 3375.02 → 2626.82 (Δ -748.2) · P50 3725.1 → 2997.8 (Δ -727.3) · média 3727.35 → 2931.68 (Δ -795.67)
- Água de irrigação (m³/ha): P10 1100.97 → 0.0 (Δ -1100.97) · P50 2041.95 → 0.0 (Δ -2041.95) · média 1737.62 → 0.0 (Δ -1737.62)
- Dias de estresse hídrico: P10 1.0 → 31.0 (Δ 30.0) · P50 2.0 → 51.0 (Δ 49.0) · média 1.62 → 47.92 (Δ 46.3)

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