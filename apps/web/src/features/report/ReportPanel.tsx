// Relatórios técnico/comercial (PT/EN). Texto vem do reports.py nos dois modos:
// fixture → .md pré-gerado no demo-pack; api → POST /v1/simulations/report.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReportKind, ReportLang } from "../../api/simulation.types";
import { SimulationApiError } from "../../api/simulationApi";
import type { DataSource, SimulationResult } from "../../data/dataSource";
import { PrintCharts } from "./PrintCharts";

type State =
  | { status: "idle" }
  | { status: "loading"; kind: ReportKind; lang: ReportLang }
  | { status: "ready"; kind: ReportKind; lang: ReportLang; md: string }
  | { status: "error"; message: string };

const KIND_LABEL: Record<ReportKind, string> = { technical: "Relatório técnico", commercial: "Relatório comercial" };

function Markdown({ md }: { md: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}
                   components={{ a: ({ node: _node, ...p }) => <a {...p} target="_blank" rel="noreferrer" /> }}>
      {md}
    </ReactMarkdown>
  );
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback (http sem permissão de clipboard): textarea + execCommand.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function ReportPanel({ source, result }: { source: DataSource; result: SimulationResult }) {
  const [lang, setLang] = useState<ReportLang>("pt");
  const [state, setState] = useState<State>({ status: "idle" });
  const [copied, setCopied] = useState<"ok" | "fail" | null>(null);
  const ctrl = useRef<AbortController | null>(null);
  useEffect(() => () => ctrl.current?.abort(), []);

  const load = (kind: ReportKind, l: ReportLang = lang) => {
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    setCopied(null);
    setState({ status: "loading", kind, lang: l });
    source.report(result, kind, l, c.signal).then(
      (md) => { if (!c.signal.aborted) setState({ status: "ready", kind, lang: l, md }); },
      (e: unknown) => {
        if (c.signal.aborted) return;
        const msg = e instanceof SimulationApiError
          ? (e.kind === "network" || e.kind === "timeout" ? "A API não respondeu." : e.message)
          : e instanceof Error ? e.message : String(e);
        setState({ status: "error", message: msg });
      },
    );
  };

  const changeLang = (l: ReportLang) => {
    setLang(l);
    if (state.status === "ready" || state.status === "loading") load(state.kind, l);
  };

  const print = () => {
    if (state.status !== "ready") return;
    const r = result.response;
    const prev = document.title;
    // Título vira o nome sugerido do PDF no "Salvar como PDF".
    document.title = `gaiapus-${state.kind === "technical" ? "tecnico" : "comercial"}-${state.lang}-${r.crop?.key ?? ""}-${(r.request?.sowing_date ?? "").replace("-", "")}-${r.scenario?.label ?? ""}`;
    window.print();
    document.title = prev;
  };

  return (
    <section aria-labelledby="rep-h" className="report-panel">
      <div className="section-head">
        <h3 id="rep-h" className="section-title">Relatórios</h3>
        <div className="segmented" role="radiogroup" aria-label="Idioma do relatório">
          {(["pt", "en"] as const).map((l) => (
            <button key={l} type="button" role="radio" aria-checked={lang === l}
                    className={`segmented__btn${lang === l ? " is-active" : ""}`} onClick={() => changeLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <p className="hint">
        Mesmo texto nos dois modos: gerado pelo <code>reports.py</code> ({source.kind === "fixture" ? "pré-gerado no demo-pack" : "via /v1/simulations/report"}).
        Técnico: métodos, premissas e tabelas completas. Comercial: sacas, risco e água em linguagem direta.
      </p>
      <div className="report-actions">
        {(["technical", "commercial"] as const).map((k) => (
          <button key={k} type="button" className={`btn${state.status !== "idle" && "kind" in state && state.kind === k ? " btn--primary" : ""}`}
                  onClick={() => load(k)} aria-pressed={state.status !== "idle" && "kind" in state && state.kind === k}>
            {KIND_LABEL[k]}
          </button>
        ))}
        {state.status === "ready" && (
          <>
            <span className="report-actions__sep" aria-hidden="true" />
            <button type="button" className="btn" onClick={async () => setCopied((await copyText(state.md)) ? "ok" : "fail")}>
              Copiar Markdown
            </button>
            <button type="button" className="btn" onClick={print}>Imprimir / Salvar PDF</button>
            <span role="status" className="hint">{copied === "ok" ? "Copiado." : copied === "fail" ? "Não foi possível copiar." : ""}</span>
          </>
        )}
      </div>

      {state.status === "loading" && <p className="status status--loading" role="status">Gerando {KIND_LABEL[state.kind].toLowerCase()}…</p>}
      {state.status === "error" && <div className="status status--error" role="alert"><h3>Relatório indisponível</h3><p>{state.message}</p></div>}
      {state.status === "ready" && (
        <>
          <article className="report-md" lang={state.lang === "pt" ? "pt-BR" : "en"}>
            <Markdown md={state.md} />
          </article>
          {createPortal(
            <div className="print-root" lang={state.lang === "pt" ? "pt-BR" : "en"}>
              <p className="print-brand">Gaiapus · {state.lang === "pt" ? "Simulador de safra" : "Crop simulator"} · NASA Space Apps Challenge 2026</p>
              <article className="report-md report-md--print"><Markdown md={state.md} /></article>
              <PrintCharts response={result.response} lang={state.lang} />
            </div>,
            document.body,
          )}
        </>
      )}
    </section>
  );
}
