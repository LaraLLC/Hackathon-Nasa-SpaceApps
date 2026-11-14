import type { DataSource } from "../../data/dataSource";
import { useI18n } from "../../i18n/context";
import type { FieldKey } from "./formState";
import { reasonText } from "./messages";
import { issueText, type SimError } from "./useSimulation";

export function StatusMessage({ error, source, onRetry }: { error: SimError; source: DataSource; onRetry: () => void }) {
  const { t } = useI18n();
  const E = t.errors;
  switch (error.kind) {
    case "invalid_input":
      return (
        <div className="status status--invalid" role="alert">
          <h3>{E.invalid_title}</h3>
          <ul>
            {(Object.entries(error.fields) as [FieldKey, NonNullable<(typeof error.fields)[FieldKey]>][]).map(([f, issues]) => (
              <li key={f}><a href={`#f-${f}`}>{t.fields[f] ?? f}</a>: {issues.map((i) => issueText(i, f, t)).join("; ")}</li>
            ))}
            {error.general.map((m, i) => <li key={i}>{issueText(m, null, t)}</li>)}
          </ul>
        </div>
      );
    case "unavailable":
      return (
        <div className="status status--error" role="alert">
          <h3>{E.unavailable_title}</h3>
          <p>{E.unavailable_body(error.message)}</p>
          <button type="button" className="btn" onClick={onRetry}>{E.retry}</button>
        </div>
      );
    case "unreachable":
      return (
        <div className="status status--error" role="alert">
          <h3>{error.timeout ? E.timeout_title : E.unreachable_title}</h3>
          <p><code>{source.describe()}</code> — {E.unreachable_body}</p>
          <button type="button" className="btn" onClick={onRetry}>{E.retry}</button>
        </div>
      );
    case "not_precomputed":
      return (
        <div className="status status--info" role="status">
          <h3>{E.not_precomputed_title}</h3>
          <p>{E.not_precomputed_body}</p>
          <ul>{error.reasons.map((r, i) => <li key={i}>{reasonText(r, t)}</li>)}</ul>
          <p className="hint">{E.not_precomputed_note}</p>
        </div>
      );
    default:
      return (
        <div className="status status--error" role="alert">
          <h3>{E.unexpected}</h3>
          <p>{error.message}</p>
          <button type="button" className="btn" onClick={onRetry}>{E.retry}</button>
        </div>
      );
  }
}
