import type { ReactNode } from "react";
import type { CatalogResponse, CropKey, SoilKey } from "../../api/simulation.types";
import type { DataSourceKind, DemoPackIndex } from "../../data/dataSource";
import { num, signed } from "../../lib/format";
import { PLACES } from "../../lib/places";
import { FIRST_YEAR, LAST_YEAR, withCrop, type FieldKey, type FormState } from "./formState";
import { CLIMATE_PRESETS, CROP_OPTIONS, SOIL_LABELS, type ClimatePresetKey } from "./labels";

interface Props {
  mode: DataSourceKind;
  grid: DemoPackIndex | null;
  catalog: CatalogResponse | null;
  form: FormState;
  onChange: (f: FormState) => void;
  onSubmit: () => void;
  fieldErrors: Partial<Record<FieldKey, string>>;
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

export function SimulationForm({ mode, grid, catalog, form, onChange, onSubmit, fieldErrors: fe, loading }: Props) {
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => onChange({ ...form, [k]: v });
  const fixture = mode === "fixture";
  const gridCrop = grid?.grid.crops[form.crop];
  const cropStatus = (key: CropKey) =>
    catalog?.crops.find((c) => c.key === key)?.status ?? CROP_OPTIONS.find((c) => c.key === key)!.status;
  const soilLabel = (key: SoilKey) => catalog?.soils.find((s) => s.key === key)?.name_pt ?? SOIL_LABELS[key];

  return (
    <form className="sim-form" noValidate onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
          aria-label="Parâmetros da simulação">
      <div className="field">
        <label htmlFor="f-location">Município</label>
        <select id="f-location" value={form.placeIbge} onChange={(e) => set("placeIbge", e.target.value)}
                {...errProps("f-location", fe.location)}>
          {PLACES.map((p) => <option key={p.ibge} value={p.ibge}>{p.name} · IBGE {p.ibge}</option>)}
        </select>
        <Hint>Clima do NASA POWER no ponto {num(PLACES[0].lat, 2)}, {num(PLACES[0].lon, 2)} (~0,5°): representa a região, não o talhão.</Hint>
        <FieldError id="f-location" msg={fe.location} />
      </div>

      <fieldset className="field" {...errProps("f-crop", fe.crop)}>
        <legend>Cultura</legend>
        <div className="choice-row">
          {CROP_OPTIONS.map((c) => {
            const conceptual = cropStatus(c.key) === "conceptual";
            const notInPack = fixture && !grid?.grid.crops[c.key];
            return (
              <label key={c.key} className={`choice${notInPack ? " choice--disabled" : ""}`}>
                <input type="radio" name="crop" value={c.key} checked={form.crop === c.key} disabled={notInPack}
                       onChange={() => onChange(withCrop(form, c.key))} />
                <span>{c.label}</span>
                {conceptual && <span className="badge badge--conceptual">conceitual</span>}
              </label>
            );
          })}
        </div>
        {fixture && <Hint>Café não está no demo-pack: só no modo API, sempre com o selo “conceitual”.</Hint>}
        {cropStatus(form.crop) === "conceptual" && (
          <p className="callout callout--conceptual" role="note">
            <strong>Cenário conceitual.</strong> Esta cultura não tem modelo validado no Gaiapus; os números ilustram o método, não uma estimativa.
          </p>
        )}
        <FieldError id="f-crop" msg={fe.crop} />
      </fieldset>

      <div className="field">
        <label htmlFor="f-sowing_date">Data de semeadura <span className="muted">(repetida em cada ano)</span></label>
        {fixture && gridCrop ? (
          <select id="f-sowing_date" value={form.sowingDate} onChange={(e) => set("sowingDate", e.target.value)}>
            {gridCrop.sowing_dates.map((d) => <option key={d} value={d}>{d.split("-").reverse().join("/")}</option>)}
          </select>
        ) : (
          <>
            <input id="f-sowing_date" type="text" inputMode="numeric" placeholder="MM-DD" list="sow-suggestions"
                   value={form.sowingDate} onChange={(e) => set("sowingDate", e.target.value)}
                   {...errProps("f-sowing_date", fe.sowing_date)} />
            <datalist id="sow-suggestions">{SOW_SUGGESTIONS.map((d) => <option key={d} value={d} />)}</datalist>
            <Hint>Formato mês-dia, ex.: 10-20 = 20 de outubro.</Hint>
          </>
        )}
        <FieldError id="f-sowing_date" msg={fe.sowing_date} />
      </div>

      <div className="field">
        <label htmlFor="f-soil">Solo</label>
        <select id="f-soil" value={form.soil} onChange={(e) => set("soil", e.target.value as SoilKey)}
                {...errProps("f-soil", fe.soil)}>
          {(Object.keys(SOIL_LABELS) as SoilKey[]).map((k) => (
            <option key={k} value={k}>
              {soilLabel(k)}{fixture && gridCrop && gridCrop.soil !== k ? " — não pré-calculado" : ""}
            </option>
          ))}
        </select>
        <Hint>Classe de solo é premissa (FAO-56, valores centrais), não análise do talhão.</Hint>
        <FieldError id="f-soil" msg={fe.soil} />
      </div>

      <fieldset className="field" {...errProps("f-irrigation", fe.irrigation)}>
        <legend>Irrigação</legend>
        <div className="choice-row">
          {(["rainfed", "deficit"] as const).map((k) => (
            <label key={k} className="choice">
              <input type="radio" name="irrigation" value={k} checked={form.irrigation === k}
                     onChange={() => set("irrigation", k)} />
              <span>{k === "rainfed" ? "Sequeiro" : "Deficitária"}</span>
            </label>
          ))}
        </div>
        <Hint>Deficitária: repõe a lâmina quando a depleção atinge a água facilmente disponível (RAW), eficiência 85%.</Hint>
        <FieldError id="f-irrigation" msg={fe.irrigation} />
      </fieldset>

      <fieldset className="field">
        <legend>Clima</legend>
        {fixture ? (
          <div className="choice-col">
            {(Object.keys(CLIMATE_PRESETS) as ClimatePresetKey[]).map((k) => (
              <label key={k} className="choice">
                <input type="radio" name="climate" value={k} checked={form.climatePreset === k}
                       onChange={() => set("climatePreset", k)} />
                <span>{CLIMATE_PRESETS[k].label}</span>
              </label>
            ))}
            <Hint>No modo fixture só estes dois cenários foram pré-calculados. Ajuste livre de Δchuva/ΔT: modo API.</Hint>
          </div>
        ) : (
          <>
            <div className="slider">
              <label htmlFor="f-precip_delta_pct">Δ chuva</label>
              <input id="f-precip_delta_pct" type="range" min={-50} max={30} step={5} value={form.precipDeltaPct}
                     onChange={(e) => set("precipDeltaPct", Number(e.target.value))}
                     aria-valuetext={`${form.precipDeltaPct}%`} {...errProps("f-precip_delta_pct", fe.precip_delta_pct)} />
              <output htmlFor="f-precip_delta_pct">{signed(form.precipDeltaPct)}%</output>
            </div>
            <FieldError id="f-precip_delta_pct" msg={fe.precip_delta_pct} />
            <div className="slider">
              <label htmlFor="f-temp_delta_c">Δ temperatura</label>
              <input id="f-temp_delta_c" type="range" min={0} max={3} step={0.5} value={form.tempDeltaC}
                     onChange={(e) => set("tempDeltaC", Number(e.target.value))}
                     aria-valuetext={`mais ${form.tempDeltaC} graus`} {...errProps("f-temp_delta_c", fe.temp_delta_c)} />
              <output htmlFor="f-temp_delta_c">+{num(form.tempDeltaC, 1)} °C</output>
            </div>
            <FieldError id="f-temp_delta_c" msg={fe.temp_delta_c} />
            <Hint>Teste de sensibilidade sobre o histórico (delta change), não projeção climática.</Hint>
          </>
        )}
      </fieldset>

      <fieldset className="field" disabled={fixture}>
        <legend>Preço e custo <span className="muted">(opcional)</span></legend>
        {fixture && <Hint>O demo-pack foi gerado sem preço/custo; resultado econômico só no modo API.</Hint>}
        <div className="grid-2">
          <div>
            <label htmlFor="f-price_per_bag">Preço (R$/saca 60 kg)</label>
            <input id="f-price_per_bag" type="text" inputMode="decimal" value={form.price}
                   onChange={(e) => set("price", e.target.value)} {...errProps("f-price_per_bag", fe.price_per_bag)} />
            <FieldError id="f-price_per_bag" msg={fe.price_per_bag} />
          </div>
          <div>
            <label htmlFor="f-cost_per_ha">Custo (R$/ha)</label>
            <input id="f-cost_per_ha" type="text" inputMode="decimal" value={form.cost}
                   onChange={(e) => set("cost", e.target.value)} {...errProps("f-cost_per_ha", fe.cost_per_ha)} />
            <FieldError id="f-cost_per_ha" msg={fe.cost_per_ha} />
          </div>
          <div>
            <label htmlFor="f-price_source">Fonte do preço</label>
            <input id="f-price_source" type="text" placeholder="ex.: CEPEA, dd/mm/aaaa" value={form.priceSource}
                   onChange={(e) => set("priceSource", e.target.value)} />
          </div>
          <div>
            <label htmlFor="f-cost_source">Fonte do custo</label>
            <input id="f-cost_source" type="text" placeholder="ex.: CONAB, safra 25/26" value={form.costSource}
                   onChange={(e) => set("costSource", e.target.value)} />
          </div>
        </div>
      </fieldset>

      <p className="hint">Safras {FIRST_YEAR}–{LAST_YEAR} · mesma decisão rodada em cada ano do histórico.</p>
      <button type="submit" className="btn btn--primary" disabled={loading} aria-busy={loading}>
        {loading ? "Simulando…" : "Simular"}
      </button>
    </form>
  );
}
