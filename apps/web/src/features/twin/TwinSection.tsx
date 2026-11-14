import { Component, lazy, Suspense, useState, type ReactNode } from "react";
import type { CropKey, DailyState } from "../../api/simulation.types";
import { num } from "../../lib/format";
import { useReducedMotion } from "../../lib/useReducedMotion";
import { DayPanel } from "./DayPanel";
import { TimelineControls } from "./TimelineControls";
import { Twin2D } from "./Twin2D";
import {
  IRRIGATION_COLOR, LEAF_COLORS, LED_COLORS, RAIN_COLOR, SOIL_DRY, SOIL_UNMODELED, SOIL_WET, STRESS_LABELS,
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
  const reduced = useReducedMotion();
  const [webgl] = useState(detectWebGL);
  const [view, setView] = useState<"3d" | "2d">(() => (webgl ? "3d" : "2d"));
  const day = daily.find((d) => d.das === das) ?? daily[0];
  if (!day) return null;
  const maxH = Math.max(...daily.map((d) => d.plant_height_m));
  const twin2d = <Twin2D day={day} maxHeight={maxH} />;
  const label = `Gêmeo digital simulado, safra ${seasonLabel}, DAS ${day.das}: raiz até ${num(day.root_depth_m * 100)} cm com ${num(day.soil_water_fraction * 100)}% da água disponível; plantas de ${num(day.plant_height_m, 2)} m com folhas em ${STRESS_LABELS[day.stress_level]}.`;

  return (
    <div className="twin">
      <div className="twin__toolbar">
        <div className="segmented" role="radiogroup" aria-label="Visualização">
          <button type="button" role="radio" aria-checked={view === "3d"} disabled={!webgl}
                  className={`segmented__btn${view === "3d" ? " is-active" : ""}`} onClick={() => setView("3d")}
                  title={webgl ? undefined : "WebGL indisponível neste navegador"}>3D</button>
          <button type="button" role="radio" aria-checked={view === "2d"}
                  className={`segmented__btn${view === "2d" ? " is-active" : ""}`} onClick={() => setView("2d")}>Corte 2D</button>
        </div>
        {!webgl && <span className="hint">WebGL indisponível: exibindo o corte 2D.</span>}
      </div>

      <div className="twin__body">
        <div className="twin__stage">
          <span className="badge badge--simulated twin__badge">SIMULADO · modelo, não sensor</span>
          {view === "3d" && webgl ? (
            <TwinErrorBoundary fallback={<>{twin2d}<p className="hint">O 3D falhou neste dispositivo; exibindo o corte 2D.</p></>}>
              <Suspense fallback={<div className="twin-canvas twin-canvas--loading" role="status">Carregando gêmeo 3D…</div>}>
                <CropTwin3D crop={crop} day={day} maxHeight={maxH} reducedMotion={reduced} label={label} />
              </Suspense>
            </TwinErrorBoundary>
          ) : twin2d}
        </div>
        <DayPanel day={day} />
      </div>

      <TimelineControls id="das-twin" daily={daily} das={das} onChange={onDasChange} playing={playing}
                        onTogglePlay={onTogglePlay} onUserSeek={onUserSeek} />

      <div className="twin-legend" aria-label="Legenda do gêmeo digital">
        <p className="twin-legend__lead">
          <strong>Tudo nesta cena é simulado</strong> (FAO-56 + clima NASA POWER, safra {seasonLabel}). Não há leitura de estaca real aqui.
          Altura, raiz e copa em escala real (m); a densidade de plantas é ilustrativa.
        </p>
        <ul>
          <li><span className="lg-sw" style={{ background: LEAF_COLORS.none }} />Folhas: sem estresse (Ks = 1)</li>
          <li><span className="lg-sw" style={{ background: LEAF_COLORS.moderate }} />moderado (0,6 ≤ Ks &lt; 1)</li>
          <li><span className="lg-sw" style={{ background: LEAF_COLORS.severe }} />severo (Ks &lt; 0,6)</li>
          <li><span className="lg-sw lg-sw--wide" style={{ background: `linear-gradient(90deg, ${SOIL_DRY}, ${SOIL_WET})` }} />Solo na zona radicular: murcha → capacidade de campo</li>
          <li><span className="lg-sw" style={{ background: SOIL_UNMODELED }} />Abaixo da raiz: fora do balanço (não simulado)</li>
          <li>
            <span className="lg-sw lg-sw--round" style={{ background: LED_COLORS[1] }} />
            <span className="lg-sw lg-sw--round" style={{ background: LED_COLORS[2] }} />
            <span className="lg-sw lg-sw--round" style={{ background: LED_COLORS[3] }} />
            Estaca: LED segue o estresse do <strong>modelo</strong> com os códigos do downlink (1 verde, 2 amarelo, 3 vermelho).
            Os marcadores de 15 e 40 cm mostram a média da zona radicular do modelo, não uma medição por profundidade.
          </li>
          <li><span className="lg-sw lg-sw--round" style={{ background: RAIN_COLOR }} />Chuva · <span className="lg-sw lg-sw--round" style={{ background: IRRIGATION_COLOR }} />irrigação · seta laranja: enxurrada · seta azul: drenagem abaixo da raiz</li>
        </ul>
      </div>
    </div>
  );
}
