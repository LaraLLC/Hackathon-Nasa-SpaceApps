"""Gera o "demo-pack": respostas REAIS do simulador (NASA POWER, cache local) para o modo fixture do frontend.

    cd apps/api
    python scripts/fetch_power.py --lat -18.92 --lon -48.28 --start 2001 --end 2025   # se o cache não existir
    python scripts/export_demo_pack.py

Grade (Uberlândia, IBGE 3170206; -18.92, -48.28; safras 2001–2024):
    soy            × semeadura {10-01, 10-20, 11-10} × solo clay
    maize_safrinha × semeadura {02-01, 02-15, 03-10} × solo loam
    × clima {baseline, dry_warm (−20 % chuva, +1,5 °C)} × irrigação {rainfed, deficit}
    compare_with_baseline=true, compare_irrigation=true, include_daily=true, economics=null.

Saída: apps/web/public/demo-pack/<crop>_<MMDD>_<clima>_<irrigacao>.json + index.json.
Café fica de fora (status "conceitual": só no modo API).

Garantias:
- Aborta se a fonte meteorológica não for NASA POWER (ex.: GAIAPUS_WEATHER_SOURCE=synthetic_test).
- Por padrão NÃO acessa a rede: exige o cache local. Use --allow-download para permitir.
- As respostas são exatamente as de simulation.service.simulate (mesmo código da rota POST /v1/simulations).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from datetime import date, datetime, timezone
from itertools import product
from pathlib import Path

API_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(API_DIR))

from simulation.schemas import Management, SimulationRequest  # noqa: E402
from simulation.service import MODEL_VERSION, simulate  # noqa: E402
from simulation.weather import _cache_path  # noqa: E402

LOCATION = {"lat": -18.92, "lon": -48.28, "area_id": "3170206"}
LOCATION_NAME = "Uberlândia (MG)"
FIRST_YEAR, LAST_YEAR = 2001, 2024

CROPS = {
    "soy": {"soil": "clay", "sowing": ["10-01", "10-20", "11-10"]},
    "maize_safrinha": {"soil": "loam", "sowing": ["02-01", "02-15", "03-10"]},
}
CLIMATES = {
    "baseline": {"precip_delta_pct": 0, "temp_delta_c": 0, "label": None},
    "dry_warm": {"precip_delta_pct": -20, "temp_delta_c": 1.5, "label": "dry_warm"},
}
IRRIGATION = ["rainfed", "deficit"]
SIZE_WARN_BYTES = 15 * 1024 * 1024


def file_name(crop: str, sowing: str, climate: str, irrigation: str) -> str:
    return f"{crop}_{sowing.replace('-', '')}_{climate}_{irrigation}.json"


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", default=str(API_DIR.parent / "web" / "public" / "demo-pack"))
    ap.add_argument("--cache", default=str(API_DIR / "data" / "cache" / "power"))
    ap.add_argument("--allow-download", action="store_true", help="permite baixar do NASA POWER se faltar cache")
    a = ap.parse_args()

    if os.getenv("GAIAPUS_WEATHER_SOURCE", "nasa_power") != "nasa_power":
        print("ERRO: GAIAPUS_WEATHER_SOURCE não é nasa_power; o demo-pack só aceita dados reais.", file=sys.stderr)
        return 2
    os.environ["GAIAPUS_POWER_CACHE"] = a.cache  # absoluto: independe do cwd

    # Mesma janela que service.get_weather usa para (FIRST_YEAR, LAST_YEAR).
    start, end = date(FIRST_YEAR, 1, 1), date(LAST_YEAR + 1, 12, 31)
    if end >= date.today():
        end = date(date.today().year, date.today().month, 1)
    cache_file = _cache_path(Path(a.cache), LOCATION["lat"], LOCATION["lon"], start, end)
    if not cache_file.exists() and not a.allow_download:
        print(f"ERRO: cache ausente: {cache_file}\n"
              f"Rode: python scripts/fetch_power.py --lat {LOCATION['lat']} --lon {LOCATION['lon']} "
              f"--start {FIRST_YEAR} --end {LAST_YEAR + 1}   (ou use --allow-download)", file=sys.stderr)
        return 2

    out_dir = Path(a.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    entries, total, data_version = [], 0, None

    for crop, spec in CROPS.items():
        for sowing, (clim_key, clim), irrigation in product(spec["sowing"], CLIMATES.items(), IRRIGATION):
            req = SimulationRequest(
                location=LOCATION, crop=crop, sowing_date=sowing, first_year=FIRST_YEAR, last_year=LAST_YEAR,
                soil=spec["soil"], management={"irrigation": irrigation}, climate=clim, economics=None,
                compare_with_baseline=True, compare_irrigation=True, include_daily=True,
            )
            res = simulate(req)
            if not res.get("data_version", "").startswith("nasa_power:"):
                print(f"ERRO: {crop} {sowing}: fonte {res.get('data_version')} não é NASA POWER", file=sys.stderr)
                return 3
            if data_version and res["data_version"] != data_version:
                print("ERRO: data_version mudou no meio da exportação", file=sys.stderr)
                return 3
            data_version = res["data_version"]

            name = file_name(crop, sowing, clim_key, irrigation)
            raw = json.dumps(res, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
            (out_dir / name).write_bytes(raw)
            total += len(raw)
            s = res.get("summary", {})
            entries.append({
                "file": name, "crop": crop, "sowing_date": sowing, "soil": spec["soil"],
                "climate": clim_key, "precip_delta_pct": clim["precip_delta_pct"], "temp_delta_c": clim["temp_delta_c"],
                "irrigation": irrigation, "status": res["status"], "n_seasons": s.get("n_seasons"),
                "yield_p50_kg_ha": s.get("yield_kg_ha", {}).get("p50"),
                "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest(),
            })
            print(f"{name:45s} {res['status']:7s} n={s.get('n_seasons')}  {len(raw) / 1024:7.1f} KB")

    index = {
        "kind": "gaiapus-demo-pack",
        "model_version": MODEL_VERSION,
        "data_version": data_version,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "location": {**LOCATION, "name": LOCATION_NAME},
        "first_year": FIRST_YEAR, "last_year": LAST_YEAR,
        "fixed": {"economics": None, "compare_with_baseline": True, "compare_irrigation": True,
                  "include_daily": True, "reference_yield_kg_ha": None,
                  "management_defaults": {k: v for k, v in Management().model_dump().items() if k != "irrigation"}},
        "grid": {
            "crops": {k: {"soil": v["soil"], "sowing_dates": v["sowing"]} for k, v in CROPS.items()},
            "climates": CLIMATES,
            "irrigation": IRRIGATION,
        },
        "excluded": {"coffee": "status conceitual — disponível só no modo API"},
        "entries": entries,
    }
    (out_dir / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=1) + "\n", encoding="utf-8",
                                        newline="\n")  # LF também no Windows
    print(f"\n{len(entries)} arquivos, total {total / 1024 / 1024:.2f} MB em {out_dir}")
    if total > SIZE_WARN_BYTES:
        print("AVISO: demo-pack acima de ~15 MB; considere reduzir seasons[].totals ou arredondar.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
