import type { ReactNode } from "react";
import type { ValidationIssue } from "../../api/simulationApi";
import type { CatalogResponse, CropKey, SoilKey } from "../../api/simulation.types";
import type { DataSourceKind, DemoPackIndex } from "../../data/dataSource";
import { useI18n } from "../../i18n/context";
import { num, signed, sowingLabel } from "../../lib/format";
import { PLACES } from "../../lib/places";
import { FIRST_YEAR, LAST_YEAR, withCrop, type FieldKey, type FormState } from "./formState";
import { CLIMATE_PRESETS, CROP_OPTIONS, SOIL_KEYS, type ClimatePresetKey } from "./labels";
import { issueText } from "./useSimulation";

interface Props {
  mode: DataSourceKind;
  grid: DemoPackIndex | null;
  catalog: CatalogResponse | null;
  form: FormState;
  onChange: (f: FormState) => void;
  onSubmit: () => void;
  fieldErrors: Partial<Record<FieldKey, ValidationIssue[]>>;
  loading: boolean;
}

const SOW_SUGGESTIONS = ["09-15", "10-01", "10-15", "10-20", "11-01", "11-10", "01-20", "02-01", "02-15", "03-01", "03-10"];

function FieldError({ id, msg }: { id: string; msg?: string }) {
  return msg ? <p className="field-error" id={`${id}-err`} role="alert">{msg}</p> : null;
}

function errProps(id: string, msg?: string) {
  return msg ? { "aria-invalid": true as const, "aria-describedby": `${id}-err` } : {};
}

function Hint({ children }: { children: ReactNode }) {
  return <p className="hint">{children}</p>;
}

