import { useId, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import styles from './Accordion.module.css'

export type AccordionItem = {
  id: string
  title: ReactNode
  meta?: ReactNode
  content: ReactNode
}

type Props = {
  items: AccordionItem[]
  tone?: 'light' | 'dark'
  /** Заголовочный уровень кнопок (для оглавления скринридера). */
  headingLevel?: 3 | 4
  onToggle?: (id: string, open: boolean) => void
}

/** Доступный аккордеон: button + aria-expanded/aria-controls, можно открыть несколько. */
export function Accordion({ items, tone = 'light', headingLevel = 3, onToggle }: Props) {
  const [open, setOpen] = useState<Set<string>>(() => new Set())
  const base = useId()
  const H = headingLevel === 3 ? 'h3' : 'h4'

  const toggle = (id: string) => {
    const willOpen = !open.has(id)
    setOpen((prev) => {
      const next = new Set(prev)
      if (willOpen) next.add(id)
      else next.delete(id)
      return next
    })
    onToggle?.(id, willOpen)
  }

  return (
    <div className={`${styles.list} ${tone === 'dark' ? styles.dark : ''}`}>
      {items.map((item) => {
        const isOpen = open.has(item.id)
        const btnId = `${base}-${item.id}-btn`
        const panelId = `${base}-${item.id}-panel`
        return (
          <div key={item.id} className={`${styles.item} ${isOpen ? styles.open : ''}`}>
            <H className={styles.heading}>
              <button
                id={btnId}
                type="button"
                className={styles.trigger}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
              >
                <span className={styles.titleWrap}>
                  {item.meta && <span className={styles.meta}>{item.meta}</span>}
                  <span className={styles.title}>{item.title}</span>
                </span>
                <span className={styles.icon} aria-hidden="true" />
              </button>
            </H>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  className={styles.panel}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className={styles.panelInner}>{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
