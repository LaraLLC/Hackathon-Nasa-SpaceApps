"""App FastAPI principal do Gaiapus (derivado de main_example.py).

    cd apps/api && uvicorn main:app --reload
    → http://127.0.0.1:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from simulation.router import router as simulation_router

app = FastAPI(title="Gaiapus API")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://localhost:3000"],
                   allow_methods=["*"], allow_headers=["*"])
app.include_router(simulation_router)


@app.get("/health")
def health():
    return {"status": "ok"}
