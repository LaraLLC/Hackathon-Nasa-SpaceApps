# Gaiapus — Simulador preditivo de safra (aba "Simular")

Versão do motor: `gaiapus-sim-0.1.0` · Código: `apps/api/simulation/` · Testes: `apps/api/tests/test_simulation.py`

## 1. O que a aba faz

O usuário escolhe **local, cultura, data de semeadura, solo e manejo** (opcionalmente preço, custo e um cenário climático). O Gaiapus roda essa mesma decisão em **cada ano histórico do NASA POWER** (ex.: 2001–2024) e devolve:

- **Distribuição** de rendimento, lucro e indicadores ambientais (P10 = ano ruim, P50 = típico, P90 = bom), além da **probabilidade de prejuízo**;
- **Estados diários** de dois anos representativos ("típico" e "seco") para o gêmeo digital 3D e para os gráficos;
- **Comparações**: cenário climático vs. histórico, irrigação vs. sequeiro e rotação soja → milho safrinha;
- **Dois relatórios** (Markdown → PDF no frontend): técnico (agrônomo) e comercial (produtor).

**Por que um ensemble e não "IA que prevê a safra":** sem dados de campo não há como validar uma previsão. O ensemble responde a pergunta que o produtor realmente faz: "se eu plantar isso nesta data, quanto risco eu corro?". Cada número tem método rastreável, o que pontua em *Validity* e *Best Use of Science*.

## 2. Métodos

| Etapa | Método | Fonte |
|---|---|---|
| Clima diário | T2M_MAX, T2M_MIN, RH2M, WS2M, ALLSKY_SFC_SW_DWN, PRECTOTCORR | NASA POWER Daily API (community=AG) |
| ET0 | Penman-Monteith (eq. 6), Ra pela eq. 21 | FAO-56 |
| ETc | Kc único por fase (ini/dev/mid/late), interpolado | FAO-56 tab. 12 |
| Balanço hídrico | Depleção da zona radicular, TAW, RAW, p ajustado, Ks | FAO-56 cap. 8 |
| Escoamento | SCS Curve Number | USDA-SCS |
| Rendimento | Ya/Ym = Π[1 − Ky_f(1 − ETa_f/ETc_f)], com 5 fases (a fase mid dividida em floração e enchimento) | FAO-33 / FAO-66 |
| Irrigação | `deficit`: repõe quando Dr ≥ RAW · `full`: repõe quando Dr ≥ 0,5·RAW · eficiência configurável | — |
| Clima "e se" | Δchuva (%) e ΔT (°C) sobre o histórico, com ET0 recalculada | delta-change (teste de sensibilidade) |
| Economia | sacas × preço − (custo + irrigação × R$/mm) | entradas do usuário |

**Ym (rendimento sem limitação hídrica)** é premissa. Para a demo, calibrar com IBGE/PAM do município (ex.: média dos 3 melhores anos) e citar a tabela usada.

### Fora do modelo (sempre exibir)
Pragas, doenças, nutrição, geada, encharcamento, efeito direto de calor no rendimento (só o indicador), bienalidade do café. A resolução do POWER é de ~0,5°, então o clima representa a região, não o talhão.

### Culturas
| Cultura | Status | Ciclo |
|---|---|---|
| Soja | experimental | 120 d |
| Milho safrinha | experimental | 125 d |
| Café | **conceitual** (rótulo obrigatório na UI) | 365 d (ano produtivo) |

## 3. Contrato da API

`GET /v1/simulations/catalog` retorna culturas, solos, modos de irrigação e premissas.

`POST /v1/simulations`
```json
{
  "location": {"lat": -18.92, "lon": -48.28, "area_id": "3170206"},
  "crop": "soy",
  "sowing_date": "10-20",
  "first_year": 2001, "last_year": 2024,
  "soil": "clay",
  "reference_yield_kg_ha": 3900,
  "management": {"irrigation": "rainfed", "initial_available_fraction": 0.8, "initial_theta_m3_m3": null},
  "climate": {"precip_delta_pct": -20, "temp_delta_c": 1.5, "label": "dry_warm"},
  "economics": {"price_per_bag": 0, "cost_per_ha": 0, "irrigation_cost_per_mm_ha": 0, "area_ha": 100,
                "price_source": "CEPEA <data>", "cost_source": "CONAB <safra>"},
  "compare_with_baseline": true,
  "compare_irrigation": true,
  "include_daily": true,
  "lang": "pt"
}
```
`lang` (`"pt"` padrão | `"en"`) escolhe o idioma dos textos do motor (avisos, premissas, métodos dos indicadores, descrição do motor, nome do solo em `soil.name_en`). Não altera nenhum cálculo (teste `test_lang_changes_only_text`); a resposta ecoa `lang`.
(preço e custo são exemplos zerados: a equipe informa valores reais e cita a fonte.)

Resposta: os campos comuns do contrato (`status`, `area_id`, `spatial_scope`, `data_version`, `source_refs`, `observed_through`, `generated_at`, `model_version`, `scenario_type`, `warnings`, `data_access`) + `crop`, `soil`, `assumptions`, `indicator_methods`, `summary`, `seasons[]`, `representative_seasons.{typical,dry}.daily[]` e `comparisons`.

`data_access` (aditivo): proveniência do clima para relatórios e submissão — `provider`, `synthetic`, `parameters`, `start`/`end`, `resolution`, `retrieved_at` (data de acesso gravada no cache), `api_url`, `docs_url` e `request_url` (requisição reprodutível). `crop.reference_yield_kg_ha` (aditivo) é o Ym efetivamente usado.

