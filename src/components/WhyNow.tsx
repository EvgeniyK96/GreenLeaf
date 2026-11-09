import { why } from '../content/copy'
import ui from './ui.module.css'
import styles from './WhyNow.module.css'

export function WhyNow() {
  return (
    <section id="vygoda" className={ui.section} aria-labelledby="why-title">
      <div className={`${ui.container} ${styles.grid}`}>
        <div>
          <h2 id="why-title" className={ui.h2}>
            {why.title}
          </h2>
          <p className={ui.lead}>{why.lead}</p>
          <ul className={styles.basket} aria-label="Что обычно покупает семья">
            {why.basket.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <dl className={styles.layers}>
          {why.layers.map((l) => (
            <div key={l.title} className={styles.layer}>
              <dt>{l.title}</dt>
              <dd>{l.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
