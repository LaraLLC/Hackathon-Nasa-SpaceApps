// Formatação no locale da interface (pt-BR ou en-US). "—" = valor ausente (nunca confundir com zero).
// O locale é definido pelo I18nProvider a cada render (setNumberLocale).

export const KG_PER_BAG = 60; // saca de 60 kg (mesma premissa de apps/api/simulation/reports.py)

let LOCALE = "pt-BR";
const cache = new Map<string, Intl.NumberFormat>();

export function setNumberLocale(locale: string) {
  LOCALE = locale;
}

const nf = (digits: number) => {
  const key = `${LOCALE}|${digits}`;
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits });
    cache.set(key, f);
  }
  return f;
};

export function num(v: number | null | undefined, digits = 0): string {
  return v == null || Number.isNaN(v) ? "—" : nf(digits).format(v);
}

export function signed(v: number | null | undefined, digits = 0): string {
  if (v == null || Number.isNaN(v)) return "—";
  const s = nf(digits).format(Math.abs(v));
  return v > 0 ? `+${s}` : v < 0 ? `−${s}` : s;
}

export function pct(v: number | null | undefined, digits = 0): string {
  return v == null ? "—" : `${nf(digits).format(v * 100)}%`;
}

export function bags(kgHa: number | null | undefined): string {
  return kgHa == null ? "—" : num(kgHa / KG_PER_BAG, 1);
}

export function dateBR(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(LOCALE, { dateStyle: "short", timeStyle: iso.length > 10 ? "short" : undefined });
}

/** "YYYY-MM-DD" → data curta no locale, sem fuso (datas de calendário do motor). */
export function dayBR(isoDay: string): string {
  const [y, m, d] = isoDay.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(LOCALE, { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** "MM-DD" → "20/10" (pt) ou "Oct 20" (en). */
export function sowingLabel(mmdd: string): string {
  const [m, d] = mmdd.split("-").map(Number);
  if (!m || !d) return mmdd;
  return new Date(2001, m - 1, d).toLocaleDateString(LOCALE, LOCALE.startsWith("pt") ? { day: "2-digit", month: "2-digit" } : { month: "short", day: "numeric" });
}

/**
 * Número digitado no locale da interface. Vazio → null; inválido → NaN (a API responde 422).
 * en: vírgula = milhar, ponto = decimal ("4,000.50").
 * pt: vírgula = decimal ("4.000,50"); só pontos → milhar se no padrão 1.234(.567), senão decimal ("120.50").
 */
export function parseLocaleNumber(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  let normalized: string;
  if (LOCALE.startsWith("en")) normalized = t.replace(/,/g, "");
  else if (t.includes(",")) normalized = t.replace(/\./g, "").replace(",", ".");
  else normalized = /^\d{1,3}(\.\d{3})+$/.test(t) ? t.replace(/\./g, "") : t;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : Number.NaN;
}
