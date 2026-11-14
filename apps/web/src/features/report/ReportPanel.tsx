// Relatórios técnico/comercial (PT/EN). Texto vem do reports.py nos dois modos:
// fixture → .md pré-gerado no demo-pack; api → POST /v1/simulations/report.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReportKind, ReportLang } from "../../api/simulation.types";
import { SimulationApiError } from "../../api/simulationApi";
import { ReportNotInPackError, type DataSource, type SimulationResult } from "../../data/dataSource";
import { useI18n } from "../../i18n/context";
import { DICTS } from "../../i18n/dict";
import { PrintCharts } from "./PrintCharts";

type State =
  | { status: "idle" }
  | { status: "loading"; kind: ReportKind; lang: ReportLang }
  | { status: "ready"; kind: ReportKind; lang: ReportLang; md: string }
  | { status: "error"; message: string };

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
  const { t, lang: uiLang } = useI18n();
  const P = t.report;
  const [lang, setLang] = useState<ReportLang>(uiLang);
  const [state, setState] = useState<State>({ status: "idle" });
  const [copied, setCopied] = useState<"ok" | "fail" | null>(null);
  const ctrl = useRef<AbortController | null>(null);
  useEffect(() => () => ctrl.current?.abort(), []);
  const kindLabel = (k: ReportKind) => (k === "technical" ? P.technical : P.commercial);

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
        const msg = e instanceof ReportNotInPackError ? P.not_in_pack
          : e instanceof SimulationApiError ? (e.kind === "network" || e.kind === "timeout" ? P.api_down : e.message)
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
    document.title = `gaiapus-${state.kind}-${state.lang}-${r.crop?.key ?? ""}-${(r.request?.sowing_date ?? "").replace("-", "")}-${r.scenario?.label ?? ""}`;
    window.print();
    document.title = prev;
  };

  const activeKind = state.status === "loading" || state.status === "ready" ? state.kind : null;
  const PL = state.status === "ready" ? DICTS[state.lang] : t;

  return (
    <section aria-labelledby="rep-h" className="report-panel">
      <div className="section-head">
        <h3 id="rep-h" className="section-title">{P.title}</h3>
        <div className="segmented" role="radiogroup" aria-label={P.lang_aria}>
          {(["pt", "en"] as const).map((l) => (
            <button key={l} type="button" role="radio" aria-checked={lang === l}
                    className={`segmented__btn${lang === l ? " is-active" : ""}`} onClick={() => changeLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <p className="hint">
        {P.hint_a}<code>reports.py</code> ({source.kind === "fixture" ? P.hint_fixture : P.hint_api}). {P.hint_b}
      </p>
      <div className="report-actions">
        {(["technical", "commercial"] as const).map((k) => (
          <button key={k} type="button" className={`btn${activeKind === k ? " btn--primary" : ""}`}
                  onClick={() => load(k)} aria-pressed={activeKind === k}>
            {kindLabel(k)}
          </button>
        ))}
        {state.status === "ready" && (
          <>
            <span className="report-actions__sep" aria-hidden="true" />
            <button type="button" className="btn" onClick={async () => setCopied((await copyText(state.md)) ? "ok" : "fail")}>
              {P.copy}
            </button>
            <button type="button" className="btn" onClick={print}>{P.print}</button>
            <span role="status" className="hint">{copied === "ok" ? P.copied : copied === "fail" ? P.copy_failed : ""}</span>
          </>
        )}
      </div>

      {state.status === "loading" && <p className="status status--loading" role="status">{P.generating(kindLabel(state.kind))}</p>}
      {state.status === "error" && <div className="status status--error" role="alert"><h3>{P.unavailable}</h3><p>{state.message}</p></div>}
      {state.status === "ready" && (
        <>
          <article className="report-md" lang={state.lang === "pt" ? "pt-BR" : "en"}>
            <Markdown md={state.md} />
          </article>
          {createPortal(
            <div className="print-root" lang={state.lang === "pt" ? "pt-BR" : "en"}>
              <p className="print-brand">Gaiapus · {state.lang === "pt" ? "Simulador de safra" : "Crop simulator"} · NASA Space Apps Challenge 2026</p>
              <article className="report-md report-md--print"><Markdown md={state.md} /></article>
              <PrintCharts response={result.response} lang={state.lang} phases={PL.phases} />
              <p className="print-ai">{PL.app.ai_notice}</p>
            </div>,
            document.body,
          )}
        </>
      )}
    </section>
  );
}
