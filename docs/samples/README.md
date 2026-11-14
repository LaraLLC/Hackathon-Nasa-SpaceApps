# Relatórios de exemplo (PDF)

Gerados pelo caminho real de impressão da aba **Simular** (botão "Imprimir / Salvar PDF", CSS `@media print`),
em modo fixture, a partir do demo-pack com dados **reais do NASA POWER** (Uberlândia, IBGE 3170206; safras 2001–2024).
O texto vem de `apps/api/simulation/reports.py`, o mesmo usado pela rota `POST /v1/simulations/report`.

| Arquivo | Cenário |
|---|---|
| `soja_1020_baseline_sequeiro_{technical,commercial}_{pt,en}.pdf` | Soja, semeadura 20/10, solo argiloso, sequeiro, clima histórico |
| `milho_0310_seco-quente_sequeiro_{technical,commercial}_{pt,en}.pdf` | Milho safrinha, semeadura 10/03, solo médio, sequeiro, Δchuva −20% e ΔT +1,5 °C |

Sem preço/custo: os relatórios não trazem resultado econômico. O rendimento de referência (Ym) é placeholder
a calibrar com IBGE/PAM. Os textos de premissas, métodos e avisos vêm do motor em português também nos relatórios em inglês.
