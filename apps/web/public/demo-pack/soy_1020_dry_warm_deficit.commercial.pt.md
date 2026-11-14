# Relatório comercial de simulação

> **Fonte do clima: NASA POWER (dados reais)**  
> Gerado em: 2026-11-14T18:12:37.449492+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Cultura:** Soja (experimental)
- **Semeadura:** 10-20 · Safras simuladas: 24 (2001–2024)
- **Solo:** Argiloso (ex.: Latossolo) · **Irrigação:** deficit
- **Local:** -18.9200, -48.2800 · IBGE 3170206
- **Cenário:** dry_warm (Δchuva -20.0%, ΔT 1.5 °C)

## Resumo

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Rendimento (sc/ha) | 66.4 | 66.7 | 66.7 |

## Água e solo

- Água consumida pela lavoura (típico): 4717 m³/ha
- Água de irrigação (típico): 363 m³/ha
- Dias com falta de água (típico / ano ruim): 0 / 3
- Enxurrada (proxy de erosão, típico): 17 mm

### Cenário climático vs histórico

- Rendimento (kg/ha): P10 3992.63 → 3982.15 (Δ -10.48) · P50 4000.0 → 3999.6 (Δ -0.4) · média 3997.59 → 3993.44 (Δ -4.15)
- Água consumida (m³/ha): P10 4336.35 → 4507.34 (Δ 170.99) · P50 4541.9 → 4717.4 (Δ 175.5) · média 4617.95 → 4793.47 (Δ 175.52)
- Água de irrigação (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 0.0 → 362.7 (Δ 362.7) · média 396.66 → 711.63 (Δ 314.97)
- Dias de estresse hídrico: P10 0.0 → 0.0 (Δ 0.0) · P50 0.0 → 0.5 (Δ 0.5) · média 0.54 → 0.96 (Δ 0.42)

### Sequeiro vs irrigação deficitária

- Rendimento (kg/ha): P10 3982.15 → 2622.57 (Δ -1359.58) · P50 3999.6 → 3982.6 (Δ -17.0) · média 3993.44 → 3580.13 (Δ -413.31)
- Água consumida (m³/ha): P10 4507.34 → 4280.06 (Δ -227.28) · P50 4717.4 → 4570.25 (Δ -147.15) · média 4793.47 → 4531.8 (Δ -261.67)
- Água de irrigação (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 362.7 → 0.0 (Δ -362.7) · média 711.63 → 0.0 (Δ -711.63)
- Dias de estresse hídrico: P10 0.0 → 0.0 (Δ 0.0) · P50 0.5 → 1.0 (Δ 0.5) · média 0.96 → 14.12 (Δ 13.16)

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