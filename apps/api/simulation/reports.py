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
        "badge_real": "Fonte do clima: NASA POWER (dados reais)",
        "badge_synth": "⚠ DADOS SINTÉTICOS DE TESTE — não usar em apresentação",
        "generated": "Gerado em", "location": "Local", "scenario": "Cenário", "drain": "Δchuva",
        "nasa": "Dados NASA utilizados", "nasa_product": "Produto", "nasa_params": "Parâmetros diários",
        "nasa_period": "Período baixado", "nasa_seasons": "Safras simuladas", "nasa_point": "Ponto consultado",
        "nasa_res": "Resolução", "nasa_res_note": "o clima representa a região, não o talhão",
        "nasa_access": "Data de acesso", "nasa_api": "API", "nasa_docs": "Documentação", "nasa_request": "Requisição reprodutível",
        "nasa_none": "Nenhum dado NASA: esta simulação usou clima sintético de teste.",
        "price": "Preço", "cost": "custo",
        "w_use": "Água consumida pela lavoura (típico)", "w_blue": "Água de irrigação (típico)",
        "w_stress": "Dias com falta de água (típico / ano ruim)", "w_runoff": "Enxurrada (proxy de erosão, típico)",
        "phase_col": "Fase", "ref_yield": "Rendimento de referência", "skipped": "Anos sem dados completos",
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
        "badge_real": "Weather source: NASA POWER (real data)",
        "badge_synth": "⚠ SYNTHETIC TEST DATA — do not use in presentations",
        "generated": "Generated at", "location": "Location", "scenario": "Scenario", "drain": "Δrain",
        "nasa": "NASA data used", "nasa_product": "Product", "nasa_params": "Daily parameters",
        "nasa_period": "Period downloaded", "nasa_seasons": "Simulated seasons", "nasa_point": "Point queried",
        "nasa_res": "Resolution", "nasa_res_note": "weather represents the region, not the field",
        "nasa_access": "Access date", "nasa_api": "API", "nasa_docs": "Documentation", "nasa_request": "Reproducible request",
        "nasa_none": "No NASA data: this simulation used synthetic test weather.",
        "price": "Price", "cost": "cost",
        "w_use": "Crop water use (typical)", "w_blue": "Irrigation water (typical)",
        "w_stress": "Water-stress days (typical / bad year)", "w_runoff": "Runoff (erosion proxy, typical)",
        "phase_col": "Phase", "ref_yield": "Reference yield", "skipped": "Years without complete data",
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


PARAM_LABELS = {
    "pt": {"T2M_MAX": "temperatura máxima do ar a 2 m (°C)", "T2M_MIN": "temperatura mínima do ar a 2 m (°C)",
           "RH2M": "umidade relativa a 2 m (%)", "WS2M": "velocidade do vento a 2 m (m/s)",
           "ALLSKY_SFC_SW_DWN": "radiação solar de onda curta na superfície (MJ/m²/dia)",
           "PRECTOTCORR": "precipitação corrigida (mm/dia)"},
    "en": {"T2M_MAX": "maximum air temperature at 2 m (°C)", "T2M_MIN": "minimum air temperature at 2 m (°C)",
           "RH2M": "relative humidity at 2 m (%)", "WS2M": "wind speed at 2 m (m/s)",
           "ALLSKY_SFC_SW_DWN": "all-sky surface shortwave radiation (MJ/m²/day)",
           "PRECTOTCORR": "bias-corrected precipitation (mm/day)"},
}


COMP_NAMES = {
    "pt": {"climate_vs_baseline": "Cenário climático vs histórico", "deficit_vs_rainfed": "Irrigação deficitária vs sequeiro",
           "rainfed_vs_deficit": "Sequeiro vs irrigação deficitária", "full_vs_rainfed": "Irrigação plena vs sequeiro",
           "rainfed_vs_full": "Sequeiro vs irrigação plena"},
    "en": {"climate_vs_baseline": "Climate scenario vs historical", "deficit_vs_rainfed": "Deficit irrigation vs rainfed",
           "rainfed_vs_deficit": "Rainfed vs deficit irrigation", "full_vs_rainfed": "Full irrigation vs rainfed",
           "rainfed_vs_full": "Rainfed vs full irrigation"},
}
METRIC_NAMES = {
    "pt": {"yield_kg_ha": "Rendimento (kg/ha)", "crop_water_use_m3_ha": "Água consumida (m³/ha)",
           "blue_water_m3_ha": "Água de irrigação (m³/ha)", "water_stress_days": "Dias de estresse hídrico",
           "profit_per_ha": "Lucro (R$/ha)", "probability_of_loss": "Probabilidade de prejuízo"},
    "en": {"yield_kg_ha": "Yield (kg/ha)", "crop_water_use_m3_ha": "Crop water use (m³/ha)",
           "blue_water_m3_ha": "Irrigation water (m³/ha)", "water_stress_days": "Water-stress days",
           "profit_per_ha": "Profit (R$/ha)", "probability_of_loss": "Probability of loss"},
}


