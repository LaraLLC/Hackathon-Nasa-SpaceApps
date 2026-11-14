// Cliente HTTP do simulador Gaiapus (apps/api/simulation/router.py).
// Tipos: ./simulation.types.ts (cópia de docs/fixtures/simulation.types.ts — editar lá e copiar).
//
// Estados que a UI precisa distinguir (skill frontend-crop-digital-twin):
//   - entrada inválida      → SimulationApiError kind "invalid_input" (HTTP 422)
//   - erro temporário       → kind "unavailable" (HTTP 503, NASA POWER fora), "timeout" ou "network"
//   - sem cobertura/dados   → NÃO é erro: resposta com status "no_data" (use isNoData)
//   - outros                → kind "http" (status inesperado) ou "bad_response" (JSON inválido)

import type {
  CatalogResponse,
  ReportKind,
  ReportLang,
  RotationRequest,
  RotationResponse,
  SimulationRequest,
  SimulationResponse,
} from "./simulation.types";

export type SimulationApiErrorKind =
  | "invalid_input"
  | "unavailable"
  | "timeout"
  | "network"
  | "http"
  | "bad_response";

/** Um item de erro de validação do FastAPI/Pydantic (422). */
export interface ValidationIssue {
  loc: (string | number)[];
  msg: string;
  type?: string;
}

export class SimulationApiError extends Error {
  readonly kind: SimulationApiErrorKind;
  readonly status: number | null;
  /** Erros de validação por campo (422 do Pydantic). Vazio quando o 422 vem de ValueError do motor. */
  readonly issues: ValidationIssue[];
  /** `detail` bruto devolvido pela API, quando houver. */
  readonly detail: unknown;

  constructor(kind: SimulationApiErrorKind, message: string,
              opts: { status?: number | null; issues?: ValidationIssue[]; detail?: unknown; cause?: unknown } = {}) {
    super(message);
    this.name = "SimulationApiError";
    this.kind = kind;
    this.status = opts.status ?? null;
    this.issues = opts.issues ?? [];
    this.detail = opts.detail;
    if (opts.cause !== undefined) (this as { cause?: unknown }).cause = opts.cause;
  }

  /** Erros que fazem sentido oferecer "tentar novamente". */
  get retryable(): boolean {
    return this.kind === "unavailable" || this.kind === "timeout" || this.kind === "network";
  }
}

export interface SimulationApiOptions {
  /** Ex.: "http://127.0.0.1:8000". Padrão: VITE_GAIAPUS_API_URL ou http://127.0.0.1:8000. */
  baseUrl?: string;
  /** Tempo máximo por requisição. A simulação de 24 safras leva < 1 s com cache; sem cache o POWER pode levar dezenas de segundos. */
  timeoutMs?: number;
  /** Injeção para testes. */
  fetchImpl?: typeof fetch;
}

export interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface ReportOptions extends RequestOptions {
  lang?: ReportLang;
  farmName?: string | null;
}

export interface SimulationApi {
  catalog(opts?: RequestOptions): Promise<CatalogResponse>;
  simulate(req: SimulationRequest, opts?: RequestOptions): Promise<SimulationResponse>;
  rotation(req: RotationRequest, opts?: RequestOptions): Promise<RotationResponse>;
  /** Retorna Markdown (o frontend converte para PDF). */
  report(kind: ReportKind, result: SimulationResponse, opts?: ReportOptions): Promise<string>;
}

const DEFAULT_TIMEOUT_MS = 90_000;

function defaultBaseUrl(): string {
  // Lido sem depender dos tipos do Vite (vite/client) para o arquivo compilar isolado.
  const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  return env?.VITE_GAIAPUS_API_URL ?? "http://127.0.0.1:8000";
}

/** true quando a API respondeu, mas não há safra completa no período (estado "sem cobertura"). */
export function isNoData(res: { status: string }): boolean {
  return res.status === "no_data";
}

function isValidationIssueList(v: unknown): v is ValidationIssue[] {
  return Array.isArray(v) && v.every((x) => typeof x === "object" && x !== null && "msg" in x && "loc" in x);
}

