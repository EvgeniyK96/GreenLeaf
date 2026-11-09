import { useEffect, useRef } from 'react'
import { animate, useReducedMotion } from 'motion/react'
import { rub } from '../lib/format'

/** Число «досчитывается» до нового значения (400 мс). Текст меняется без ре-рендера. */
export function AnimatedRub({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const prev = useRef(value)
  const reduce = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduce) {
      el.textContent = rub(value)
      prev.current = value
      return
    }
    const controls = animate(prev.current, value, {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = rub(v)
      },
    })
    prev.current = value
    return () => controls.stop()
  }, [value, reduce])

  return (
    <span ref={ref} className={className}>
      {rub(value)}
    </span>
  )
}
