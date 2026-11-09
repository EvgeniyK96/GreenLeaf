/**
 * Статичные постеры вместо 3D: первый кадр hero, reduced motion, слабые устройства, нет WebGL.
 * Чистый SVG, в основном бандле, без three.js.
 */

const LEAF = 'M0 0C24-18 30-62 0-100C-30-62-24-18 0 0Z'

type L = { x: number; y: number; r: number; s: number; c: string; o?: number }

const HERO_LEAVES: L[] = [
  { x: 905, y: 120, r: 35, s: 1.5, c: '#2b7a4b' },
  { x: 760, y: 70, r: -40, s: 1.05, c: '#86b726' },
  { x: 850, y: 300, r: 120, s: 1.25, c: '#4eae36' },
  { x: 680, y: 210, r: 75, s: 0.8, c: '#3c9455', o: 0.75 },
  { x: 965, y: 420, r: -150, s: 1.1, c: '#a9d24a' },
  { x: 720, y: 430, r: 15, s: 1.35, c: '#1f6b3f' },
  { x: 610, y: 90, r: 160, s: 0.65, c: '#5cbf5a', o: 0.7 },
  { x: 840, y: 560, r: 60, s: 0.9, c: '#4eae36', o: 0.85 },
  { x: 990, y: 230, r: -70, s: 0.75, c: '#86b726' },
  { x: 640, y: 610, r: -120, s: 0.7, c: '#a9d24a', o: 0.7 },
  { x: 560, y: 330, r: 30, s: 0.5, c: '#2b7a4b', o: 0.45 },
  { x: 930, y: 640, r: 100, s: 1.2, c: '#3c9455' },
]

function Leaf({ x, y, r, s, c, o = 1 }: L) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} opacity={o}>
      <path d={LEAF} fill={c} />
      <path d="M0-3V-94" stroke="#fff" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
    </g>
  )
}

export function HeroPoster({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1000 700" preserveAspectRatio="xMaxYMin slice" aria-hidden="true" focusable="false">
      {HERO_LEAVES.map((l, i) => (
        <Leaf key={i} {...l} />
      ))}
      {[...Array(26)].map((_, i) => (
        <circle key={i} cx={560 + ((i * 97) % 440)} cy={(i * 173) % 700} r={2 + (i % 3)} fill="#86b726" opacity=".45" />
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
