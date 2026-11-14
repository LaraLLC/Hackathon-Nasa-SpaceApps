"""Relatórios em Markdown a partir do JSON da simulação (o frontend renderiza/imprime em PDF).

- technical: para agrônomo/especialista — entradas, métodos, premissas, distribuição, balanço por fase.
- commercial: para o dono da fazenda — sacas, lucro, risco de prejuízo, água, em linguagem direta.
"""
from __future__ import annotations

from typing import Literal

L = {
    "pt": {
        "tech_title": "Relatório técnico de simulação", "com_title": "Relatório comercial de simulação",
        "id": "Identificação", "inputs": "Entradas", "assump": "Premissas", "methods": "Métodos",
        "results": "Resultados (distribuição sobre anos históricos)", "phase": "Água por fase (ano típico)",
        "env": "Indicadores ambientais", "comp": "Comparação de cenários", "limits": "Limitações e avisos",
        "prov": "Proveniência", "exec": "Resumo", "money": "Resultado financeiro", "water": "Água e solo",
        "reading": "Como ler", "crop": "Cultura", "sow": "Semeadura", "soil": "Solo", "irr": "Irrigação",
        "years": "Safras simuladas", "yield": "Rendimento", "profit": "Lucro", "loss": "Probabilidade de prejuízo",
        "be": "Ponto de equilíbrio", "metric": "Métrica", "method": "Método",
        "reading_txt": ("P10 = ano ruim (só 1 em cada 10 anos históricos foi pior); P50 = ano típico; "
                        "P90 = ano bom. Valores vêm de rodar a mesma decisão em cada ano do histórico NASA POWER."),
        "flag_high": "Risco de prejuízo ALTO nesta configuração (≥ 30% dos anos).",
        "flag_mid": "Risco de prejuízo moderado (10–30% dos anos).",
        "flag_low": "Risco de prejuízo baixo (< 10% dos anos).",
        "bags": "sc/ha", "base": "baseline", "scen": "cenário", "mean": "média",
    },
    "en": {
        "tech_title": "Technical simulation report", "com_title": "Business simulation report",
        "id": "Identification", "inputs": "Inputs", "assump": "Assumptions", "methods": "Methods",
        "results": "Results (distribution over historical years)", "phase": "Water by phase (typical year)",
        "env": "Environmental indicators", "comp": "Scenario comparison", "limits": "Limitations and warnings",
        "prov": "Provenance", "exec": "Summary", "money": "Financial outcome", "water": "Water and soil",
        "reading": "How to read", "crop": "Crop", "sow": "Sowing", "soil": "Soil", "irr": "Irrigation",
        "years": "Simulated seasons", "yield": "Yield", "profit": "Profit", "loss": "Probability of loss",
        "be": "Break-even", "metric": "Metric", "method": "Method",
        "reading_txt": ("P10 = bad year (only 1 in 10 historical years was worse); P50 = typical year; "
                        "P90 = good year. Values come from running the same decision over every NASA POWER year."),
        "flag_high": "HIGH risk of loss in this setup (≥ 30% of years).",
        "flag_mid": "Moderate risk of loss (10–30% of years).",
        "flag_low": "Low risk of loss (< 10% of years).",
        "bags": "bags/ha", "base": "baseline", "scen": "scenario", "mean": "mean",
    },
}


def _row(cells) -> str:
    return "| " + " | ".join(str(c) for c in cells) + " |"


def _dist_rows(name: str, d: dict, unit: str = "") -> str:
    return _row([name, f"{d['p10']}{unit}", f"{d['p50']}{unit}", f"{d['p90']}{unit}"])


def _f(v) -> str:
    """Valor ausente (resultado gerado antes dos campos p10/mean) vira travessão."""
    return "—" if v is None else str(v)


