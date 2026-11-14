// Gêmeo digital 3D (carregado sob demanda via React.lazy). Tudo aqui é estado SIMULADO do motor.
// Performance: frameloop "demand", InstancedMesh (≤ 400 plantas), sem sombras, Lambert + flatShading.
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import type { CropKey, DailyState } from "../../api/simulation.types";
import {
  BLOCK, canopyRadius, IRRIGATION_COLOR, LAYOUT, LEAF_COLORS, LED_COLORS, LED_FROM_STRESS, mulberry32, plantSlots,
  PROBE_DEPTHS_M, RAIN_COLOR, rainParticles, SOIL_UNMODELED, soilColor,
} from "./twinModel";

const FRONT_Z = BLOCK.depth / 2;
const tmp = new THREE.Object3D();
const tmpColor = new THREE.Color();

function SoilBlock({ rootDepth, water }: { rootDepth: number; water: number }) {
  const rd = Math.min(rootDepth, BLOCK.soilDepth - 0.01);
  const below = BLOCK.soilDepth - rd;
  return (
    <group>
      <mesh position={[0, -rd / 2, 0]}>
        <boxGeometry args={[BLOCK.width, rd, BLOCK.depth]} />
        <meshLambertMaterial color={soilColor(water)} flatShading />
      </mesh>
      <mesh position={[0, -rd - below / 2, 0]}>
        <boxGeometry args={[BLOCK.width, below, BLOCK.depth]} />
        <meshLambertMaterial color={SOIL_UNMODELED} flatShading />
      </mesh>
      {/* limite da zona radicular no corte */}
      <mesh position={[0, -rd, FRONT_Z + 0.004]}>
        <boxGeometry args={[BLOCK.width, 0.012, 0.004]} />
        <meshBasicMaterial color="#f5efe0" />
      </mesh>
    </group>
  );
}

function usePlantGeometries(shape: "bush" | "grass" | "shrub") {
  return useMemo(() => {
    const stem = new THREE.CylinderGeometry(shape === "grass" ? 0.012 : 0.007, shape === "grass" ? 0.02 : 0.011, 1, 5);
    const canopy = shape === "bush" ? new THREE.IcosahedronGeometry(1, 0) : new THREE.ConeGeometry(1, 1, shape === "grass" ? 5 : 7);
    return { stem, canopy };
  }, [shape]);
}

function Plants({ crop, day }: { crop: CropKey; day: DailyState }) {
  const slots = useMemo(() => plantSlots(crop), [crop]);
  const shape = LAYOUT[crop].shape;
  const { stem, canopy } = usePlantGeometries(shape);
  const stems = useRef<THREE.InstancedMesh>(null);
  const leaves = useRef<THREE.InstancedMesh>(null);
  const invalidate = useThree((s) => s.invalidate);

  useLayoutEffect(() => {
    const s = stems.current;
    const l = leaves.current;
    if (!s || !l) return;
    const base = new THREE.Color(LEAF_COLORS[day.stress_level]);
    const r0 = canopyRadius(crop, day.canopy_cover);
    slots.forEach((p, i) => {
      const h = day.plant_height_m * p.size;
      const r = r0 * p.size;
      const visible = h > 0.01;
      // Caule até o meio da copa (não atravessa a folhagem).
      const stemH = h * (shape === "grass" ? 0.9 : 0.7);
      tmp.rotation.set(0, p.rotY, 0);
      tmp.position.set(p.x, stemH / 2, p.z);
      tmp.scale.set(1, visible ? stemH : 0, 1);
      tmp.updateMatrix();
      s.setMatrixAt(i, tmp.matrix);
      // Copa da soja um pouco menor que a entrelinha (legibilidade: plantas individuais, estaca visível).
      if (shape === "bush") { tmp.position.set(p.x, h * 0.62, p.z); tmp.scale.set(r * 0.72, Math.max(h * 0.36, r * 0.45), r * 0.72); }
      else if (shape === "grass") { tmp.position.set(p.x, h * 0.55, p.z); tmp.scale.set(r * 0.7, h * 0.75, r * 0.7); }
      else { tmp.position.set(p.x, h * 0.5, p.z); tmp.scale.set(r, h * 0.9, r); }
      if (!visible || r < 0.005) tmp.scale.set(0, 0, 0);
      tmp.updateMatrix();
      l.setMatrixAt(i, tmp.matrix);
      // Variação só de luminosidade (±6%): a cor continua lendo como o mesmo nível de estresse.
      tmpColor.copy(base).multiplyScalar(0.94 + ((i * 37) % 13) / 100);
      l.setColorAt(i, tmpColor);
    });
    s.instanceMatrix.needsUpdate = true;
    l.instanceMatrix.needsUpdate = true;
    if (l.instanceColor) l.instanceColor.needsUpdate = true;
    invalidate();
  }, [day, crop, slots, shape, invalidate]);

  return (
    <group>
      <instancedMesh ref={stems} args={[stem, undefined, slots.length]} frustumCulled={false}>
        <meshLambertMaterial color="#6b8e3a" flatShading />
      </instancedMesh>
      <instancedMesh ref={leaves} name="leaves" args={[canopy, undefined, slots.length]} frustumCulled={false}>
        <meshLambertMaterial flatShading />
      </instancedMesh>
    </group>
  );
}