export function SimulationForm({ mode, grid, catalog, form, onChange, onSubmit, fieldErrors, loading }: Props) {
  const { t } = useI18n();
  const F = t.form;
  const fe = Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) =>
    [k, (v ?? []).map((i) => issueText(i, k as FieldKey, t)).join("; ")])) as Partial<Record<FieldKey, string>>;
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => onChange({ ...form, [k]: v });
  const fixture = mode === "fixture";
  const gridCrop = grid?.grid.crops[form.crop];
  const cropStatus = (key: CropKey) =>
    catalog?.crops.find((c) => c.key === key)?.status ?? CROP_OPTIONS.find((c) => c.key === key)!.status;

  return (
    <form className="sim-form" noValidate onSubmit={(e) => { e.preventDefault(); onSubmit(); }} aria-label={F.aria}>
      <div className="field">
        <label htmlFor="f-location">{F.municipality}</label>
        <select id="f-location" value={form.placeIbge} onChange={(e) => set("placeIbge", e.target.value)}
                {...errProps("f-location", fe.location)}>
          {PLACES.map((p) => <option key={p.ibge} value={p.ibge}>{p.name} · IBGE {p.ibge}</option>)}
        </select>
        <Hint>{F.municipality_hint(num(PLACES[0].lat, 2), num(PLACES[0].lon, 2))}</Hint>
        <FieldError id="f-location" msg={fe.location} />
      </div>

      <fieldset className="field" {...errProps("f-crop", fe.crop)}>
        <legend>{F.crop}</legend>
        <div className="choice-row">
          {CROP_OPTIONS.map((c) => {
            const conceptual = cropStatus(c.key) === "conceptual";
            const notInPack = fixture && !grid?.grid.crops[c.key];
            return (
              <label key={c.key} className={`choice${notInPack ? " choice--disabled" : ""}`}>
                <input type="radio" name="crop" value={c.key} checked={form.crop === c.key} disabled={notInPack}
                       onChange={() => onChange(withCrop(form, c.key))} />
                <span>{t.crops[c.key]}</span>
                {conceptual && <span className="badge badge--conceptual">{t.crop_status.conceptual}</span>}
              </label>
            );
          })}
        </div>
        {fixture && <Hint>{F.coffee_fixture_hint}</Hint>}
        {cropStatus(form.crop) === "conceptual" && (
          <p className="callout callout--conceptual" role="note">
            <strong>{F.conceptual_title}</strong> {F.conceptual_body}
          </p>
        )}
        <FieldError id="f-crop" msg={fe.crop} />
      </fieldset>

      <div className="field">
        <label htmlFor="f-sowing_date">{F.sowing} <span className="muted">{F.sowing_note}</span></label>
        {fixture && gridCrop ? (
          <select id="f-sowing_date" value={form.sowingDate} onChange={(e) => set("sowingDate", e.target.value)}>
            {gridCrop.sowing_dates.map((d) => <option key={d} value={d}>{sowingLabel(d)}</option>)}
          </select>
        ) : (
          <>
            <input id="f-sowing_date" type="text" inputMode="numeric" placeholder="MM-DD" list="sow-suggestions"
                   value={form.sowingDate} onChange={(e) => set("sowingDate", e.target.value)}
                   {...errProps("f-sowing_date", fe.sowing_date)} />
            <datalist id="sow-suggestions">{SOW_SUGGESTIONS.map((d) => <option key={d} value={d} />)}</datalist>
            <Hint>{F.sowing_hint}</Hint>
          </>
        )}
        <FieldError id="f-sowing_date" msg={fe.sowing_date} />
      </div>

      <div className="field">
        <label htmlFor="f-soil">{F.soil}</label>
        <select id="f-soil" value={form.soil} onChange={(e) => set("soil", e.target.value as SoilKey)}
                {...errProps("f-soil", fe.soil)}>
          {SOIL_KEYS.map((k) => (
            <option key={k} value={k}>
              {t.soils[k]}{fixture && gridCrop && gridCrop.soil !== k ? F.not_precomputed : ""}
            </option>
          ))}
        </select>
        <Hint>{F.soil_hint}</Hint>
        <FieldError id="f-soil" msg={fe.soil} />
      </div>

      <fieldset className="field" {...errProps("f-irrigation", fe.irrigation)}>
        <legend>{F.irrigation}</legend>
        <div className="choice-row">
          {(["rainfed", "deficit"] as const).map((k) => (
            <label key={k} className="choice">
              <input type="radio" name="irrigation" value={k} checked={form.irrigation === k}
                     onChange={() => set("irrigation", k)} />
              <span>{t.irrigation_short[k]}</span>
            </label>
          ))}
        </div>
        <Hint>{F.irrigation_hint}</Hint>
        <FieldError id="f-irrigation" msg={fe.irrigation} />
      </fieldset>

      <fieldset className="field">
        <legend>{F.climate}</legend>
        {fixture ? (
          <div className="choice-col">
            {(Object.keys(CLIMATE_PRESETS) as ClimatePresetKey[]).map((k) => (
              <label key={k} className="choice">
                <input type="radio" name="climate" value={k} checked={form.climatePreset === k}
                       onChange={() => set("climatePreset", k)} />
                <span>{t.climate_presets[k]}</span>
              </label>
            ))}
            <Hint>{F.climate_fixture_hint}</Hint>
          </div>
        ) : (
          <>
            <div className="slider">
              <label htmlFor="f-precip_delta_pct">{F.d_rain}</label>
              <input id="f-precip_delta_pct" type="range" min={-50} max={30} step={5} value={form.precipDeltaPct}
                     onChange={(e) => set("precipDeltaPct", Number(e.target.value))}
                     aria-valuetext={`${signed(form.precipDeltaPct)}%`} {...errProps("f-precip_delta_pct", fe.precip_delta_pct)} />
              <output htmlFor="f-precip_delta_pct">{signed(form.precipDeltaPct)}%</output>
            </div>
            <FieldError id="f-precip_delta_pct" msg={fe.precip_delta_pct} />
            <div className="slider">
              <label htmlFor="f-temp_delta_c">{F.d_temp}</label>
              <input id="f-temp_delta_c" type="range" min={0} max={3} step={0.5} value={form.tempDeltaC}
                     onChange={(e) => set("tempDeltaC", Number(e.target.value))}
                     aria-valuetext={F.d_temp_valuetext(num(form.tempDeltaC, 1))} {...errProps("f-temp_delta_c", fe.temp_delta_c)} />
              <output htmlFor="f-temp_delta_c">+{num(form.tempDeltaC, 1)} °C</output>
            </div>
            <FieldError id="f-temp_delta_c" msg={fe.temp_delta_c} />
            <Hint>{F.climate_api_hint}</Hint>
          </>
        )}
      </fieldset>

      <fieldset className="field" disabled={fixture}>
        <legend>{F.economics} <span className="muted">{F.optional}</span></legend>
        {fixture && <Hint>{F.economics_fixture_hint}</Hint>}
        <div className="grid-2">
          <div>
            <label htmlFor="f-price_per_bag">{F.price}</label>
            <input id="f-price_per_bag" type="text" inputMode="decimal" value={form.price}
                   onChange={(e) => set("price", e.target.value)} {...errProps("f-price_per_bag", fe.price_per_bag)} />
            <FieldError id="f-price_per_bag" msg={fe.price_per_bag} />
          </div>
          <div>
            <label htmlFor="f-cost_per_ha">{F.cost}</label>
            <input id="f-cost_per_ha" type="text" inputMode="decimal" value={form.cost}
                   onChange={(e) => set("cost", e.target.value)} {...errProps("f-cost_per_ha", fe.cost_per_ha)} />
            <FieldError id="f-cost_per_ha" msg={fe.cost_per_ha} />
          </div>
          <div>
            <label htmlFor="f-price_source">{F.price_source}</label>
            <input id="f-price_source" type="text" placeholder={F.price_source_ph} value={form.priceSource}
                   onChange={(e) => set("priceSource", e.target.value)} />
          </div>
          <div>
            <label htmlFor="f-cost_source">{F.cost_source}</label>
            <input id="f-cost_source" type="text" placeholder={F.cost_source_ph} value={form.costSource}
                   onChange={(e) => set("costSource", e.target.value)} />
          </div>
        </div>
      </fieldset>

      <p className="hint">{F.period(FIRST_YEAR, LAST_YEAR)}</p>
      <button type="submit" className="btn btn--primary" disabled={loading} aria-busy={loading}>
        {loading ? F.submitting : F.submit}
      </button>
    </form>
  );
}
