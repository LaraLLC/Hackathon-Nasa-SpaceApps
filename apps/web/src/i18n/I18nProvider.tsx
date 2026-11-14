import { useEffect, useMemo, useState, type ReactNode } from "react";
import { setNumberLocale } from "../lib/format";
import { I18nContext, initialLang, persistLang } from "./context";
import { DICTS, type Lang } from "./dict";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  // Locale dos números/datas antes de renderizar os filhos (format.ts é usado em todo lugar).
  setNumberLocale(DICTS[lang].locale);
  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  }, [lang]);
  const value = useMemo(() => ({
    lang,
    t: DICTS[lang],
    setLang: (l: Lang) => { persistLang(l); setLangState(l); },
  }), [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
