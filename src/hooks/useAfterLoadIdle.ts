import { useEffect, useState } from 'react'

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
  cancelIdleCallback?: (id: number) => void
}

/**
 * Когда можно начинать тяжёлое (three.js): после load, по первому взаимодействию
 * (движение мыши, касание, скролл, клавиша) — или сам по себе через `delay` мс простоя.
 * Так первый экран и отклик кнопок не ждут WebGL. ?3d=eager — грузить сразу после load
 * (для замера худшего случая).
 */
export function useAfterLoadIdle(enabled: boolean, delay = 3500): boolean {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!enabled || ready) return
    const w = window as IdleWindow
    const eager = new URLSearchParams(window.location.search).get('3d') === 'eager'
    let idleId: number | undefined
    let timer: number | undefined
    let loaded = document.readyState === 'complete'
    let interacted = false
    const go = () => setReady(true)
    const whenIdle = () => {
      if (w.requestIdleCallback) idleId = w.requestIdleCallback(go, { timeout: 1500 })
      else timer = window.setTimeout(go, 200)
    }
    const onLoad = () => {
      loaded = true
      if (eager || interacted) whenIdle()
      else timer = window.setTimeout(whenIdle, delay)
    }
    const onInteract = () => {
      interacted = true
      if (loaded) {
        if (timer !== undefined) window.clearTimeout(timer)
        whenIdle()
      }
    }
    const opts = { once: true, passive: true } as const
    const events = ['pointermove', 'pointerdown', 'touchstart', 'scroll', 'keydown'] as const
    events.forEach((e) => window.addEventListener(e, onInteract, opts))
    if (loaded) onLoad()
    else window.addEventListener('load', onLoad, { once: true })
    return () => {
      window.removeEventListener('load', onLoad)
      events.forEach((e) => window.removeEventListener(e, onInteract))
      if (idleId !== undefined) w.cancelIdleCallback?.(idleId)
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [enabled, ready, delay])
  return ready
}
