import { createContext, useContext } from "react";
import { DICTS, type Dict, type Lang } from "./dict";

export interface I18n { lang: Lang; t: Dict; setLang: (l: Lang) => void }

export const I18nContext = createContext<I18n>({ lang: "en", t: DICTS.en, setLang: () => {} });

export function useI18n(): I18n {
  return useContext(I18nContext);
}

const STORAGE_KEY = "gaiapus.lang";

function isLang(v: unknown): v is Lang {
  return v === "pt" || v === "en";
}

/** ?lang= > escolha salva > VITE_DEFAULT_LANG > "en" (padrão do site publicado). */
export function initialLang(): Lang {
  const q = new URLSearchParams(window.location.search).get("lang");
  if (isLang(q)) return q;
  try {
    const s = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(s)) return s;
  } catch { /* storage bloqueado: segue */ }
  const env = import.meta.env.VITE_DEFAULT_LANG;
  return isLang(env) ? env : "en";
}

export function persistLang(l: Lang) {
  try { window.localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
}