function Roots({ crop, rootDepth }: { crop: CropKey; rootDepth: number }) {
  const front = useMemo(() => plantSlots(crop).filter((p) => p.frontRow), [crop]);
  const ref = useRef<THREE.InstancedMesh>(null);
  const geom = useMemo(() => new THREE.ConeGeometry(1, 1, 4).rotateX(Math.PI), []);
  const invalidate = useThree((s) => s.invalidate);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    front.forEach((p, i) => {
      const d = rootDepth * (0.85 + (p.size - 0.88) * 0.6);
      tmp.rotation.set(0, 0, 0);
      tmp.position.set(p.x, -d / 2, FRONT_Z + 0.006);
      tmp.scale.set(0.014, d, 0.002);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    invalidate();
  }, [front, rootDepth, invalidate]);
  return (
    <instancedMesh ref={ref} args={[geom, undefined, front.length]} frustumCulled={false}>
      <meshBasicMaterial color="#efe3c4" />
    </instancedMesh>
  );
}

const PROBE_X = BLOCK.width / 2 - 0.35;
const PROBE_Z = FRONT_Z + 0.03;
const RULER_X = -BLOCK.width / 2 - 0.12;

function Probe({ day }: { day: DailyState }) {
  const led = LED_FROM_STRESS[day.stress_level];
  return (
    <group position={[PROBE_X, 0, PROBE_Z]}>
      <mesh position={[0, -0.075, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.75, 8]} />
        <meshLambertMaterial color="#d8d6cf" />
      </mesh>
      {PROBE_DEPTHS_M.map((d) => (
        <mesh key={d} position={[0, -d, 0]}>
          <cylinderGeometry args={[0.026, 0.026, 0.035, 10]} />
          <meshLambertMaterial color="#b98d2c" />
        </mesh>
      ))}
      <mesh position={[0, 0.33, 0]}>
        <sphereGeometry args={[0.038, 12, 8]} />
        <meshBasicMaterial color={LED_COLORS[led]} />
      </mesh>
      <mesh position={[0, 0.33, 0]}>
        <sphereGeometry args={[0.07, 12, 8]} />
        <meshBasicMaterial color={LED_COLORS[led]} transparent opacity={0.25} depthWrite={false} />
      </mesh>
    </group>
  );
}

const RULER_TICKS = [0, 0.15, 0.4, 1.0, 1.5];

function DepthRuler() {
  return (
    <group position={[RULER_X, 0, FRONT_Z + 0.01]}>
      <mesh position={[0.06, -BLOCK.soilDepth / 2, 0]}>
        <boxGeometry args={[0.006, BLOCK.soilDepth, 0.006]} /><meshBasicMaterial color="#6b675e" />
      </mesh>
      {RULER_TICKS.map((d) => (
        <mesh key={d} position={[0.03, -d, 0]}><boxGeometry args={[0.07, 0.008, 0.008]} /><meshBasicMaterial color="#6b675e" /></mesh>
      ))}
    </group>
  );
}

// ---- Rótulos: camada HTML própria sobre o canvas (sem drei <Html>, que cria uma raiz React por rótulo
// e gera erros de desmontagem no StrictMode do React 19). Posição = projeção do ponto 3D a cada quadro renderizado.
interface Label { id: string; pos: [number, number, number]; text: ReactNode; cls: string }

/** Textos da cena (vêm do i18n via props: este módulo é um chunk lazy separado). */
export interface SceneText { model: string; root: string; heat: string; led: string }

