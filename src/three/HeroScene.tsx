import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  InstancedMesh,
  MathUtils,
  Object3D,
  Points,
  PointsMaterial,
  SRGBColorSpace,
} from 'three'
import { LEAF_COLORS, createLeafGeometry, createLeafMaterial, mulberry32 } from './leaf'
import { useIdleGate } from './useIdleGate'

export type Vec2Ref = MutableRefObject<{ x: number; y: number }>
export type NumRef = MutableRefObject<number>

type Layout = 'side' | 'top'

type SceneProps = {
  tier: 'low' | 'high'
  active: boolean
  layout: Layout
  pointer: Vec2Ref
  scroll: NumRef
  onReady: () => void
}

type LeafSeed = {
  nx: number
  ny: number
  z: number
  rx: number
  ry: number
  rz: number
  s: number
  phase: number
  bob: number
  spin: number
}

function makeSeeds(count: number): LeafSeed[] {
  const rnd = mulberry32(20261109)
  return Array.from({ length: count }, () => ({
    nx: rnd(),
    ny: rnd(),
    z: -4.5 + rnd() * 5.5,
    rx: rnd() * Math.PI * 2,
    ry: rnd() * Math.PI * 2,
    rz: rnd() * Math.PI * 2,
    s: 0.55 + rnd() * 0.75,
    phase: rnd() * Math.PI * 2,
    bob: 0.35 + rnd() * 0.5,
    spin: (rnd() - 0.5) * 0.9,
  }))
}

/** Где на экране живут листья: справа (десктоп) или полосой сверху (телефон) — не под текстом. */
function place(seed: LeafSeed, layout: Layout, vw: number, vh: number) {
  const depth = 1 + -seed.z * 0.12
  if (layout === 'side') {
    return {
      x: (0.12 + seed.nx * 0.42) * vw * depth,
      y: (seed.ny - 0.5) * vh * 1.05 * depth,
    }
  }
  return {
    x: (seed.nx - 0.5) * vw * 1.1 * depth,
    y: (0.12 + seed.ny * 0.42) * vh * depth,
  }
}

function Leaves({ count, layout, pointer, scroll }: { count: number; layout: Layout; pointer: Vec2Ref; scroll: NumRef }) {
  const mesh = useRef<InstancedMesh>(null)
  const group = useRef<Group>(null)
  const geometry = useMemo(() => createLeafGeometry('center'), [])
  const material = useMemo(() => createLeafMaterial(), [])
  const seeds = useMemo(() => makeSeeds(count), [count])
  const dummy = useMemo(() => new Object3D(), [])

  useEffect(
    () => () => {
      geometry.dispose()
      material.map?.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    const c = new Color()
    seeds.forEach((_, i) => m.setColorAt(i, c.set(LEAF_COLORS[i % LEAF_COLORS.length])))
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [seeds])

  useFrame((state, delta) => {
    const m = mesh.current
    const g = group.current
    if (!m || !g) return
    const t = state.clock.elapsedTime
    const { width: vw, height: vh } = state.viewport
    const p = scroll.current
    const d = Math.min(delta, 0.05)

    g.rotation.y = MathUtils.damp(g.rotation.y, pointer.current.x * 0.22, 3, d)
    g.rotation.x = MathUtils.damp(g.rotation.x, -pointer.current.y * 0.12, 3, d)
    g.position.x = MathUtils.damp(g.position.x, pointer.current.x * 0.25, 2.5, d)
    g.position.y = MathUtils.damp(g.position.y, p * vh * 0.55, 6, d)

    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i]
      const pos = place(s, layout, vw, vh)
      dummy.position.set(pos.x, pos.y + Math.sin(t * s.bob + s.phase) * 0.16, s.z)
      dummy.rotation.set(
        s.rx + Math.sin(t * 0.45 + s.phase) * 0.35 + p * s.spin * 3,
        s.ry + t * s.spin * 0.3,
        s.rz + Math.cos(t * 0.38 + s.phase) * 0.28,
      )
      dummy.scale.setScalar(s.s * (1 + p * 0.25))
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />
    </group>
  )
}

function makeDotTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.4, 'rgba(255,255,255,0.65)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  return tex
}

/** Пыльца: лёгкие частицы, медленно поднимаются. Позиции считаются на CPU (≤ 160 точек). */
function Pollen({ count, layout }: { count: number; layout: Layout }) {
  const points = useRef<Points>(null)
  const { geometry, material, seeds } = useMemo(() => {
    const rnd = mulberry32(7)
    const seeds = Array.from({ length: count }, () => ({ nx: rnd(), ny: rnd(), z: -3 + rnd() * 4, v: 0.04 + rnd() * 0.08, ph: rnd() * 6.28 }))
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3))
    const material = new PointsMaterial({
      size: 0.07,
      map: makeDotTexture(),
      color: '#7fb52a',
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      sizeAttenuation: true,
    })
    return { geometry, material, seeds }
  }, [count])

  useEffect(
    () => () => {
      geometry.dispose()
      material.map?.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  useFrame((state) => {
    const attr = geometry.getAttribute('position') as BufferAttribute
    const arr = attr.array as Float32Array
    const t = state.clock.elapsedTime
    const { width: vw, height: vh } = state.viewport
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i]
      const ny = (s.ny + t * s.v * 0.1) % 1
      const x = layout === 'side' ? (s.nx * 0.5 + 0.02) * vw : (s.nx - 0.5) * vw
      const y = layout === 'side' ? (ny - 0.5) * vh : (0.05 + ny * 0.5) * vh
      arr[i * 3] = x + Math.sin(t * 0.6 + s.ph) * 0.15
      arr[i * 3 + 1] = y
      arr[i * 3 + 2] = s.z
    }
    attr.needsUpdate = true
  })

  return <points ref={points} args={[geometry, material]} frustumCulled={false} />
}

export default function HeroScene({ tier, active, layout, pointer, scroll, onReady }: SceneProps) {
  const [dpr, setDpr] = useState(tier === 'high' ? 1.5 : 1)
  const [count, setCount] = useState(tier === 'high' ? (layout === 'side' ? 34 : 26) : 20)
  const pollen = tier === 'high' ? 140 : 70
  const mount = useIdleGate()
  const [compiled, setCompiled] = useState(false)

  if (!mount) return null
  return (
    <Canvas
      frameloop={active && compiled ? 'always' : 'never'}
      dpr={[1, dpr]}
      flat
      gl={{ antialias: tier === 'high', alpha: true, powerPreference: 'high-performance', stencil: false }}
      camera={{ position: [0, 0, 9], fov: 36, near: 0.1, far: 40 }}
      onCreated={({ gl, scene, camera }) => {
        gl.debug.checkShaderErrors = import.meta.env.DEV
        // Шейдеры компилируются параллельно (KHR_parallel_shader_compile), без блокировки потока
        const done = () => {
          setCompiled(true)
          requestAnimationFrame(() => requestAnimationFrame(onReady))
        }
        gl.compileAsync(scene, camera).then(done, done)
      }}
      style={{ pointerEvents: 'none' }}
    >
      <PerformanceMonitor
        onDecline={() => {
          setDpr(1)
          setCount((c) => Math.max(16, Math.round(c * 0.65)))
        }}
      />
      <hemisphereLight args={['#f6fff0', '#4eae36', 1.5]} />
      <directionalLight position={[4, 6, 5]} intensity={2.1} color="#fff8e8" />
      <ambientLight intensity={0.55} />
      <Leaves key={count} count={count} layout={layout} pointer={pointer} scroll={scroll} />
      <Pollen count={pollen} layout={layout} />
    </Canvas>
  )
}
