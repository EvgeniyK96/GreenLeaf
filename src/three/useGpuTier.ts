import { useSyncExternalStore } from 'react'

/**
 * Уровень 3D для устройства:
 *  - 'none' — статичный постер (reduced motion, нет WebGL или он программный, слабое железо, экономия трафика);
 *  - 'low'  — облегчённая сцена (меньше листьев, dpr 1, без сглаживания);
 *  - 'high' — полная сцена.
 * Переопределение для проверки: ?3d=off | ?3d=low | ?3d=on | ?3d=eager (on + загрузка сразу после load)
 *
 * Проверка в два шага, чтобы не тормозить первый экран:
 *  1) cheapTier() — сразу: настройки и железо, без создания WebGL-контекста;
 *  2) probeTier() — только после load и простоя: пробный WebGL-контекст.
 */
export type GpuTier = 'none' | 'low' | 'high'

type NavigatorExtra = Navigator & {
  deviceMemory?: number
  connection?: { saveData?: boolean; effectiveType?: string }
}

function override(): string | null {
  return new URLSearchParams(window.location.search).get('3d')
}

/** Без WebGL: 'none' — точно постер; 'low'/'high' — кандидат на 3D. */
export function cheapTier(): GpuTier {
  if (typeof window === 'undefined') return 'none'
  const o = override()
  if (o === 'off') return 'none'
  if (o === 'on' || o === 'eager') return 'high'
  if (o === 'low') return 'low'
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'none'

  const nav = navigator as NavigatorExtra
  if (nav.connection?.saveData) return 'none'
  if (nav.connection?.effectiveType && /(^|-)2g$/.test(nav.connection.effectiveType)) return 'none'

  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 4
  // Совсем слабые устройства — постер. 2 ядра сами по себе не повод: у многих ноутбуков
  // (например, AMD Athlon 3050U) нормальная встроенная видеокарта — им облегчённая сцена,
  // а программный рендер и отсутствие WebGL отсекает проба в probeTier().
  if (cores <= 1 || memory <= 1) return 'none'

  const small = window.matchMedia('(max-width: 767px)').matches
  if (small || cores <= 4 || memory <= 4) return 'low'
  return 'high'
}

let probeCache: { ok: boolean; software: boolean } | null = null

function probeWebGL(): { ok: boolean; software: boolean } {
  if (probeCache) return probeCache
  try {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    // failIfMajorPerformanceCaveat: на программном рендере контекст не создаётся
    const gl = (canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true }) ||
      null) as WebGLRenderingContext | null
    if (!gl) {
      probeCache = { ok: false, software: true }
    } else {
      // Firefox отдаёт реальное имя в RENDERER (расширение там устарело), Chrome — «WebKit WebGL»
      let renderer = String(gl.getParameter(gl.RENDERER) ?? '')
      if (/^webkit webgl$/i.test(renderer)) {
        const ext = gl.getExtension('WEBGL_debug_renderer_info')
        if (ext) renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL))
      }
      probeCache = { ok: true, software: /swiftshader|llvmpipe|software|basic render/i.test(renderer) }
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  } catch {
    probeCache = { ok: false, software: false }
  }
  return probeCache
}

/** Финальный уровень: дешёвая оценка + пробный контекст. Вызывать после load/простоя. */
export function probeTier(): GpuTier {
  const base = cheapTier()
  if (base === 'none') return 'none'
  // ?3d=on|low: принудительно (для проверки и Lighthouse), без пробы — Canvas сам упадёт в постер при ошибке
  if (['on', 'low', 'eager'].includes(override() ?? '')) return base
  const gl = probeWebGL()
  if (!gl.ok || gl.software) return 'none'
  return base
}

/** Дешёвая оценка (null на сервере и при гидрации — первый кадр всегда постер). */
export function useCheapTier(): GpuTier | null {
  return useSyncExternalStore<GpuTier | null>(
    (onChange) => {
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    cheapTier,
    () => null,
  )
}
