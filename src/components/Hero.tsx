import { hero } from '../content/copy'
import { owner } from '../content/owner'
import { setLeadStep } from '../lib/leadStore'
import { HeroVisual } from '../three/HeroVisual'
import ui from './ui.module.css'
import styles from './Hero.module.css'

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
        <p className={styles.lead}>
          {hero.lead}
        </p>
        <div className={`${ui.actions} ${styles.actions} ${styles.seq}`} style={{ animationDelay: '120ms' }}>
          <a href="#zayavka" className={`${ui.btn} ${ui.primary}`} onClick={() => setLeadStep('meet')}>
            {hero.ctaMeet}
          </a>
          <a href="#zayavka" className={`${ui.btn} ${ui.secondary}`} onClick={() => setLeadStep('register')}>
            {hero.ctaRegister}
          </a>
        </div>
        <ul className={`${styles.proof} ${styles.seq}`} style={{ animationDelay: '240ms' }}>
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
