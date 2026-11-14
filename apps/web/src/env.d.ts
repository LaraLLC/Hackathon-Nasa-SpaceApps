/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "fixture" → demo-pack pré-calculado (public/demo-pack/) · "api" → simulationApi (VITE_GAIAPUS_API_URL). */
  readonly VITE_DATA_SOURCE?: string;
  /** Base da API FastAPI. Padrão http://127.0.0.1:8000 (ver src/api/simulationApi.ts). */
  readonly VITE_GAIAPUS_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
