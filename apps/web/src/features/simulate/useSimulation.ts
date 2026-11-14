import { useCallback, useEffect, useRef, useState } from "react";
import { SimulationApiError } from "../../api/simulationApi";
import type { SimulationRequest } from "../../api/simulation.types";
import { ScenarioNotPrecomputedError, type DataSource, type SimulationResult } from "../../data/dataSource";
import { fieldFromLoc, type FieldKey } from "./formState";

/** Estados obrigatórios (skill frontend-crop-digital-twin): loading, ready, no coverage, incomplete, erro, inválido. */
export type SimError =
  | { kind: "invalid_input"; fields: Partial<Record<FieldKey, string>>; general: string[] }
  | { kind: "unavailable"; message: string }
  | { kind: "unreachable"; message: string; timeout: boolean }
  | { kind: "not_precomputed"; reasons: string[] }
  | { kind: "other"; message: string };

export interface SimState {
  loading: boolean;
  /** Último resultado bem-sucedido. Mantido (esmaecido) só DURANTE um novo carregamento; some se ele falhar. */
  result: SimulationResult | null;
  /** true enquanto o resultado exibido é da requisição anterior à que está carregando. */
  stale: boolean;
  error: SimError | null;
}

/** Mensagens do Pydantic v2 em pt-BR, pelo `type` (estável); fallback = mensagem original. */
export function ptMessage(i: { type?: string; msg: string; ctx?: Record<string, unknown> }, field: FieldKey | null): string {
  const c = i.ctx ?? {};
  switch (i.type) {
    case "missing": return "Campo obrigatório.";
    case "string_pattern_mismatch":
      return field === "sowing_date" ? "Use o formato MM-DD (ex.: 10-20 para 20 de outubro)." : "Formato inválido.";
    case "float_type": case "float_parsing": case "int_type": case "int_parsing":
      return "Informe um número (ex.: 120 ou 120,50).";
    case "greater_than": return `Deve ser maior que ${String(c.gt)}.`;
    case "greater_than_equal": return `Deve ser maior ou igual a ${String(c.ge)}.`;
    case "less_than_equal": return `Deve ser menor ou igual a ${String(c.le)}.`;
    case "literal_error": return "Opção não disponível.";
    default: return i.msg.replace(/^Value error, /, "");
  }
}

export function toSimError(e: unknown): SimError {
  if (e instanceof ScenarioNotPrecomputedError) return { kind: "not_precomputed", reasons: e.reasons };
  if (e instanceof SimulationApiError) {
    switch (e.kind) {
      case "invalid_input": {
        const fields: Partial<Record<FieldKey, string>> = {};
        const general: string[] = [];
        for (const i of e.issues) {
          const f = fieldFromLoc(i.loc);
          const msg = ptMessage(i, f);
          if (f) fields[f] = fields[f] ? `${fields[f]}; ${msg}` : msg;
          else general.push(msg);
        }
        if (!e.issues.length) general.push(e.message);
        return { kind: "invalid_input", fields, general };
      }
      case "unavailable":
        return { kind: "unavailable", message: e.message };
      case "timeout":
      case "network":
        return { kind: "unreachable", message: e.message, timeout: e.kind === "timeout" };
      default:
        return { kind: "other", message: `${e.message}${e.status ? ` (HTTP ${e.status})` : ""}` };
    }
  }
  return { kind: "other", message: e instanceof Error ? e.message : String(e) };
}

export function useSimulation(source: DataSource | null) {
  const [state, setState] = useState<SimState>({ loading: false, result: null, stale: false, error: null });
  const ctrlRef = useRef<AbortController | null>(null);

  const run = useCallback((req: SimulationRequest) => {
    if (!source) return;
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    setState((s) => ({ ...s, loading: true, stale: s.result !== null, error: null }));
    source.simulate(req, ctrl.signal).then(
      (result) => { if (!ctrl.signal.aborted) setState({ loading: false, result, stale: false, error: null }); },
      (e: unknown) => {
        if (ctrl.signal.aborted) return;
        // Não mantém o resultado anterior: exibi-lo junto do erro seria mostrar OUTRO cenário em silêncio.
        setState({ loading: false, result: null, stale: false, error: toSimError(e) });
      },
    );
  }, [source]);

  useEffect(() => () => ctrlRef.current?.abort(), []);
  return { state, run };
}
