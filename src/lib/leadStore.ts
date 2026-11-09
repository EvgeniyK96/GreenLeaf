import { useSyncExternalStore } from 'react'

/** Какой шаг выбран: A — встреча, B — регистрация по ID. Общий для CTA и формы. */
export type LeadStep = 'meet' | 'register'

let current: LeadStep = 'meet'
let modalOpen = false
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setLeadStep(step: LeadStep) {
  if (current === step) return
  current = step
  emit()
}

export function useLeadStep(): LeadStep {
  // Серверный снимок всегда 'meet' — как в HTML пререндера; реальное значение подставится после гидрации
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => 'meet',
  )
}

/** Окно заявки поверх страницы (components/LeadModal.tsx). */
export function openLeadModal(step?: LeadStep) {
  if (step) setLeadStep(step)
  if (modalOpen) return
  modalOpen = true
  emit()
}

export function closeLeadModal() {
  if (!modalOpen) return
  modalOpen = false
  emit()
}

export function useLeadModalOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => modalOpen,
    () => false,
  )
}
