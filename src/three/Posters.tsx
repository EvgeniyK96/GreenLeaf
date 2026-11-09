/**
 * Статичные постеры вместо 3D: первый кадр hero, reduced motion, слабые устройства, нет WebGL.
 * Чистый SVG, в основном бандле, без three.js.
 */

const LEAF = 'M0 0C24-18 30-62 0-100C-30-62-24-18 0 0Z'

type L = { x: number; y: number; r: number; s: number; c: string; o?: number }

/** Композиция как у 3D-фона: x и y — проценты экрана (листья по краям, в центре бледные и мелкие). */
const HERO_LEAVES: L[] = [
  { x: 6, y: 14, r: 35, s: 1.1, c: '#2b7a4b' },
  { x: 16, y: 33, r: -50, s: 0.8, c: '#86b726', o: 0.85 },
  { x: 4, y: 53, r: 120, s: 1.2, c: '#4eae36' },
  { x: 14, y: 71, r: -20, s: 0.9, c: '#1f6b3f' },
  { x: 7, y: 90, r: 160, s: 1, c: '#a9d24a' },
  { x: 23, y: 8, r: 80, s: 0.6, c: '#3c9455', o: 0.6 },
  { x: 25, y: 93, r: -110, s: 0.7, c: '#5cbf5a', o: 0.65 },
  { x: 94, y: 12, r: -35, s: 1.15, c: '#4eae36' },
  { x: 84, y: 31, r: 50, s: 0.85, c: '#2b7a4b', o: 0.85 },
  { x: 96, y: 51, r: -120, s: 1.1, c: '#86b726' },
  { x: 86, y: 73, r: 20, s: 0.95, c: '#3c9455' },
  { x: 93, y: 91, r: -160, s: 1, c: '#1f6b3f' },
  { x: 77, y: 6, r: -80, s: 0.6, c: '#a9d24a', o: 0.6 },
  { x: 75, y: 94, r: 110, s: 0.7, c: '#4eae36', o: 0.65 },
  { x: 38, y: 6, r: 30, s: 0.45, c: '#4eae36', o: 0.3 },
  { x: 62, y: 95, r: -40, s: 0.45, c: '#2b7a4b', o: 0.3 },
  { x: 52, y: 3, r: 100, s: 0.4, c: '#86b726', o: 0.28 },
]

function Leaf({ x, y, r, s, c, o = 1 }: L) {
  return (
    <svg x={`${x}%`} y={`${y}%`} width="1" height="1" overflow="visible">
      <g transform={`rotate(${r}) scale(${s})`} opacity={o}>
        <path d={LEAF} fill={c} />
        <path d="M0-3V-94" stroke="#fff" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  )
}

export function HeroPoster({ className }: { className?: string }) {
  return (
    <svg className={className} width="100%" height="100%" aria-hidden="true" focusable="false">
      {HERO_LEAVES.map((l, i) => (
        <Leaf key={i} {...l} />
      ))}
      {[...Array(30)].map((_, i) => (
        <circle key={i} cx={`${(i * 37) % 100}%`} cy={`${(i * 61) % 100}%`} r={2 + (i % 3)} fill="#86b726" opacity=".4" />
      ))}
    </svg>
  )
}

const GROWTH_COLORS = ['#b6dd4c', '#4eae36', '#30a8d7']
const GROWTH_LEAVES: { y: number; side: 1 | -1; g: number; s: number }[] = [
  { y: 470, side: 1, g: 0, s: 1.25 },
  { y: 395, side: -1, g: 1, s: 1 },
  { y: 365, side: 1, g: 1, s: 1 },
  { y: 335, side: -1, g: 1, s: 1 },
  { y: 305, side: 1, g: 1, s: 1 },
  { y: 275, side: -1, g: 1, s: 1 },
  { y: 245, side: 1, g: 1, s: 1 },
  { y: 195, side: -1, g: 2, s: 0.85 },
  { y: 165, side: 1, g: 2, s: 0.85 },
  { y: 135, side: -1, g: 2, s: 0.85 },
  { y: 105, side: 1, g: 2, s: 0.85 },
]

export function GrowthPoster({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 600" aria-hidden="true" focusable="false">
      <ellipse cx="150" cy="566" rx="70" ry="10" fill="#000" opacity=".25" />
      <path d="M150 565C168 470 132 380 152 290S140 140 150 50" fill="none" stroke="#4eae36" strokeWidth="7" strokeLinecap="round" />
      {GROWTH_LEAVES.map((l, i) => (
        <g key={i} transform={`translate(150 ${l.y}) rotate(${l.side * 58}) scale(${l.s * 0.95})`}>
          <path d={LEAF} fill={GROWTH_COLORS[l.g]} />
          <path d="M0-3V-94" stroke="#fff" strokeOpacity=".5" strokeWidth="2" />
        </g>
      ))}
    </svg>
  )
}
