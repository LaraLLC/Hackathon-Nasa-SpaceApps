# Relatório comercial de simulação

> **Fonte do clima: NASA POWER (dados reais)**  
> Gerado em: 2026-11-14T18:30:39.426276+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Cultura:** Milho safrinha (experimental)
- **Semeadura:** 02-15 · Safras simuladas: 24 (2001–2024)
- **Solo:** Médio (franco) · **Irrigação:** sequeiro
- **Local:** -18.9200, -48.2800 · IBGE 3170206
- **Cenário:** seco e quente (Δchuva -20.0%, ΔT 1.5 °C)

## Resumo

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Rendimento (sc/ha) | 52.2 | 71.0 | 92.4 |

## Água e solo

- Água consumida pela lavoura (típico): 2998 m³/ha
- Água de irrigação (típico): 0 m³/ha
- Dias com falta de água (típico / ano ruim): 51 / 64
- Enxurrada (proxy de erosão, típico): 1 mm

### Cenário climático vs histórico

- Rendimento (kg/ha): P10 3654.69 → 3133.38 (Δ -521.31) · P50 4862.85 → 4257.85 (Δ -605.0) · média 4825.41 → 4370.32 (Δ -455.09)
- Água consumida (m³/ha): P10 2665.85 → 2626.82 (Δ -39.03) · P50 3061.2 → 2997.8 (Δ -63.4) · média 3004.15 → 2931.68 (Δ -72.47)
- Água de irrigação (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 0.0 → 0.0 (Δ 0.0) · média 0.0 → 0.0 (Δ 0.0)
- Dias de estresse hídrico: P10 22.3 → 31.0 (Δ 8.7) · P50 45.5 → 51.0 (Δ 5.5) · média 40.83 → 47.92 (Δ 7.09)

### Irrigação deficitária vs sequeiro

- Rendimento (kg/ha): P10 3133.38 → 5960.7 (Δ 2827.32) · P50 4257.85 → 5992.0 (Δ 1734.15) · média 4370.32 → 5984.52 (Δ 1614.2)
- Água consumida (m³/ha): P10 2626.82 → 3375.02 (Δ 748.2) · P50 2997.8 → 3725.1 (Δ 727.3) · média 2931.68 → 3727.35 (Δ 795.67)
- Água de irrigação (m³/ha): P10 0.0 → 1100.97 (Δ 1100.97) · P50 0.0 → 2041.95 (Δ 2041.95) · média 0.0 → 1737.62 (Δ 1737.62)
- Dias de estresse hídrico: P10 31.0 → 1.0 (Δ -30.0) · P50 51.0 → 2.0 (Δ -49.0) · média 47.92 → 1.62 (Δ -46.3)

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