def _cname(key: str, lang: str) -> str:
    return COMP_NAMES.get(lang, COMP_NAMES["pt"]).get(key, key)


def _mname(key: str, lang: str) -> str:
    return METRIC_NAMES.get(lang, METRIC_NAMES["pt"]).get(key, key)


def _reference_yield(result: dict) -> float:
    """Ym usado: campo crop.reference_yield_kg_ha > pedido > safra com Ya/Ym = 1 > Ya/(Ya/Ym) (arredondado)."""
    if (result.get("crop") or {}).get("reference_yield_kg_ha"):
        return float(result["crop"]["reference_yield_kg_ha"])
    req = result.get("request") or {}
    if req.get("reference_yield_kg_ha"):
        return float(req["reference_yield_kg_ha"])
    seasons = result.get("seasons") or []
    full = [s["yield_kg_ha"] for s in seasons if s.get("relative_yield", 0) >= 0.9999]
    if full:
        return max(full)
    best = max(seasons, key=lambda s: s.get("relative_yield", 0), default=None)
    return best["yield_kg_ha"] / max(1e-9, best["relative_yield"]) if best else float("nan")


def _is_real(result: dict) -> bool:
    da = result.get("data_access")
    if da is not None:
        return not da.get("synthetic", True)
    return str(result.get("data_version", "")).startswith("nasa_power:")  # respostas antigas sem data_access


def _meta_block(result: dict, t: dict) -> list[str]:
    """Cabeçalho: selo de fonte, data de geração e versões (sempre logo abaixo do título)."""
    badge = t["badge_real"] if _is_real(result) else t["badge_synth"]
    return [f"> **{badge}**  ",
            f"> {t['generated']}: {result.get('generated_at', '—')} · model_version `{result.get('model_version', '—')}` "
            f"· data_version `{result.get('data_version', '—')}`", ""]


