import type { DataSource } from "../../data/dataSource";
import type { SimError } from "./useSimulation";

const FIELD_NAMES: Record<string, string> = {
  crop: "Cultura", sowing_date: "Data de semeadura", soil: "Solo", irrigation: "Irrigação",
  precip_delta_pct: "Δ chuva", temp_delta_c: "Δ temperatura", price_per_bag: "Preço", cost_per_ha: "Custo",
  price_source: "Fonte do preço", cost_source: "Fonte do custo", location: "Município",
};

export function StatusMessage({ error, source, onRetry }: { error: SimError; source: DataSource; onRetry: () => void }) {
  switch (error.kind) {
    case "invalid_input":
      return (
        <div className="status status--invalid" role="alert">
          <h3>Entrada inválida</h3>
          <ul>
            {Object.entries(error.fields).map(([f, m]) => (
              <li key={f}><a href={`#f-${f}`}>{FIELD_NAMES[f] ?? f}</a>: {m}</li>
            ))}
            {error.general.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </div>
      );
    case "unavailable":
      return (
        <div className="status status--error" role="alert">
          <h3>NASA POWER indisponível</h3>
          <p>A API não conseguiu obter o clima ({error.message}). Isso costuma ser temporário. Nada foi calculado.</p>
          <button type="button" className="btn" onClick={onRetry}>Tentar de novo</button>
        </div>
      );
    case "unreachable":
      return (
        <div className="status status--error" role="alert">
          <h3>{error.timeout ? "A API demorou demais" : "API Gaiapus não respondeu"}</h3>
          <p>Fonte: <code>{source.describe()}</code>. Verifique se ela está rodando
            (<code>cd apps/api &amp;&amp; uvicorn main:app</code>) ou use <code>VITE_DATA_SOURCE=fixture</code>.</p>
          <button type="button" className="btn" onClick={onRetry}>Tentar de novo</button>
        </div>
      );
    case "not_precomputed":
      return (
        <div className="status status--info" role="status">
          <h3>Cenário não pré-calculado — disponível no modo API</h3>
          <p>O modo fixture só tem as combinações do demo-pack. Fora da grade:</p>
          <ul>{error.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
          <p className="hint">Nenhum outro cenário é exibido no lugar deste.</p>
        </div>
      );
    default:
      return (
        <div className="status status--error" role="alert">
          <h3>Erro inesperado</h3>
          <p>{error.message}</p>
          <button type="button" className="btn" onClick={onRetry}>Tentar de novo</button>
        </div>
      );
  }
}
