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

type SceneProps = {
  tier: 'low' | 'high'
  active: boolean
  pointer: Vec2Ref
  scroll: NumRef
  onReady: () => void
}

/** Цвет дымки = цвет фона hero: дальние листья растворяются, текст по центру читается. */
const HAZE = '#f5faf2'

type LeafSeed = {
  /** Центральный лист (в глубине) или боковой. */
  center: boolean
  /** Для центральных — x в долях ширины (−0.24…0.24); для боковых — сторона (±1). */
  x: number
  /** Для боковых: положение внутри боковой полосы 0…1. */
  band: number
  /** Фаза падения 0…1. */
  y: number
  z: number
  rx: number
  ry: number
  rz: number
  s: number
  phase: number
  /** Скорость падения: доля высоты экрана в секунду. */
  fall: number
  sway: number
  spin: number
}

/**
 * Листья по всей ширине, но в основном по краям: 70% — в боковых полосах ближе к камере,
 * 30% — по центру, только в глубине (их «съедает» дымка, текст поверх остаётся читаемым).
 */
function makeSeeds(count: number): LeafSeed[] {
  const rnd = mulberry32(20261109)
  return Array.from({ length: count }, (_, i) => {
    const center = i % 10 < 3
    const side = rnd() < 0.5 ? -1 : 1
    const x = center ? (rnd() * 2 - 1) * 0.24 : side
    const z = center ? -7 + rnd() * 3.5 : -4 + rnd() * 5.2
    return {
      center,
      x,
      band: rnd(),
      y: rnd(),
      z,
      rx: rnd() * Math.PI * 2,
      ry: rnd() * Math.PI * 2,
      rz: rnd() * Math.PI * 2,
      s: 0.55 + rnd() * 0.7,
      phase: rnd() * Math.PI * 2,
      fall: 0.018 + rnd() * 0.03,
      sway: 0.15 + rnd() * 0.35,
      spin: (rnd() - 0.5) * 1.2,
    }
  })
}

function Leaves({ count, pointer, scroll }: { count: number; pointer: Vec2Ref; scroll: NumRef }) {
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
    // Свободная полоса под текстом: на десктопе ±27% ширины, на узком экране ±36% и листья мельче
    const narrow = vw < vh
    const bandFrom = narrow ? 0.36 : 0.27
    // Размер листа — от ширины экрана: на телефоне лист не больше ~1/5 ширины
    const sizeK = Math.min(1, Math.max(0.45, vw / 8.5))

    // Параллакс за курсором и подъём при скролле — всей стаей
    g.rotation.y = MathUtils.damp(g.rotation.y, pointer.current.x * 0.16, 3, d)
    g.rotation.x = MathUtils.damp(g.rotation.x, -pointer.current.y * 0.08, 3, d)
    g.position.x = MathUtils.damp(g.position.x, pointer.current.x * 0.3, 2.5, d)
    g.position.y = MathUtils.damp(g.position.y, p * vh * 0.35, 6, d)

    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i]
      const depth = 1 + -s.z * 0.11
      // Падение сверху вниз с переносом наверх за краем экрана
      const u = (s.y + t * s.fall) % 1
      const y = (0.5 - u) * vh * 1.25 * depth
      const xn = s.center ? s.x : s.x * (bandFrom + s.band * (0.6 - bandFrom))
      const x = xn * vw * depth + Math.sin(t * 0.7 + s.phase) * s.sway
      dummy.position.set(x, y, s.z)
      dummy.rotation.set(
        s.rx + t * s.spin * 0.6 + Math.sin(t * 0.9 + s.phase) * 0.5,
        s.ry + t * s.spin * 0.35,
        s.rz + Math.cos(t * 0.6 + s.phase) * 0.6,
      )
      dummy.scale.setScalar(s.s * sizeK)
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

/** Пыльца по всему экрану: медленно поднимается. Позиции считаются на CPU (≤ 160 точек). */
function Pollen({ count }: { count: number }) {
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
      opacity: 0.55,
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
      arr[i * 3] = (s.nx - 0.5) * vw * 1.05 + Math.sin(t * 0.6 + s.ph) * 0.15
      arr[i * 3 + 1] = (ny - 0.5) * vh * 1.05
      arr[i * 3 + 2] = s.z
    }
    attr.needsUpdate = true
  })

  return <points ref={points} args={[geometry, material]} frustumCulled={false} />
}

export default function HeroScene({ tier, active, pointer, scroll, onReady }: SceneProps) {
  const [dpr, setDpr] = useState(tier === 'high' ? 1.5 : 1)
  const [count, setCount] = useState(tier === 'high' ? 44 : 28)
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
      camera={{ position: [0, 0, 9], fov: 38, near: 0.1, far: 40 }}
      onCreated={({ gl, scene, camera }) => {
        gl.debug.checkShaderErrors = import.meta.env.DEV
        // Шейдеры компилируются параллельно (KHR_parallel_shader_compile), где это поддерживается
        const done = () => {
          setCompiled(true)
          requestAnimationFrame(() => requestAnimationFrame(onReady))
        }
        gl.compileAsync(scene, camera).then(done, done)
      }}
      style={{ pointerEvents: 'none' }}
    >
      <fog attach="fog" args={[HAZE, 8, 17]} />
      <PerformanceMonitor
        onDecline={() => {
          setDpr(1)
          setCount((c) => Math.max(18, Math.round(c * 0.65)))
        }}
      />
      <hemisphereLight args={['#f6fff0', '#4eae36', 1.5]} />
      <directionalLight position={[4, 6, 5]} intensity={2.1} color="#fff8e8" />
      <ambientLight intensity={0.55} />
      <Leaves key={count} count={count} pointer={pointer} scroll={scroll} />
      <Pollen count={pollen} />
    </Canvas>
  )
}
