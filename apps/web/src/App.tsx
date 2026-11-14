import { Link, Navigate, NavLink, Route, Routes } from "react-router-dom";
import { SimulatePage } from "./features/simulate/SimulatePage";
import { useI18n } from "./i18n/context";

function LangSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="segmented segmented--sm lang-switch" role="radiogroup" aria-label={t.app.lang_label}>
      {(["en", "pt"] as const).map((l) => (
        <button key={l} type="button" role="radio" aria-checked={lang === l} lang={l === "pt" ? "pt-BR" : "en"}
                className={`segmented__btn${lang === l ? " is-active" : ""}`} onClick={() => setLang(l)}>
          {l === "en" ? "EN" : "PT"}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const { t } = useI18n();
  return (
    <div className="app">
      <header className="app-header">
        <Link className="brand" to="/simular">Gaiapus</Link>
        <nav aria-label="Gaiapus">
          <NavLink to="/simular" className={({ isActive }) => `tab${isActive ? " is-active" : ""}`}>{t.app.nav_simulate}</NavLink>
        </nav>
        <LangSwitch />
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/simular" replace />} />
          <Route path="/simular" element={<SimulatePage />} />
          <Route path="*" element={<Navigate to="/simular" replace />} />
        </Routes>
      </main>
    </div>
  );
}
