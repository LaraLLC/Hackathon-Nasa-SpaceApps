"""Baixa e cacheia NASA POWER para os pontos de demonstração (rodar na máquina com internet).

    cd apps/api
    python scripts/fetch_power.py --lat -18.92 --lon -48.28 --start 2001 --end 2025

O JSON fica em data/cache/power/ e a API passa a funcionar offline para esse ponto/período.
Atenção: a API usa (first_year .. last_year+1); baixe com --end um ano além do último ano de safra.
"""
import argparse
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from simulation.weather import fetch_nasa_power  # noqa: E402

p = argparse.ArgumentParser()
p.add_argument("--lat", type=float, required=True)
p.add_argument("--lon", type=float, required=True)
p.add_argument("--start", type=int, default=2001)
p.add_argument("--end", type=int, default=2025)
p.add_argument("--cache", default="data/cache/power")
a = p.parse_args()

end = date(a.end, 12, 31)
if end >= date.today():
    t = date.today()
    end = date(t.year, t.month, 1)
s = fetch_nasa_power(a.lat, a.lon, date(a.start, 1, 1), end, cache_dir=a.cache)
print(f"OK: {len(s.days)} dias, {s.first_day}..{s.last_day}, elevação {s.elevation_m} m, fonte {s.source}")
