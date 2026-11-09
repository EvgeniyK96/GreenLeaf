import { paths } from '../content/copy'
import ui from './ui.module.css'
import styles from './Paths.module.css'

/**
 * Три пути как ступени, идущие вниз: первый шаг сверху, третий ниже (реальная последовательность:
 * покупатель → лидер → центр). Ступени появляются строго по очереди при прокрутке.
 */
export function Paths() {
  return (
    <section id="puti" className={`${ui.section} ${styles.section}`} aria-labelledby="paths-title">
      <div className={ui.container}>
        <h2 id="paths-title" className={ui.h2} data-reveal="up">
          {paths.title}
        </h2>
        <p className={ui.lead} data-reveal="up" style={{ ['--i' as string]: 1 }}>
          {paths.lead}
        </p>
        <ol className={styles.steps}>
          {paths.items.map((p, i) => (
            <li
              key={p.title}
              className={styles.step}
              data-reveal="drop"
              style={{ ['--step' as string]: i, ['--i' as string]: 1 + i * 3 }}
            >
              <span className={styles.num} aria-hidden="true">
                {i + 1}
              </span>
              <h3 className={styles.title}>{p.title}</h3>
              <p>{p.text}</p>
              <p className={styles.fit}>{p.fit}</p>
            </li>
          ))}
        </ol>
        <p className={styles.retail} data-reveal="fade" style={{ ['--i' as string]: 9 }}>
          {paths.retailNote}{' '}
          <a href="#voprosy" className={ui.textLink}>
            {paths.retailLink}
          </a>
        </p>
      </div>
    </section>
  )
}
