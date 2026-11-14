"""Rotas FastAPI do simulador. Incluir no app principal:

    from simulation.router import router as simulation_router
    app.include_router(simulation_router)
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse

from .crops import CROPS
from .reports import build_report
from .schemas import ReportRequest, RotationRequest, SimulationRequest
from .service import MODEL_VERSION, simulate, simulate_rotation
from .soil import SOILS

router = APIRouter(prefix="/v1/simulations", tags=["simulations"])


@router.get("/catalog")
def catalog() -> dict:
    return {
        "model_version": MODEL_VERSION,
        "crops": [{"key": c.key, "name_pt": c.name_pt, "name_en": c.name_en, "status": c.status,
                   "cycle_days": c.cycle_days, "default_reference_yield_kg_ha": c.reference_yield_kg_ha,
                   "assumptions": c.assumptions} for c in CROPS.values()],
        "soils": [{"key": s.key, "name_pt": s.name_pt, "available_water_mm_per_m": s.available_water_mm_per_m}
                  for s in SOILS.values()],
        "irrigation_modes": ["rainfed", "deficit", "full"],
    }


def _run(fn, req):
    try:
        return fn(req)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:  # falha do provedor de clima
        name = type(exc).__name__
        if "HTTP" in name or "Timeout" in name or "Connect" in name:
            raise HTTPException(status_code=503, detail=f"NASA POWER unavailable: {name}") from exc
        raise


@router.post("")
def run_simulation(req: SimulationRequest) -> dict:
    return _run(simulate, req)


@router.post("/rotation")
def run_rotation_simulation(req: RotationRequest) -> dict:
    return _run(simulate_rotation, req)


@router.post("/report", response_class=PlainTextResponse)
def report(req: ReportRequest, lang: str = "pt") -> str:
    return build_report(req.result, req.kind, lang=lang, farm_name=req.farm_name)
