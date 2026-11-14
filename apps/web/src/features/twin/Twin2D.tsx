// Corte 2D (SVG): fallback sem WebGL e alternativa acessível ao 3D. Mesmos mapeamentos da spec §4.
import type { DailyState } from "../../api/simulation.types";
import { num } from "../../lib/format";
import { BLOCK, LEAF_COLORS, LED_COLORS, LED_FROM_STRESS, PROBE_DEPTHS_M, SOIL_UNMODELED, soilColor } from "./twinModel";

export function Twin2D({ day, maxHeight }: { day: DailyState; maxHeight: number }) {
  // Escala real: 1 m = S px nos dois eixos (sem exagero vertical).
  const S = 120;
  const above = Math.max(1, maxHeight) + 0.3;
  const W = 520;
  const H = (above + BLOCK.soilDepth) * S + 10;
  const y0 = above * S; // superfície
  const rd = day.root_depth_m * S;
  const h = day.plant_height_m * S;
  const led = LED_FROM_STRESS[day.stress_level];
  const xs = Array.from({ length: 9 }, (_, i) => 70 + i * 45);
  return (
    <svg className="twin-2d" viewBox={`0 0 ${W} ${H}`} role="img"
         aria-label={`Corte 2D: raiz até ${num(day.root_depth_m * 100)} cm, água ${num(day.soil_water_fraction * 100)}% da CAD, plantas com ${num(day.plant_height_m, 2)} m.`}>
      <rect x={50} y={y0} width={W - 100} height={rd} fill={soilColor(day.soil_water_fraction)} />
      <rect x={50} y={y0 + rd} width={W - 100} height={BLOCK.soilDepth * S - rd} fill={SOIL_UNMODELED} />
      <line x1={50} x2={W - 50} y1={y0 + rd} y2={y0 + rd} stroke="#f5efe0" strokeWidth={2} />
      {xs.map((x) => (
        <g key={x}>
          <line x1={x} x2={x} y1={y0} y2={y0 + rd * 0.9} stroke="#efe3c4" strokeWidth={2} />
          {h > 1 && <line x1={x} x2={x} y1={y0} y2={y0 - h} stroke="#6b8e3a" strokeWidth={3} />}
          {h > 1 && <ellipse cx={x} cy={y0 - h * 0.65} rx={Math.max(3, 22 * Math.sqrt(day.canopy_cover))} ry={Math.max(3, h * 0.35)}
                             fill={LEAF_COLORS[day.stress_level]} />}
        </g>
      ))}
      {[0, 0.15, 0.4, 1, 1.5].map((d) => (
        <g key={d}>
          <line x1={40} x2={50} y1={y0 + d * S} y2={y0 + d * S} stroke="currentColor" />
          <text x={36} y={y0 + d * S + 4} textAnchor="end" fontSize={11} fill="currentColor">{Math.round(d * 100)} cm</text>
        </g>
      ))}
      <g transform={`translate(${W - 80},0)`}>
        <rect x={-3} y={y0 - 36} width={6} height={36 + 0.45 * S} fill="#d8d6cf" />
        {PROBE_DEPTHS_M.map((d) => <rect key={d} x={-6} y={y0 + d * S - 4} width={12} height={8} fill="#b98d2c" />)}
        <circle cx={0} cy={y0 - 40} r={7} fill={LED_COLORS[led]} stroke="#0b0b0b" strokeWidth={1} />
      </g>
      <text x={W - 50} y={y0 + rd + 14} textAnchor="end" fontSize={11} fill="#f5efe0">raiz {num(day.root_depth_m * 100)} cm</text>
    </svg>
  );
}