`comparisons.*.*` traz, além de `baseline_p50`/`scenario_p50`/`delta`/`delta_pct`, os campos `baseline_p10`/`scenario_p10`/`delta_p10` e `baseline_mean`/`scenario_mean`/`delta_mean` (percentis de cada distribuição, não pareados).

`POST /v1/simulations/rotation` recebe um `plan` de 1–3 culturas (ex.: soja 10-15 → milho safrinha 02-15). A umidade do solo é transferida de uma cultura para a seguinte. Retorna lucro anual somado, dias de solo coberto, água total e probabilidade de prejuízo.

`POST /v1/simulations/report?lang=pt|en` com `{kind: "technical"|"commercial", result: <resposta>, farm_name}` retorna Markdown. Os dois relatórios têm cabeçalho com selo da fonte (NASA POWER / SINTÉTICO), `generated_at`, `model_version` e `data_version`, e a seção "Dados NASA utilizados" / "NASA data used". O demo-pack (`apps/api/scripts/export_demo_pack.py`) grava os mesmos 4 relatórios (técnico/comercial × pt/en) ao lado de cada JSON, gerados pela mesma função.

Erros: 422 para entrada inválida, 503 para NASA POWER indisponível e `status: "no_data"` quando não há safra completa no período.

## 4. Estados diários → gêmeo digital 3D

| Campo `daily[]` | Uso visual |
|---|---|
| `das`, `day`, `stage`, `ky_phase` | Slider de tempo; rótulo da fase fenológica |
| `plant_height_m`, `canopy_cover` | Escala vertical e densidade de folhas das plantas |
| `root_depth_m` | Comprimento das raízes no corte de solo |
| `soil_water_fraction` | Cor do solo (seco → úmido); marcadores das estacas a 15/40 cm |
| `ks`, `stress_level` | Cor das folhas: verde (`none`), amarelo (`moderate`), marrom (`severe`) |
| `precip_mm`, `irrigation_mm` | Partículas de chuva / gotejamento no dia |
| `runoff_mm`, `deep_percolation_mm` | Seta de enxurrada na superfície / seta de drenagem abaixo da raiz |
| `heat_stress` | Ícone de calor no dia |
| `relative_yield_so_far` | Barra "potencial de colheita restante" |

Sugestão de implementação: React Three Fiber com um bloco de solo em corte e uma grade de plantas instanciadas (`InstancedMesh`). Usar estilo low-poly; fotorrealismo não é necessário. Alternar entre "Ano típico" e "Ano seco" mostra o risco de forma visual.

## 5. Relatórios

- **Técnico:** identificação, métodos, premissas, tabela P10/P50/P90 de todas as métricas, água por fase (ETc, ETa, Ky), métodos dos indicadores, comparações, limitações e proveniência (versões e datas).
- **Comercial:** sacas/ha e lucro em P10/P50/P90, probabilidade de prejuízo, ponto de equilíbrio, água em m³/ha, dias de falta d'água, ganho/perda da irrigação e um "como ler" em linguagem simples.

## 6. Alinhamento NASA (ambiente e sociedade)

| Elemento | Prêmio/critério visado |
|---|---|
| Cenários Δchuva/ΔT (adaptação climática) | Relevance, Impact, Galactic Impact |
| Água azul vs. verde, produtividade da água (kg/m³) | Best Use of Science / Data |
| Rotação soja → safrinha: solo coberto, renda anual | Relevance (o desafio pede rotação) |
| Enxurrada e drenagem como proxies de erosão e lixiviação | Impact ambiental |
| Probabilidade de prejuízo em linguagem simples, relatório bilíngue | Local Impact, Global Connection |
| Gêmeo digital 3D + estacas | Best Use of Technology, Art & Technology |
| Rastreabilidade total (fonte, versão, premissa) | Validity |

## 7. Roteiro da demo (30 s)
1. Uberlândia, soja, 20/10, sequeiro, P50 ≈ X sc/ha, prejuízo em Y% dos anos.
2. Mover o slider para "−20% chuva, +1,5 °C", mostrando a queda e o aumento do risco.
3. Ativar a irrigação deficitária: o lucro sobe, mas aparece o custo em m³ de água azul.
4. Mostrar o 3D no ano seco: folhas amarelas na floração.
5. Gerar o PDF comercial.

(Preencher X/Y **com a saída real** usando NASA POWER, nunca com os números sintéticos dos testes.)

## 8. Roadmap de ML (não faz parte do MVP)
1. **Calibração com PAM:** ajustar Ym e os Ky por município e comparar com baselines (média histórica e Ridge) por validação cruzada leave-one-season-out.
2. **Assimilação das estacas:** usar a umidade calibrada (`moisture_m3_m3`) para corrigir a depleção diária. A estaca vira a condição inicial e a verificação do modelo.
3. **MLP híbrida:** prever o resíduo entre a PAM e o modelo físico (física + ML), comparando com os baselines.
4. **RL:** agendamento de irrigação, usando este simulador como ambiente. Só vale a pena depois da validação do passo 2.

## 9. Execução
```bash
cd apps/api
pip install -r simulation/requirements.txt
python scripts/fetch_power.py --lat -18.92 --lon -48.28 --start 2001 --end 2025   # cache offline
uvicorn main:app --reload        # incluir simulation.router no app
pytest -q tests                  # usa clima sintético (GAIAPUS_WEATHER_SOURCE=synthetic_test)
```
