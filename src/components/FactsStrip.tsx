import { factsStrip } from '../content/copy'
import { isFilled, SHOW_PLACEHOLDERS } from '../content/placeholders'
import { Ph } from './Ph'
import ui from './ui.module.css'
import styles from './FactsStrip.module.css'

/** Неподтверждённые цифры масштаба в продакшене не показываются вовсе. */
export function FactsStrip() {
  const items = factsStrip.items.filter((f) => isFilled(f.value) || SHOW_PLACEHOLDERS)
  return (
    <section id="fakty" className={styles.strip} aria-labelledby="facts-title">
      <div className={ui.container}>
        <h2 id="facts-title" className={styles.title}>
          {factsStrip.title}
        </h2>
        <dl className={styles.list}>
          {items.map((f) => (
            <div key={f.label} className={styles.item}>
              <dt className={styles.value}>
                <Ph value={f.value} />
              </dt>
              <dd className={styles.label}>{f.label}</dd>
            </div>
          ))}
        </dl>
        <p className={`${ui.note} ${styles.note}`}>{factsStrip.note}</p>
      </div>
    </section>
  )
}
