import { useCallback, useEffect, useRef, useState } from "react";
import { SimulationApiError, type ValidationIssue } from "../../api/simulationApi";
import type { SimulationRequest } from "../../api/simulation.types";
import { ScenarioNotPrecomputedError, type DataSource, type MismatchReason, type SimulationResult } from "../../data/dataSource";
import type { Dict } from "../../i18n/dict";
import { fieldFromLoc, type FieldKey } from "./formState";

/** Estados obrigatórios (skill frontend-crop-digital-twin): loading, ready, no coverage, incomplete, erro, inválido.
 *  Guarda dados crus (issues, reasons); o texto é traduzido na hora de exibir. */
export type SimError =
  | { kind: "invalid_input"; fields: Partial<Record<FieldKey, ValidationIssue[]>>; general: (ValidationIssue | string)[] }
  | { kind: "unavailable"; message: string }
  | { kind: "unreachable"; message: string; timeout: boolean }
  | { kind: "not_precomputed"; reasons: MismatchReason[] }
  | { kind: "other"; message: string };

export interface SimState {
  loading: boolean;
  /** Último resultado bem-sucedido. Mantido (esmaecido) só DURANTE um novo carregamento; some se ele falhar. */
  result: SimulationResult | null;
  /** true enquanto o resultado exibido é da requisição anterior à que está carregando. */
  stale: boolean;
  error: SimError | null;
}

/** Mensagem do Pydantic v2 no idioma da interface, pelo `type` (estável); fallback = mensagem original. */
export function issueText(i: ValidationIssue | string, field: FieldKey | null, t: Dict): string {
  if (typeof i === "string") return i;
  const c = i.ctx ?? {};
  const v = t.validation;
  switch (i.type) {
    case "missing": return v.missing;
    case "string_pattern_mismatch": return field === "sowing_date" ? v.sowing : v.pattern;
    case "float_type": case "float_parsing": case "int_type": case "int_parsing": return v.number;
    case "greater_than": return v.gt(String(c.gt));
    case "greater_than_equal": return v.ge(String(c.ge));
    case "less_than_equal": return v.le(String(c.le));
    case "literal_error": return v.literal;
    default: return i.msg.replace(/^Value error, /, "");
  }
}

export function toSimError(e: unknown): SimError {
  if (e instanceof ScenarioNotPrecomputedError) return { kind: "not_precomputed", reasons: e.reasons };
  if (e instanceof SimulationApiError) {
    switch (e.kind) {
      case "invalid_input": {
        const fields: Partial<Record<FieldKey, ValidationIssue[]>> = {};
        const general: (ValidationIssue | string)[] = [];
        for (const i of e.issues) {
          const f = fieldFromLoc(i.loc);
          if (f) (fields[f] ??= []).push(i);
          else general.push(i);
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