def _comp_line(k: str, v: dict, mean_label: str) -> str:
    """Linha comercial: P10, P50 e média de uma comparação (campos p10/mean são opcionais)."""
    parts = []
    if "baseline_p10" in v:
        parts.append(f"P10 {v['baseline_p10']} → {v['scenario_p10']} (Δ {v['delta_p10']})")
    parts.append(f"P50 {v['baseline_p50']} → {v['scenario_p50']} (Δ {v['delta']})")
    if "baseline_mean" in v:
        parts.append(f"{mean_label} {v['baseline_mean']} → {v['scenario_mean']} (Δ {v['delta_mean']})")
    return f"- {k}: " + " · ".join(parts)


def build_report(result: dict, kind: Literal["technical", "commercial"], lang: str = "pt",
                 farm_name: str | None = None) -> str:
    t = L.get(lang, L["pt"])
    if result.get("status") != "ok":
        return f"# {t['tech_title']}\n\nstatus: {result.get('status')}\n\n" + "\n".join(
            f"- {w}" for w in result.get("warnings", []))
    req, crop, s = result["request"], result["crop"], result["summary"]
    crop_name = crop["name_pt"] if lang == "pt" else crop["name_en"]
    header = [
        f"- **{t['crop']}:** {crop_name} ({crop['status']})",
        f"- **{t['sow']}:** {req['sowing_date']} · {t['years']}: {s['n_seasons']} "
        f"({req['first_year']}–{req['last_year']})",
        f"- **{t['soil']}:** {result['soil']['name_pt']} · **{t['irr']}:** {req['management']['irrigation']}",
        f"- Local: {req['location']['lat']:.4f}, {req['location']['lon']:.4f}"
        + (f" · {req['location']['area_id']}" if req['location'].get('area_id') else ""),
        f"- Cenário: {result['scenario']['label']} (Δchuva {result['scenario']['precip_delta_pct']}%, "
        f"ΔT {result['scenario']['temp_delta_c']} °C)",
    ]
    bag = 60.0
    y = s["yield_kg_ha"]
    lines: list[str] = []

    if kind == "commercial":
        lines += [f"# {t['com_title']}" + (f" — {farm_name}" if farm_name else ""), "", *header, "",
                  f"## {t['exec']}", "",
                  _row(["", "P10", "P50", "P90"]), _row(["---"] * 4),
                  _row([f"{t['yield']} ({t['bags']})", round(y['p10'] / bag, 1), round(y['p50'] / bag, 1),
                        round(y['p90'] / bag, 1)])]
        eco = s.get("economics")
        if eco:
            p = eco["profit_per_ha"]
            lines.append(_row([f"{t['profit']} (R$/ha)", p["p10"], p["p50"], p["p90"]]))
            pl = eco["probability_of_loss"]
            lines += ["", f"## {t['money']}", "",
                      f"- **{t['loss']}:** {pl * 100:.0f}%",
                      f"- **{t['be']}:** {eco['breakeven_bags_per_ha']} {t['bags']}",
                      f"- {t['flag_high'] if pl >= 0.3 else t['flag_mid'] if pl >= 0.1 else t['flag_low']}",
                      f"- Preço: {req['economics']['price_per_bag']} R$/sc ({req['economics']['price_source']}); "
                      f"custo: {req['economics']['cost_per_ha']} R$/ha ({req['economics']['cost_source']})"]
        ind = s["indicators"]
        lines += ["", f"## {t['water']}", "",
                  f"- Água consumida pela lavoura (típico): {ind['crop_water_use_m3_ha']['p50']:.0f} m³/ha",
                  f"- Água de irrigação (típico): {ind['blue_water_m3_ha']['p50']:.0f} m³/ha",
                  f"- Dias com falta de água (típico / ano ruim): {ind['water_stress_days']['p50']:.0f} / "
                  f"{ind['water_stress_days']['p90']:.0f}",
                  f"- Enxurrada (proxy de erosão, típico): {ind['runoff_mm']['p50']:.0f} mm"]
        for name, comp in result.get("comparisons", {}).items():
            lines += ["", f"### {name}", ""]
            for k, v in comp.items():
                if "delta" in v and "baseline_p50" in v:
                    lines.append(_comp_line(k, v, t["mean"]))
                elif "baseline" in v:
                    lines.append(f"- {k}: {v['baseline']} → {v['scenario']}")
        lines += ["", f"## {t['reading']}", "", t["reading_txt"], "",
                  f"## {t['limits']}", "", *[f"- {w}" for w in result["warnings"]]]
        return "\n".join(lines)

    # technical
    lines += [f"# {t['tech_title']}" + (f" — {farm_name}" if farm_name else ""), "", f"## {t['id']}", "", *header,
              f"- model_version: `{result['model_version']}` · data_version: `{result['data_version']}`", "",
              f"## {t['methods']}", "", result["engine"], "",
              f"## {t['assump']}", "", *[f"- {a}" for a in result["assumptions"]],
              f"- Rendimento de referência: {result['seasons'][0]['yield_kg_ha'] / max(1e-9, result['seasons'][0]['relative_yield']):.0f} kg/ha",
              "", f"## {t['results']}", "",
              _row([t["metric"], "P10", "P50", "P90"]), _row(["---"] * 4),
              _dist_rows(f"{t['yield']} (kg/ha)", y), _dist_rows("Ya/Ym", s["relative_yield"])]
    for k, d in s["indicators"].items():
        lines.append(_dist_rows(k, d))
    if s.get("economics"):
        lines.append(_dist_rows(f"{t['profit']} (R$/ha)", s["economics"]["profit_per_ha"]))
        lines.append(_row([t["loss"], "", f"{s['economics']['probability_of_loss'] * 100:.0f}%", ""]))
    rep = result.get("representative_seasons", {}).get("typical")
    if rep:
        lines += ["", f"## {t['phase']} — {rep['season_year']}", "",
                  _row(["Fase", "ETc (mm)", "ETa (mm)", "ETa/ETc", "Ky"]), _row(["---"] * 5)]
        for ph, v in rep["phase_water"].items():
            ratio = v["eta_mm"] / v["etc_mm"] if v["etc_mm"] else 1
            lines.append(_row([ph, v["etc_mm"], v["eta_mm"], f"{ratio:.2f}", v["ky"]]))
    lines += ["", f"## {t['env']}", "", _row([t["metric"], t["method"]]), _row(["---"] * 2),
              *[_row([k, v]) for k, v in result["indicator_methods"].items()]]
    for name, comp in result.get("comparisons", {}).items():
        b, c, m = t["base"], t["scen"], t["mean"]
        lines += ["", f"## {t['comp']}: {name}", "",
                  _row([t["metric"], f"{b} P10", f"{c} P10", "Δ P10", f"{b} P50", f"{c} P50", "Δ P50", "Δ% P50",
                        f"{b} {m}", f"{c} {m}", f"Δ {m}"]),
                  _row(["---"] * 11)]
        for k, v in comp.items():
            if "baseline_p50" in v:
                lines.append(_row([k, _f(v.get("baseline_p10")), _f(v.get("scenario_p10")), _f(v.get("delta_p10")),
                                   v["baseline_p50"], v["scenario_p50"], v["delta"], _f(v["delta_pct"]),
                                   _f(v.get("baseline_mean")), _f(v.get("scenario_mean")),
                                   _f(v.get("delta_mean"))]))
    lines += ["", f"## {t['limits']}", "", *[f"- {w}" for w in result["warnings"]],
              "", f"## {t['prov']}", "", *[f"- {r}" for r in result["source_refs"]],
              f"- generated_at: {result['generated_at']} · observed_through: {result['observed_through']}"]
    if result.get("skipped_years"):
        lines.append(f"- Anos sem dados completos: {result['skipped_years']}")
    return "\n".join(lines)
