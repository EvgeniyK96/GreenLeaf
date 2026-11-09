import { faq, faqCopy } from '../content/faq'
import { Accordion } from './Accordion'
import { wakeIsland } from '../lib/islands'
import ui from './ui.module.css'
import styles from './Faq.module.css'

export function Faq() {
  return (
    <section id="voprosy" className={`${ui.section} ${styles.section}`} aria-labelledby="faq-title">
      <div className={`${ui.container} ${styles.grid}`}>
        <div className={styles.side}>
          <h2 id="faq-title" className={ui.h2}>
            {faqCopy.title}
          </h2>
          <p className={ui.lead}>{faqCopy.lead}</p>
          <a href="#zayavka" onClick={() => wakeIsland('zayavka')} className={`${ui.btn} ${ui.secondary}`}>
            {faqCopy.cta}
          </a>
        </div>
        <Accordion items={faq.map((f) => ({ id: f.id, title: f.q, content: <p>{f.a}</p> }))} />
      </div>
    </section>
  )
}
