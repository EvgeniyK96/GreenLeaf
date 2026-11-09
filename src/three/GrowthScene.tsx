import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
  TubeGeometry,
  Vector3,
} from 'three'
import type { MotionValue } from 'motion/react'
import { createLeafGeometry, createLeafTexture } from './leaf'
import { useIdleGate } from './useIdleGate'

/**
 * «Рост» в блоке начислений: стебель растёт со скроллом, на нём раскрываются 11 листьев —
 * по одному на каждый вид начислений, тремя ярусами (1 + 6 + 4), как три группы на странице.
 * frameloop="demand": кадр рисуется только при изменении прогресса.
 */

type Props = {
  progress: MotionValue<number>
  activeGroup: MotionValue<number>
  active: boolean
  onReady: () => void
}

const GROUP_COLORS = ['#b6dd4c', '#4eae36', '#30a8d7']
const TIERS: { group: number; t: number }[] = [
  { group: 0, t: 0.2 },
  ...[0.36, 0.41, 0.46, 0.51, 0.56, 0.61].map((t) => ({ group: 1, t })),
  ...[0.7, 0.76, 0.82, 0.88].map((t) => ({ group: 2, t })),
]

const smooth = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return k * k * (3 - 2 * k)
}

function Plant({ progress, activeGroup }: Pick<Props, 'progress' | 'activeGroup'>) {
  const invalidate = useThree((s) => s.invalidate)
  const leafRefs = useRef<(Mesh | null)[]>([])
  const root = useRef<Group>(null)

  const { curve, tube, stemMat, leafGeo, leafMats, shadow } = useMemo(() => {
    const curve = new CatmullRomCurve3([
      new Vector3(0, -2.35, 0),
      new Vector3(0.18, -1.2, 0.05),
      new Vector3(-0.14, 0.1, -0.05),
      new Vector3(0.16, 1.3, 0.05),
      new Vector3(0.02, 2.45, 0),
    ])
    const tube = new TubeGeometry(curve, 140, 0.055, 8, false)
    const stemMat = new MeshStandardMaterial({ color: '#4eae36', roughness: 0.7 })
    const leafGeo = createLeafGeometry('base')
    const map = createLeafTexture()
    const leafMats = TIERS.map(
      (tier) =>
        new MeshStandardMaterial({
          color: GROUP_COLORS[tier.group],
          map,
          side: DoubleSide,
          roughness: 0.6,
          emissive: new Color(GROUP_COLORS[tier.group]),
          emissiveIntensity: 0,
        }),
    )
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(0,0,0,0.45)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
    const shadowTex = new CanvasTexture(c)
    shadowTex.colorSpace = SRGBColorSpace
    const shadow = new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    return { curve, tube, stemMat, leafGeo, leafMats, shadow }
  }, [])

  useEffect(
    () => () => {
      tube.dispose()
      stemMat.dispose()
      leafGeo.dispose()
      leafMats[0].map?.dispose()
      leafMats.forEach((m) => m.dispose())
      shadow.map?.dispose()
      shadow.dispose()
    },
    [tube, stemMat, leafGeo, leafMats, shadow],
  )

  /* Положение и поворот каждого листа: филлотаксис 137,5°, наклон наружу и вверх. */
  const placements = useMemo(
    () =>
      TIERS.map((tier, i) => {
        const p = curve.getPointAt(tier.t)
        const yaw = i * 2.39996
        const size = tier.group === 0 ? 1.25 : tier.group === 1 ? 1.05 : 0.85
        return { p, yaw, size, ...tier }
      }),
    [curve],
  )

  useEffect(() => {
    const unsub1 = progress.on('change', () => invalidate())
    const unsub2 = activeGroup.on('change', () => invalidate())
    return () => {
      unsub1()
      unsub2()
    }
  }, [progress, activeGroup, invalidate])

  useFrame(() => {
    const p = progress.get()
    const grow = Math.min(1, p * 1.08)
    const perSegment = 8 * 6
    tube.setDrawRange(0, Math.floor(grow * 140) * perSegment)
    const ag = Math.round(activeGroup.get())
    let settling = false
    placements.forEach((pl, i) => {
      const leaf = leafRefs.current[i]
      if (!leaf) return
      const k = smooth(pl.t, pl.t + 0.09, grow)
      leaf.scale.setScalar(Math.max(0.0001, k * pl.size))
      leaf.visible = k > 0.001
      const mat = leafMats[i]
      const target = ag === pl.group ? 0.35 : 0
      mat.emissiveIntensity += (target - mat.emissiveIntensity) * 0.3
      if (Math.abs(target - mat.emissiveIntensity) > 0.01) settling = true
    })
    if (root.current) root.current.rotation.y = -0.35 + p * 0.7
    if (settling) invalidate()
  })

  return (
    <group ref={root}>
      <mesh geometry={tube} material={stemMat} />
      {placements.map((pl, i) => (
        <group key={i} position={pl.p} rotation={[0, pl.yaw, 0]}>
          <mesh
            ref={(m) => {
              leafRefs.current[i] = m
            }}
            geometry={leafGeo}
            material={leafMats[i]}
            rotation={[0, 0, -0.95]}
            visible={false}
          />
        </group>
      ))}
      <mesh position={[0, -2.38, 0]} rotation={[-Math.PI / 2, 0, 0]} material={shadow}>
        <circleGeometry args={[0.9, 32]} />
      </mesh>
    </group>
  )
}

export default function GrowthScene({ progress, activeGroup, active, onReady }: Props) {
  const mount = useIdleGate()
  const [compiled, setCompiled] = useState(false)
  if (!mount) return null
  return (
    <Canvas
      frameloop={active && compiled ? 'demand' : 'never'}
      dpr={[1, 1.5]}
      flat
      gl={{ antialias: true, alpha: true, stencil: false }}
      camera={{ position: [0, 0.1, 7.4], fov: 34 }}
      onCreated={({ gl, scene, camera, invalidate }) => {
        gl.debug.checkShaderErrors = import.meta.env.DEV
        const done = () => {
          setCompiled(true)
          invalidate()
          requestAnimationFrame(onReady)
        }
        gl.compileAsync(scene, camera).then(done, done)
      }}
      style={{ pointerEvents: 'none' }}
    >
      <hemisphereLight args={['#f1ffe6', '#0f3a2a', 1.25]} />
      <directionalLight position={[3, 5, 4]} intensity={1.9} color="#fff6e0" />
      <ambientLight intensity={0.25} />
      <Plant progress={progress} activeGroup={activeGroup} />
    </Canvas>
  )
}
