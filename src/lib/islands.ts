/** Состояние ленивой гидрации блоков (см. components/Island.tsx). */
declare global {
  interface Window {
    __GL_HYDRATING__?: boolean
  }
}

const waits = new Map<string, Promise<void>>()
const wakers = new Map<string, () => void>()

/** Гидрировать блок сразу, не дожидаясь прокрутки (например, форму по клику на CTA). */
export function wakeIsland(id: string) {
  wakers.get(id)?.()
  if (!waits.has(id)) waits.set(id, Promise.resolve())
}

export function whenNear(id: string): Promise<void> {
  let p = waits.get(id)
  if (!p) {
    p = new Promise<void>((resolve) => {
      wakers.set(id, resolve)
      const el = document.getElementById(id)
      if (!el || typeof IntersectionObserver === 'undefined') return resolve()
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io.disconnect()
            resolve()
          }
        },
        { rootMargin: '600px 0px' },
      )
      io.observe(el)
    })
    waits.set(id, p)
  }
  return p
}
