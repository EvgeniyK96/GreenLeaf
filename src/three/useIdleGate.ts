import { useEffect, useState } from 'react'

type IdleWindow = Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void }

/** true в следующий период простоя: разносит тяжёлые шаги 3D по разным задачам. */
export function useIdleGate(enabled = true, timeout = 800): boolean {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!enabled || open) return
    const w = window as IdleWindow
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setOpen(true), { timeout })
      return () => w.cancelIdleCallback?.(id)
    }
    const t = window.setTimeout(() => setOpen(true), 50)
    return () => window.clearTimeout(t)
  }, [enabled, open, timeout])
  return open
}
