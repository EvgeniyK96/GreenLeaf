import { useSyncExternalStore } from 'react'
import { wakeIsland } from './islands'

/** Какой шаг выбран: A — встреча, B — регистрация по ID. Общий для CTA и формы. */
export type LeadStep = 'meet' | 'register'

let current: LeadStep = 'meet'
const listeners = new Set<() => void>()

export function setLeadStep(step: LeadStep) {
  wakeIsland('zayavka')
  if (current === step) return
  current = step
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useLeadStep(): LeadStep {
  // Серверный снимок всегда 'meet' — как в HTML пререндера; реальное значение подставится после гидрации
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => 'meet',
  )
}
