import { paths } from '../content/copy'
import ui from './ui.module.css'
import styles from './Paths.module.css'

/** Три пути как ступени: это реальная последовательность (покупатель → лидер → центр). */
export function Paths() {
  return (
    <section id="puti" className={`${ui.section} ${styles.section}`} aria-labelledby="paths-title">
      <div className={ui.container}>
        <h2 id="paths-title" className={ui.h2}>
          {paths.title}
        </h2>
        <p className={ui.lead}>{paths.lead}</p>
        <ol className={styles.steps}>
          {paths.items.map((p, i) => (
            <li key={p.title} className={styles.step} style={{ ['--i' as string]: i }}>
              <span className={styles.num} aria-hidden="true">
                {i + 1}
              </span>
              <h3 className={styles.title}>{p.title}</h3>
              <p>{p.text}</p>
              <p className={styles.fit}>{p.fit}</p>
            </li>
          ))}
        </ol>
        <p className={styles.retail}>
          {paths.retailNote}{' '}
          <a href="#voprosy" className={ui.textLink}>
            {paths.retailLink}
          </a>
        </p>
      </div>
    </section>
  )
}
