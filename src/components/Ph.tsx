import type { ReactNode } from 'react'
import { isFilled, SHOW_PLACEHOLDERS } from '../content/placeholders'
import { owner } from '../content/owner'

/**
 * Значение из content. Если это {{KEY}}: в dev — жёлтая пометка с ключом,
 * в продакшене — нейтральный fallback (или ничего).
 */
export function Ph({ value, fallback = null }: { value: string; fallback?: ReactNode }) {
  if (isFilled(value)) return <>{value}</>
  if (SHOW_PLACEHOLDERS)
    return (
      <mark className="ph-dev" title="Не заполнено: src/content, см. content/TODO.md">
        {value}
      </mark>
    )
  return fallback == null ? null : <span className="ph-prod">{fallback}</span>
}

/** «в Москве или онлайн» / «лично или онлайн», если город не заполнен. */
export function MeetPlace() {
  if (isFilled(owner.cityIn)) return <>в {owner.cityIn} или онлайн</>
  if (SHOW_PLACEHOLDERS)
    return (
      <>
        в <Ph value={owner.cityIn} /> или онлайн
      </>
    )
  return <>лично или онлайн</>
}
