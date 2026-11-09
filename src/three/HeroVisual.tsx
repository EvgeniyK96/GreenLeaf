import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { probeTier, useCheapTier } from './useGpuTier'
import { SceneBoundary } from './SceneBoundary'
import { HeroPoster } from './Posters'
import { useInViewport } from '../hooks/useInViewport'
import { useAfterLoadIdle } from '../hooks/useAfterLoadIdle'
import { useMediaQuery } from '../hooks/useMediaQuery'
import styles from './Visual.module.css'

const HeroScene = lazy(() => import('./HeroScene'))

/**
 * Фон hero: сначала SVG-постер (сразу, без JS-нагрузки), затем — после load и простоя —
 * лениво грузится three.js-сцена и плавно проявляется поверх. Вне экрана рендер на паузе.
 */
export function HeroVisual() {
  const cheap = useCheapTier()
  const candidate = cheap === 'low' || cheap === 'high'
  const idle = useAfterLoadIdle(candidate)
  // Пробный WebGL-контекст — только после load и простоя (результат кэшируется)
  const tier = useMemo(() => (candidate && idle ? probeTier() : null), [candidate, idle])
  const wrap = useRef<HTMLDivElement>(null)
  const inView = useInViewport(wrap, '80px')
  const [ready, setReady] = useState(false)
  const want3d = tier === 'low' || tier === 'high'
  const shown = ready && want3d
  const wide = useMediaQuery('(min-width: 900px)')
  const pointer = useRef({ x: 0, y: 0 })
  const scroll = useRef(0)

  useEffect(() => {
    if (!candidate) return
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    const onScroll = () => {
      const h = wrap.current?.offsetHeight || window.innerHeight
      scroll.current = Math.min(1, Math.max(0, window.scrollY / h))
    }
    onScroll()
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
    }
  }, [candidate])

  return (
    <div ref={wrap} className={styles.hero} aria-hidden="true">
      <HeroPoster className={`${styles.poster} ${shown ? styles.hidden : ''}`} />
      {want3d && (
        <div className={`${styles.canvas} ${shown ? styles.visible : ''}`}>
          <SceneBoundary>
            <Suspense fallback={null}>
              <HeroScene
                tier={tier}
                active={inView}
                layout={wide ? 'side' : 'top'}
                pointer={pointer}
                scroll={scroll}
                onReady={() => setReady(true)}
              />
            </Suspense>
          </SceneBoundary>
        </div>
      )}
    </div>
  )
}