def _nasa_section(result: dict, t: dict, lang: str) -> list[str]:
    """Seção exigida pela submissão: dados NASA usados, com período, resolução, data de acesso e link da API."""
    da = result.get("data_access") or {}
    lines = ["", f"## {t['nasa']}", ""]
    if not _is_real(result):
        return lines + [f"- {t['nasa_none']}"]
    req = result.get("request", {})
    labels = PARAM_LABELS.get(lang, PARAM_LABELS["pt"])
    params = da.get("parameters") or list(labels)
    lines += [f"- **{t['nasa_product']}:** {da.get('product', 'NASA POWER Daily API, community=AG')}",
              f"- **{t['nasa_params']}:** " + "; ".join(f"`{p}` ({labels.get(p, p)})" for p in params),
              f"- **{t['nasa_period']}:** {da.get('start', '—')} → {da.get('end', '—')} · "
              f"{t['nasa_seasons']}: {req.get('first_year', '—')}–{req.get('last_year', '—')}",
              f"- **{t['nasa_point']}:** {result['spatial_scope']['lat']:.4f}, {result['spatial_scope']['lon']:.4f}"
              f" · **{t['nasa_res']}:** {da.get('resolution', result['spatial_scope'].get('weather_resolution'))}"
              f" ({t['nasa_res_note']})",
              f"- **{t['nasa_access']}:** {str(da.get('retrieved_at', '—'))[:10]}",
              f"- **{t['nasa_api']}:** <{da.get('api_url', 'https://power.larc.nasa.gov/api/temporal/daily/point')}> · "
              f"**{t['nasa_docs']}:** <{da.get('docs_url', 'https://power.larc.nasa.gov/docs/services/api/temporal/daily/')}>"]
    if da.get("request_url"):
        lines.append(f"- **{t['nasa_request']}:** `{da['request_url']}`")
    return lines


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
        f"- **{t['location']}:** {req['location']['lat']:.4f}, {req['location']['lon']:.4f}"
        + (f" · IBGE {req['location']['area_id']}" if req['location'].get('area_id') else ""),
        f"- **{t['scenario']}:** {result['scenario']['label']} ({t['drain']} {result['scenario']['precip_delta_pct']}%, "
        f"ΔT {result['scenario']['temp_delta_c']} °C)",
    ]
    meta = _meta_block(result, t)
    nasa = _nasa_section(result, t, lang)
    bag = 60.0
    y = s["yield_kg_ha"]
    lines: list[str] = []

    if kind == "commercial":
        lines += [f"# {t['com_title']}" + (f" — {farm_name}" if farm_name else ""), "", *meta, *header, "",
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
                      f"- {t['price']}: {req['economics']['price_per_bag']} R$/sc ({req['economics']['price_source']}); "
                      f"{t['cost']}: {req['economics']['cost_per_ha']} R$/ha ({req['economics']['cost_source']})"]
        ind = s["indicators"]
        lines += ["", f"## {t['water']}", "",
                  f"- {t['w_use']}: {ind['crop_water_use_m3_ha']['p50']:.0f} m³/ha",
                  f"- {t['w_blue']}: {ind['blue_water_m3_ha']['p50']:.0f} m³/ha",
                  f"- {t['w_stress']}: {ind['water_stress_days']['p50']:.0f} / "
                  f"{ind['water_stress_days']['p90']:.0f}",
                  f"- {t['w_runoff']}: {ind['runoff_mm']['p50']:.0f} mm"]
        for name, comp in result.get("comparisons", {}).items():
            lines += ["", f"### {_cname(name, lang)}", ""]
            for k, v in comp.items():
                if "delta" in v and "baseline_p50" in v:
                    lines.append(_comp_line(_mname(k, lang), v, t["mean"]))
                elif "baseline" in v:
                    lines.append(f"- {_mname(k, lang)}: {v['baseline']} → {v['scenario']}")
        lines += ["", f"## {t['reading']}", "", t["reading_txt"], *nasa, "",
                  f"## {t['limits']}", "", *[f"- {w}" for w in result["warnings"]]]
        return "\n".join(lines)

    # technical
    lines += [f"# {t['tech_title']}" + (f" — {farm_name}" if farm_name else ""), "", *meta, f"## {t['id']}", "", *header,
              f"- model_version: `{result['model_version']}` · data_version: `{result['data_version']}`", "",
              f"## {t['methods']}", "", result["engine"], "",
              f"## {t['assump']}", "", *[f"- {a}" for a in result["assumptions"]],
              f"- {t['ref_yield']}: {_reference_yield(result):.0f} kg/ha",
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
                  _row([t["phase_col"], "ETc (mm)", "ETa (mm)", "ETa/ETc", "Ky"]), _row(["---"] * 5)]
        for ph, v in rep["phase_water"].items():
            ratio = v["eta_mm"] / v["etc_mm"] if v["etc_mm"] else 1
            lines.append(_row([ph, v["etc_mm"], v["eta_mm"], f"{ratio:.2f}", v["ky"]]))
    lines += ["", f"## {t['env']}", "", _row([t["metric"], t["method"]]), _row(["---"] * 2),
              *[_row([k, v]) for k, v in result["indicator_methods"].items()]]
    for name, comp in result.get("comparisons", {}).items():
        b, c, m = t["base"], t["scen"], t["mean"]
        lines += ["", f"## {t['comp']}: {_cname(name, lang)}", "",
                  _row([t["metric"], f"{b} P10", f"{c} P10", "Δ P10", f"{b} P50", f"{c} P50", "Δ P50", "Δ% P50",
                        f"{b} {m}", f"{c} {m}", f"Δ {m}"]),
                  _row(["---"] * 11)]
        for k, v in comp.items():
            if "baseline_p50" in v:
                lines.append(_row([_mname(k, lang), _f(v.get("baseline_p10")), _f(v.get("scenario_p10")), _f(v.get("delta_p10")),
                                   v["baseline_p50"], v["scenario_p50"], v["delta"], _f(v["delta_pct"]),
                                   _f(v.get("baseline_mean")), _f(v.get("scenario_mean")),
                                   _f(v.get("delta_mean"))]))
    lines += [*nasa, "", f"## {t['limits']}", "", *[f"- {w}" for w in result["warnings"]],
              "", f"## {t['prov']}", "", *[f"- {r}" for r in result["source_refs"]],
              f"- generated_at: {result['generated_at']} · observed_through: {result['observed_through']}"]
    if result.get("skipped_years"):
        lines.append(f"- {t['skipped']}: {result['skipped_years']}")
    return "\n".join(lines)