/** Junta o signal do chamador com um timeout, sem depender de AbortSignal.any/timeout. */
function withTimeout(signal: AbortSignal | undefined, ms: number): { signal: AbortSignal; cleanup: () => void; timedOut: () => boolean } {
  const ctrl = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; ctrl.abort(); }, ms);
  const onAbort = () => ctrl.abort();
  if (signal) {
    if (signal.aborted) ctrl.abort();
    else signal.addEventListener("abort", onAbort, { once: true });
  }
  return {
    signal: ctrl.signal,
    timedOut: () => timedOut,
    cleanup: () => { clearTimeout(timer); signal?.removeEventListener("abort", onAbort); },
  };
}

async function errorFromResponse(res: Response): Promise<SimulationApiError> {
  let detail: unknown;
  try {
    const body: unknown = await res.json();
    detail = typeof body === "object" && body !== null && "detail" in body ? (body as { detail: unknown }).detail : body;
  } catch {
    detail = undefined;
  }
  if (res.status === 422) {
    const issues = isValidationIssueList(detail) ? detail : [];
    const msg = issues.length
      ? issues.map((i) => {
          // loc ["body"] = erro do model_validator (não é de um campo específico)
          const field = i.loc.filter((p) => p !== "body").join(".");
          return field ? `${field}: ${i.msg}` : i.msg;
        }).join("; ")
      : typeof detail === "string" ? detail : "Entrada inválida";
    return new SimulationApiError("invalid_input", msg, { status: 422, issues, detail });
  }
  if (res.status === 503) {
    const msg = typeof detail === "string" ? detail : "NASA POWER indisponível";
    return new SimulationApiError("unavailable", msg, { status: 503, detail });
  }
  return new SimulationApiError("http", `HTTP ${res.status}`, { status: res.status, detail });
}

export function createSimulationApi(options: SimulationApiOptions = {}): SimulationApi {
  const baseUrl = (options.baseUrl ?? defaultBaseUrl()).replace(/\/+$/, "");
  const doFetch = options.fetchImpl ?? ((...args: Parameters<typeof fetch>) => fetch(...args));
  const defaultTimeout = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  async function request(path: string, init: RequestInit, opts: RequestOptions = {}): Promise<Response> {
    const t = withTimeout(opts.signal, opts.timeoutMs ?? defaultTimeout);
    try {
      const res = await doFetch(`${baseUrl}${path}`, { ...init, signal: t.signal });
      if (!res.ok) throw await errorFromResponse(res);
      return res;
    } catch (err) {
      if (err instanceof SimulationApiError) throw err;
      if (t.timedOut()) throw new SimulationApiError("timeout", "Tempo de resposta esgotado", { cause: err });
      // Cancelamento pelo chamador: repassa o AbortError original (a UI normalmente ignora).
      if (opts.signal?.aborted) throw err;
      throw new SimulationApiError("network", "Falha de rede ao acessar a API Gaiapus", { cause: err });
    } finally {
      t.cleanup();
    }
  }

  async function json<T>(path: string, init: RequestInit, opts?: RequestOptions): Promise<T> {
    const res = await request(path, init, opts);
    try {
      return (await res.json()) as T;
    } catch (err) {
      throw new SimulationApiError("bad_response", "Resposta da API não é JSON válido", { status: res.status, cause: err });
    }
  }

  const post = (body: unknown): RequestInit => ({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return {
    catalog: (opts) => json<CatalogResponse>("/v1/simulations/catalog", { method: "GET" }, opts),

    simulate: (req, opts) => json<SimulationResponse>("/v1/simulations", post(req), opts),

    rotation: (req, opts) => json<RotationResponse>("/v1/simulations/rotation", post(req), opts),

    async report(kind, result, opts = {}) {
      const lang = opts.lang ?? "pt";
      const res = await request(
        `/v1/simulations/report?lang=${encodeURIComponent(lang)}`,
        post({ kind, result, farm_name: opts.farmName ?? null }),
        opts,
      );
      return res.text();
    },
  };
}

/** Instância padrão (baseUrl de VITE_GAIAPUS_API_URL). */
export const simulationApi: SimulationApi = createSimulationApi();
