import type { MismatchReason } from "../../data/dataSource";
import type { Dict } from "../../i18n/dict";
import { signed } from "../../lib/format";

/** Motivo estruturado de "não pré-calculado" → texto no idioma da interface. */
export function reasonText(r: MismatchReason, t: Dict): string {
  const R = t.reasons;
  switch (r.code) {
    case "crop": return R.crop(t.crops[r.crop]);
    case "crop_conceptual": return R.crop_conceptual(t.crops[r.crop]);
    case "irrigation": return R.irrigation(t.irrigation[r.irrigation]);
    case "climate": return R.climate(signed(r.dp), signed(r.dt, 1));
    case "soil": return R.soil(t.soils[r.soil], t.soils[r.expected]);
    case "sowing": return R.sowing(r.sowing, r.options.join(", "));
    default: return R[r.code];
  }
}
