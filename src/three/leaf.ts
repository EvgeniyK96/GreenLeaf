import {
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  Float32BufferAttribute,
  MeshLambertMaterial,
  SRGBColorSpace,
} from 'three'

/**
 * Процедурный лист: сетка u (вдоль) × v (поперёк), V-образный сгиб по центральной жилке
 * и загиб кончика. Без моделей и внешних текстур.
 * anchor='base' — точка крепления в (0,0,0), удобно для стебля; 'center' — для парящих листьев.
 */
export function createLeafGeometry(anchor: 'center' | 'base' = 'center', segU = 14, segV = 6): BufferGeometry {
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const shift = anchor === 'center' ? 0.5 : 0

  for (let i = 0; i <= segU; i++) {
    const u = i / segU
    const width = Math.pow(Math.sin(Math.PI * Math.pow(u, 0.72)), 0.92) * 0.36
    for (let j = 0; j <= segV; j++) {
      const v = (j / segV) * 2 - 1
      const x = v * width
      const fold = -Math.abs(v) * width * 0.38
      const curl = 0.24 * u * u
      const wave = Math.sin(u * Math.PI * 4 + v * 2) * 0.008
      positions.push(x, u - shift, fold + curl + wave)
      uvs.push((v + 1) / 2, u)
    }
  }
  const row = segV + 1
  for (let i = 0; i < segU; i++) {
    for (let j = 0; j < segV; j++) {
      const a = i * row + j
      const b = a + row
      indices.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }
  const geometry = new BufferGeometry()
  geometry.setIndex(indices)
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.computeVertexNormals()
  return geometry
}

/** Светотень и жилки листа в маленькой canvas-текстуре (128×256). Цвет задаёт instanceColor/color. */
export function createLeafTexture(): CanvasTexture {
  const w = 128
  const h = 256
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  const vertical = ctx.createLinearGradient(0, h, 0, 0)
  vertical.addColorStop(0, '#dfe8db')
  vertical.addColorStop(0.45, '#ffffff')
  vertical.addColorStop(1, '#eef2ec')
  ctx.fillStyle = vertical
  ctx.fillRect(0, 0, w, h)

  const edges = ctx.createLinearGradient(0, 0, w, 0)
  edges.addColorStop(0, 'rgba(20,60,30,0.22)')
  edges.addColorStop(0.3, 'rgba(20,60,30,0)')
  edges.addColorStop(0.7, 'rgba(20,60,30,0)')
  edges.addColorStop(1, 'rgba(20,60,30,0.22)')
  ctx.fillStyle = edges
  ctx.fillRect(0, 0, w, h)

  ctx.lineCap = 'round'
  for (let k = 0; k < 8; k++) {
    const y = h - 30 - k * 27
    ctx.strokeStyle = 'rgba(15,50,25,0.12)'
    ctx.lineWidth = 1.6
    ctx.beginPath()
    ctx.moveTo(w / 2, y)
    ctx.quadraticCurveTo(w * 0.3, y - 14, 6, y - 40)
    ctx.moveTo(w / 2, y)
    ctx.quadraticCurveTo(w * 0.7, y - 14, w - 6, y - 40)
    ctx.stroke()
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.95)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(w / 2, h)
  ctx.lineTo(w / 2, 4)
  ctx.stroke()

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 2
  return texture
}

/** Lambert: без бликов на скользящих углах (листья не «белеют») и дешевле для мобильных GPU. */
export function createLeafMaterial(color = '#ffffff'): MeshLambertMaterial {
  return new MeshLambertMaterial({
    color,
    map: createLeafTexture(),
    side: DoubleSide,
  })
}

/** Детерминированный генератор: сцена одинакова при каждой загрузке. */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const LEAF_COLORS = ['#2b7a4b', '#4eae36', '#86b726', '#3c9455', '#a9d24a', '#1f6b3f', '#5cbf5a']
