import { Suspense, use, type ReactNode } from 'react'

/**
 * Ленивая гидрация. Блок, отрендеренный при сборке, остаётся готовым HTML (виден и читается),
 * а React «оживляет» его, только когда он подходит к экрану (за 600 px). На слабых телефонах
 * это убирает длинную гидрацию всей страницы при загрузке.
 * В dev (без пререндера) блоки рендерятся сразу.
 */
import { whenNear } from '../lib/islands'

function Gate({ id, children }: { id: string; children: ReactNode }) {
  if (typeof window !== 'undefined' && window.__GL_HYDRATING__) use(whenNear(id))
  return <>{children}</>
}

export function Island({ id, children }: { id: string; children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <Gate id={id}>{children}</Gate>
    </Suspense>
  )
}
