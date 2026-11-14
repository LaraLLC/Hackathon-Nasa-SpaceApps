# Relatório comercial de simulação

> **Fonte do clima: NASA POWER (dados reais)**  
> Gerado em: 2026-11-14T18:12:38.947633+00:00 · model_version `gaiapus-sim-0.1.0` · data_version `nasa_power:2001-01-01..2025-12-31`

- **Cultura:** Soja (experimental)
- **Semeadura:** 11-10 · Safras simuladas: 24 (2001–2024)
- **Solo:** Argiloso (ex.: Latossolo) · **Irrigação:** deficit
- **Local:** -18.9200, -48.2800 · IBGE 3170206
- **Cenário:** dry_warm (Δchuva -20.0%, ΔT 1.5 °C)

## Resumo

|  | P10 | P50 | P90 |
| --- | --- | --- | --- |
| Rendimento (sc/ha) | 66.3 | 66.6 | 66.7 |

## Água e solo

- Água consumida pela lavoura (típico): 4610 m³/ha
- Água de irrigação (típico): 741 m³/ha
- Dias com falta de água (típico / ano ruim): 1 / 3
- Enxurrada (proxy de erosão, típico): 15 mm

### Cenário climático vs histórico

- Rendimento (kg/ha): P10 3985.72 → 3976.85 (Δ -8.87) · P50 4000.0 → 3996.3 (Δ -3.7) · média 3995.64 → 3991.88 (Δ -3.76)
- Água consumida (m³/ha): P10 4261.42 → 4430.12 (Δ 168.7) · P50 4438.9 → 4610.2 (Δ 171.3) · média 4558.08 → 4732.78 (Δ 174.7)
- Água de irrigação (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 0.0 → 740.9 (Δ 740.9) · média 554.27 → 807.43 (Δ 253.16)
- Dias de estresse hídrico: P10 0.0 → 0.0 (Δ 0.0) · P50 0.0 → 1.0 (Δ 1.0) · média 0.75 → 1.12 (Δ 0.37)

### Sequeiro vs irrigação deficitária

- Rendimento (kg/ha): P10 3976.85 → 2134.99 (Δ -1841.86) · P50 3996.3 → 3892.35 (Δ -103.95) · média 3991.88 → 3436.13 (Δ -555.75)
- Água consumida (m³/ha): P10 4430.12 → 4141.47 (Δ -288.65) · P50 4610.2 → 4435.8 (Δ -174.4) · média 4732.78 → 4414.65 (Δ -318.13)
- Água de irrigação (m³/ha): P10 0.0 → 0.0 (Δ 0.0) · P50 740.9 → 0.0 (Δ -740.9) · média 807.43 → 0.0 (Δ -807.43)
- Dias de estresse hídrico: P10 0.0 → 0.0 (Δ 0.0) · P50 1.0 → 9.0 (Δ 8.0) · média 1.12 → 17.38 (Δ 16.26)

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