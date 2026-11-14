// Formatação pt-BR. "—" = valor ausente (nunca confundir com zero).

export const KG_PER_BAG = 60; // saca de 60 kg (mesma premissa de apps/api/simulation/reports.py)

const nf = (digits: number) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });

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
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: iso.length > 10 ? "short" : undefined });
}

/** "YYYY-MM-DD" → "DD/MM/YYYY" sem fuso (datas de calendário do motor). */
export function dayBR(isoDay: string): string {
  const [y, m, d] = isoDay.split("-");
  return `${d}/${m}/${y}`;
}

/** Aceita "1.234,5" ou "1234.5". Vazio → null. */
export function parseLocaleNumber(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const normalized = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : Number.NaN;
}
