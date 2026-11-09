import { hero } from '../content/copy'
import { owner } from '../content/owner'
import { HeroVisual } from '../three/HeroVisual'
import ui from './ui.module.css'
import styles from './Hero.module.css'

/** Первый экран: листья — живой фон на всю ширину, текст и кнопки по центру. */
export function Hero() {
  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <HeroVisual />
      <div className={`${ui.container} ${styles.inner}`}>
        <p className={styles.intro}>
          {hero.intro} {owner.name}.
        </p>
        <h1 id="hero-title" className={styles.title}>
          {hero.title}
        </h1>
        <p className={styles.lead}>{hero.lead}</p>
        <div className={`${ui.actions} ${styles.actions} ${styles.seq}`} style={{ ['--seq' as string]: '0ms' }}>
          <a href="#zayavka" className={`${ui.btn} ${ui.primary}`} data-step="meet">
            {hero.ctaMeet}
          </a>
          <a href="#zayavka" className={`${ui.btn} ${ui.secondary} ${styles.secondary}`} data-step="register">
            {hero.ctaRegister}
          </a>
        </div>
        <ul className={`${styles.proof} ${styles.seq}`} style={{ ['--seq' as string]: '140ms' }}>
          {hero.proof.map((p) => (
            <li key={p.value}>
              <span className={styles.proofValue}>{p.value}</span>
              <span className={styles.proofLabel}>{p.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
