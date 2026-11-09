import { useEffect, useState, type RefObject } from 'react'

/** Виден ли элемент (с запасом rootMargin). once=true — «защёлка»: после первого показа всегда true. */
export function useInViewport<T extends Element>(
  ref: RefObject<T | null>,
  rootMargin = '0px',
  once = false,
): boolean {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (once && entry.isIntersecting) io.disconnect()
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin, once])
  return inView
}