function sceneLabels(day: DailyState, tx: SceneText): Label[] {
  const pct = Math.round(day.soil_water_fraction * 100);
  return [
    ...RULER_TICKS.filter((d) => d > 0).map((d) => ({ id: `r${d}`, pos: [RULER_X, -d, FRONT_Z + 0.01] as [number, number, number],
                                 text: `${Math.round(d * 100)} cm`, cls: "twin-label--ruler" })),
    // Rótulos da estaca à ESQUERDA dela (a estaca fica na borda direita; à direita seriam cortados no celular).
    ...PROBE_DEPTHS_M.map((d) => ({ id: `p${d}`, pos: [PROBE_X - 0.05, -d, PROBE_Z] as [number, number, number],
                                    text: <>{Math.round(d * 100)} cm · {pct}% <em>{tx.model}</em></>, cls: "twin-label--probe" })),
    { id: "led", pos: [PROBE_X - 0.08, 0.33, PROBE_Z], text: <>{tx.led} <em>{tx.model}</em></>, cls: "twin-label--probe" },
    { id: "root", pos: [-1.2, -day.root_depth_m, FRONT_Z + 0.01], text: `${tx.root} ${Math.round(day.root_depth_m * 100)} cm`,
      cls: "twin-label--root" },
    ...(day.heat_stress ? [{ id: "heat", pos: [0, Math.max(0.6, day.plant_height_m + 0.35), 0] as [number, number, number],
                             text: tx.heat, cls: "twin-label--heat" }] : []),
  ];
}

function LabelProjector({ labels, refs }: { labels: Label[]; refs: RefObject<Map<string, HTMLDivElement>> }) {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    for (const l of labels) {
      const el = refs.current.get(l.id);
      if (!el) continue;
      v.set(...l.pos).project(camera);
      el.style.transform = `translate(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px)`;
      el.style.visibility = v.z < 1 ? "visible" : "hidden";
    }
  });
  return null;
}

function Particles({ count, color, ymin, ymax, speed, reduced, size }: {
  count: number; color: string; ymin: number; ymax: number; speed: number; reduced: boolean; size: number;
}) {
  const ref = useRef<THREE.Points>(null);
  const invalidate = useThree((s) => s.invalidate);
  const positions = useMemo(() => {
    const rnd = mulberry32(count * 7919 + Math.round(ymax * 100));
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (rnd() - 0.5) * BLOCK.width;
      a[i * 3 + 1] = ymin + rnd() * (ymax - ymin);
      a[i * 3 + 2] = (rnd() - 0.5) * BLOCK.depth;
    }
    return a;
  }, [count, ymin, ymax]);
  useFrame((_, dt) => {
    if (reduced || !ref.current || count === 0) return;
    const attr = ref.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = attr.getY(i) - speed * Math.min(dt, 0.05);
      if (y < ymin) y = ymax;
      attr.setY(i, y);
    }
    attr.needsUpdate = true;
    invalidate();
  });
  if (count === 0) return null;
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={size} sizeAttenuation transparent opacity={0.85} depthWrite={false} />
    </points>
  );
}

function Arrow({ from, dir, length, color, width }: { from: [number, number, number]; dir: [number, number, number]; length: number; color: string; width: number }) {
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...dir).normalize()), [dir]);
  return (
    <group position={from} quaternion={q}>
      <mesh position={[0, length * 0.4, 0]}><cylinderGeometry args={[width, width, length * 0.8, 6]} /><meshBasicMaterial color={color} /></mesh>
      <mesh position={[0, length * 0.9, 0]}><coneGeometry args={[width * 2.6, length * 0.25, 6]} /><meshBasicMaterial color={color} /></mesh>
    </group>
  );
}

const RIGHT: [number, number, number] = [1, 0, 0];
const DOWN: [number, number, number] = [0, -1, 0];

function Scene({ crop, day, reduced }: { crop: CropKey; day: DailyState; reduced: boolean }) {
  const rain = rainParticles(day.precip_mm);
  const irr = day.irrigation_mm > 0.2 ? Math.min(160, Math.round(30 + day.irrigation_mm * 6)) : 0;
  const ro = day.runoff_mm;
  const dp = day.deep_percolation_mm;
  return (
    <>
      <hemisphereLight args={["#ffffff", "#806040", 1.1]} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <SoilBlock rootDepth={day.root_depth_m} water={day.soil_water_fraction} />
      <Roots crop={crop} rootDepth={day.root_depth_m} />
      <Plants crop={crop} day={day} />
      <Probe day={day} />
      <DepthRuler />
      <Particles count={rain} color={RAIN_COLOR} ymin={0.05} ymax={2.6} speed={3.2} reduced={reduced} size={0.055} />
      <Particles count={irr} color={IRRIGATION_COLOR} ymin={0.0} ymax={0.22} speed={0.35} reduced={reduced} size={0.04} />
      {ro > 0.05 && (
        <Arrow from={[-1.2, 0.04, FRONT_Z + 0.08]} dir={RIGHT} length={1.2 + Math.min(1.2, ro / 15)} color="#c27a2c"
               width={0.012 + Math.min(0.03, ro / 600)} />
      )}
      {dp > 0.05 && (
        <Arrow from={[-0.6, -day.root_depth_m - 0.02, FRONT_Z + 0.02]} dir={DOWN} length={0.18 + Math.min(0.3, dp / 60)}
               color="#3d8bd6" width={0.012 + Math.min(0.03, dp / 600)} />
      )}
    </>
  );
}

