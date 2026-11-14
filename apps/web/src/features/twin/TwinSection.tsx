import { Component, lazy, Suspense, useState, type ReactNode } from "react";
import type { CropKey, DailyState } from "../../api/simulation.types";
import { useI18n } from "../../i18n/context";
import { num } from "../../lib/format";
import { useReducedMotion } from "../../lib/useReducedMotion";
import { DayPanel } from "./DayPanel";
import { TimelineControls } from "./TimelineControls";
import { Twin2D } from "./Twin2D";
import {
  IRRIGATION_COLOR, LEAF_COLORS, LED_COLORS, RAIN_COLOR, SOIL_DRY, SOIL_UNMODELED, SOIL_WET,
} from "./twinModel";

// three / fiber / drei só são baixados quando o 3D é exibido (chunk separado).
const CropTwin3D = lazy(() => import("./CropTwin3D"));

function detectWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

class TwinErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

interface Props {
  crop: CropKey;
  seasonLabel: string;
  daily: DailyState[];
  das: number;
  onDasChange: (das: number) => void;
  playing: boolean;
  onTogglePlay: () => void;
  onUserSeek: () => void;
}

export function TwinSection({ crop, seasonLabel, daily, das, onDasChange, playing, onTogglePlay, onUserSeek }: Props) {
  const { t } = useI18n();
  const T = t.twin;
  const reduced = useReducedMotion();
  const [webgl] = useState(detectWebGL);
  const [view, setView] = useState<"3d" | "2d">(() => (webgl ? "3d" : "2d"));
  const day = daily.find((d) => d.das === das) ?? daily[0];
  if (!day) return null;
  const maxH = Math.max(...daily.map((d) => d.plant_height_m));
  const twin2d = <Twin2D day={day} maxHeight={maxH} />;
  const label = T.aria(seasonLabel, day.das, num(day.root_depth_m * 100), num(day.soil_water_fraction * 100),
                       num(day.plant_height_m, 2), T.stress_label[day.stress_level]);

  return (
    <div className="twin">
      <div className="twin__toolbar">
        <div className="segmented" role="radiogroup" aria-label={T.view_aria}>
          <button type="button" role="radio" aria-checked={view === "3d"} disabled={!webgl}
                  className={`segmented__btn${view === "3d" ? " is-active" : ""}`} onClick={() => setView("3d")}
                  title={webgl ? undefined : T.no_webgl}>3D</button>
          <button type="button" role="radio" aria-checked={view === "2d"}
                  className={`segmented__btn${view === "2d" ? " is-active" : ""}`} onClick={() => setView("2d")}>{T.view_2d}</button>
        </div>
        {!webgl && <span className="hint">{T.no_webgl_hint}</span>}
      </div>

      <div className="twin__body">
        <div className="twin__stage">
          <span className="badge badge--simulated twin__badge">{T.badge}</span>
          {view === "3d" && webgl ? (
            <TwinErrorBoundary fallback={<>{twin2d}<p className="hint">{T.failed}</p></>}>
              <Suspense fallback={<div className="twin-canvas twin-canvas--loading" role="status">{T.loading}</div>}>
                <CropTwin3D crop={crop} day={day} maxHeight={maxH} reducedMotion={reduced} label={label}
                            text={{ model: T.model, root: T.root, heat: T.heat, led: T.led }} />
              </Suspense>
            </TwinErrorBoundary>
          ) : twin2d}
        </div>
        <DayPanel day={day} />
      </div>

      <TimelineControls id="das-twin" daily={daily} das={das} onChange={onDasChange} playing={playing}
                        onTogglePlay={onTogglePlay} onUserSeek={onUserSeek} />

      <div className="twin-legend" aria-label={T.legend_aria}>
        <p className="twin-legend__lead"><strong>{T.legend_lead_b}</strong>{T.legend_lead(seasonLabel)}</p>
        <ul>
          <li><span className="lg-sw" style={{ background: LEAF_COLORS.none }} />{T.lg_none}</li>
          <li><span className="lg-sw" style={{ background: LEAF_COLORS.moderate }} />{T.lg_moderate}</li>
          <li><span className="lg-sw" style={{ background: LEAF_COLORS.severe }} />{T.lg_severe}</li>
          <li><span className="lg-sw lg-sw--wide" style={{ background: `linear-gradient(90deg, ${SOIL_DRY}, ${SOIL_WET})` }} />{T.lg_soil}</li>
          <li><span className="lg-sw" style={{ background: SOIL_UNMODELED }} />{T.lg_below}</li>
          <li>
            <span className="lg-sw lg-sw--round" style={{ background: LED_COLORS[1] }} />
            <span className="lg-sw lg-sw--round" style={{ background: LED_COLORS[2] }} />
            <span className="lg-sw lg-sw--round" style={{ background: LED_COLORS[3] }} />
            {T.lg_probe_a}<strong>{T.lg_probe_b}</strong>{T.lg_probe_c}
          </li>
          <li><span className="lg-sw lg-sw--round" style={{ background: RAIN_COLOR }} />{T.lg_rain} · <span className="lg-sw lg-sw--round" style={{ background: IRRIGATION_COLOR }} />{T.lg_irr} · {T.lg_arrows}</li>
        </ul>
      </div>
    </div>
  );
}
