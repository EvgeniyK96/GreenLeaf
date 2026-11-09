import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import type { MotionValue } from 'motion/react'
import { probeTier, useCheapTier } from './useGpuTier'
import { SceneBoundary } from './SceneBoundary'
import { GrowthPoster } from './Posters'
import { useInViewport } from '../hooks/useInViewport'
import { useMediaQuery } from '../hooks/useMediaQuery'
import styles from './Visual.module.css'

const GrowthScene = lazy(() => import('./GrowthScene'))

/**
 * Акцент блока «За что платит компания». 3D только на широких экранах (≥ 960 px), где колонка
 * со стеблем липнет рядом с текстом; на телефонах и без WebGL — SVG-постер.
 * Модуль грузится, когда блок подходит к экрану (за 600 px).
 */
export function GrowthVisual({ progress, activeGroup }: { progress: MotionValue<number>; activeGroup: MotionValue<number> }) {
  const cheap = useCheapTier()
  const wide = useMediaQuery('(min-width: 960px)')
  const wrap = useRef<HTMLDivElement>(null)
  const near = useInViewport(wrap, '600px', true)
  const inView = useInViewport(wrap, '0px')
  const [ready, setReady] = useState(false)
  const candidate = wide && (cheap === 'low' || cheap === 'high')
  // Блок подошёл к экрану: проверяем WebGL (кэшируется) и только тогда грузим сцену
  const armed = useMemo(() => candidate && near && probeTier() !== 'none', [candidate, near])
  const shown = ready && armed

  return (
    <div ref={wrap} className={styles.growth} aria-hidden="true">
      <GrowthPoster className={`${styles.poster} ${shown ? styles.hidden : ''}`} />
      {candidate && armed && (
        <div className={`${styles.canvas} ${shown ? styles.visible : ''}`}>
          <SceneBoundary>
            <Suspense fallback={null}>
              <GrowthScene progress={progress} activeGroup={activeGroup} active={inView} onReady={() => setReady(true)} />
            </Suspense>
          </SceneBoundary>
        </div>
      )}
    </div>
  )
}
