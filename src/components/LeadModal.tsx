import { useEffect, useId, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { closeLeadModal, openLeadModal, useLeadModalOpen, type LeadStep } from '../lib/leadStore'
import { LeadForm } from './LeadForm'
import styles from './LeadModal.module.css'

declare global {
  interface Window {
    /** Шаг из клика по кнопке заявки, сделанного до загрузки приложения (см. index.html). */
    __glLeadPending?: string | null
    __glLeadReady?: boolean
  }
}

const toStep = (v: string | null | undefined): LeadStep | undefined =>
  v === 'meet' || v === 'register' ? v : undefined

/**
 * Окно заявки поверх страницы. Любая ссылка на #zayavka (кнопки «Написать», «Назначить встречу»,
 * «Зарегистрироваться по ID» и др.) открывает окно вместо прокрутки к форме внизу.
 * data-step="meet|register" на ссылке заранее выбирает шаг. Без JS ссылки просто ведут к форме.
 */
export function LeadModal() {
  const open = useLeadModalOpen()
  const ref = useRef<HTMLDialogElement>(null)
  const [closing, setClosing] = useState(false)
  const reduce = useReducedMotion()
  const titleId = useId()

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = e.target instanceof Element ? e.target.closest('a[href="#zayavka"]') : null
      if (!link) return
      e.preventDefault()
      openLeadModal(toStep(link.getAttribute('data-step')))
    }
    document.addEventListener('click', onClick)
    window.__glLeadReady = true
    const pending = window.__glLeadPending
    if (pending) {
      window.__glLeadPending = null
      openLeadModal(toStep(pending))
    }
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    const d = ref.current
    if (open && d && !d.open) d.showModal()
  }, [open])

  const requestClose = () => {
    const d = ref.current
    if (!d?.open || closing) return
    if (reduce) {
      d.close()
      return
    }
    setClosing(true)
    window.setTimeout(() => d.close(), 220)
  }

  return (
    <dialog
      ref={ref}
      className={`${styles.dialog} ${closing ? styles.closing : ''}`}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        requestClose()
      }}
      onClose={() => {
        setClosing(false)
        closeLeadModal()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose()
      }}
    >
      <div className={styles.panel}>
        <div className={styles.closeBar}>
          <button type="button" className={styles.close} aria-label="Закрыть окно заявки" onClick={requestClose}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {(open || closing) && <LeadForm variant="modal" titleId={titleId} />}
      </div>
    </dialog>
  )
}