declare global {
  interface Window {
    __gaiapusTwin?: {
      info: () => { calls: number; triangles: number; points: number };
      frames: number;
      /** Cor real da instância 0 das folhas no buffer da GPU (hex) — para testes. */
      leaf: () => string | null;
    };
  }
}

/** Só em DEV: expõe métricas do renderer e a cor das folhas para testes automatizados. */
function DevProbe() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useFrame(() => {
    if (window.__gaiapusTwin) window.__gaiapusTwin.frames++;
  });
  useLayoutEffect(() => {
    if (!import.meta.env.DEV) return;
    window.__gaiapusTwin = {
      frames: 0,
      info: () => ({ ...gl.info.render }),
      leaf: () => {
        const m = scene.getObjectByName("leaves") as THREE.InstancedMesh | undefined;
        if (!m?.instanceColor) return null;
        const c = new THREE.Color();
        m.getColorAt(0, c);
        return `#${c.getHexString()}`;
      },
    };
    return () => { delete window.__gaiapusTwin; };
  }, [gl, scene]);
  return null;
}

/** Enquadra do fundo do bloco (−1,5 m) ao topo da cultura na safra (soja 0,9 m; milho 2,2 m). Escala real mantida. */
function cameraFor(maxHeight: number, aspect = 1.7) {
  const top = Math.max(1, maxHeight) + 0.2;
  const centerY = (top - BLOCK.soilDepth) / 2;
  const span = top + BLOCK.soilDepth;
  // soja (span 2,7 m) num canvas ~1,7:1 = enquadramento de referência; canvas estreito (celular) → afasta.
  const k = (span / 2.7) * Math.max(1, 1.55 / aspect);
  return { position: [3.4 * k, centerY + 2.05 * k, 4.4 * k] as [number, number, number], target: [0, centerY, 0] as [number, number, number] };
}

function CameraRig({ maxHeight }: { maxHeight: number }) {
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const narrow = aspect < 1.55;
  useLayoutEffect(() => {
    const c = cameraFor(maxHeight, aspect);
    camera.position.set(...c.position);
    camera.lookAt(...c.target);
    invalidate();
    // reenquadra só ao mudar de cultura ou cruzar o limite estreito/largo (não a cada pixel de resize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxHeight, narrow, camera, invalidate]);
  return null;
}

export interface CropTwin3DProps {
  crop: CropKey; day: DailyState; maxHeight: number; reducedMotion: boolean; label: string; text: SceneText;
}

// DEV: ?twinbench força renderização contínua para medir FPS (em produção é sempre "demand").
const BENCH = import.meta.env.DEV && new URLSearchParams(window.location.search).has("twinbench");

export default function CropTwin3D({ crop, day, maxHeight, reducedMotion, label, text }: CropTwin3DProps) {
  const { model, root, heat, led } = text;
  const labels = useMemo(() => sceneLabels(day, { model, root, heat, led }), [day, model, root, heat, led]);
  const refs = useRef(new Map<string, HTMLDivElement>());
  const cam = cameraFor(maxHeight);
  return (
    <div className="twin-canvas" role="img" aria-label={label}>
      <Canvas frameloop={BENCH ? "always" : "demand"} dpr={[1, 1.75]} camera={{ position: cam.position, fov: 38 }}
              gl={{ antialias: true, powerPreference: "high-performance" }}>
        <CameraRig maxHeight={maxHeight} />
        <Scene crop={crop} day={day} reduced={reducedMotion} />
        <LabelProjector labels={labels} refs={refs} />
        <OrbitControls target={cam.target} enablePan={false} minDistance={3} maxDistance={12}
                       minPolarAngle={0.35} maxPolarAngle={1.5} />
        {import.meta.env.DEV && <DevProbe />}
      </Canvas>
      <div className="twin-overlay" aria-hidden="true">
        {labels.map((l) => (
          <div key={l.id} className="twin-label-anchor"
               ref={(el) => { if (el) refs.current.set(l.id, el); else refs.current.delete(l.id); }}>
            <span className={`twin-label ${l.cls}`}>{l.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
