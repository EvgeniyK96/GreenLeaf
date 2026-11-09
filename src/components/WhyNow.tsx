import { why } from '../content/copy'
import ui from './ui.module.css'
import styles from './WhyNow.module.css'

export function WhyNow() {
  return (
    <section id="vygoda" className={ui.section} aria-labelledby="why-title">
      <div className={`${ui.container} ${styles.grid}`}>
        <div>
          <h2 id="why-title" className={ui.h2} data-reveal="up">
            {why.title}
          </h2>
          <p className={ui.lead} data-reveal="up" style={{ ['--i' as string]: 1 }}>
            {why.lead}
          </p>
          <ul className={styles.basket} aria-label="Что обычно покупает семья" data-reveal="fade" style={{ ['--i' as string]: 2 }}>
            {why.basket.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <dl className={styles.layers}>
          {why.layers.map((l, i) => (
            <div key={l.title} className={styles.layer} data-reveal="right" style={{ ['--i' as string]: i + 1 }}>
              <dt>{l.title}</dt>
              <dd>{l.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
