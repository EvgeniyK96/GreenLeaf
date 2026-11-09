import { scale } from '../content/copy'
import { owner } from '../content/owner'
import { isFilled, SHOW_PLACEHOLDERS } from '../content/placeholders'
import { Ph } from './Ph'
import ui from './ui.module.css'
import styles from './Scale.module.css'

export function Scale() {
  const photos = scale.photos.filter((p) => isFilled(p.key) || SHOW_PLACEHOLDERS)
  const hasSchedule = isFilled(scale.schedule) || SHOW_PLACEHOLDERS
  return (
    <section id="podderzhka" className={ui.section} aria-labelledby="scale-title">
      <div className={ui.container}>
        <h2 id="scale-title" className={ui.h2} data-reveal="up">
          {scale.title}
        </h2>
        <div className={styles.grid}>
          <div className={styles.col} data-reveal="left">
            <h3 className={styles.h3}>{scale.companyTitle}</h3>
            <ul className={styles.facts}>
              {scale.companyFacts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            {photos.length > 0 && (
              <ul className={styles.photos}>
                {photos.map((p) =>
                  isFilled(p.key) ? (
                    <li key={p.label}>
                      <img src={p.key} alt={p.label} loading="lazy" decoding="async" width={480} height={360} />
                    </li>
                  ) : (
                    <li key={p.label} className={styles.photoPh}>
                      <span>{p.label}</span>
                      <Ph value={p.key} />
                    </li>
                  ),
                )}
              </ul>
            )}
            <h3 className={styles.h3}>{scale.trainingTitle}</h3>
            <p>{scale.training}</p>
            {hasSchedule && (
              <p className={styles.schedule}>
                {scale.scheduleLabel} <Ph value={scale.schedule} />
              </p>
            )}
          </div>
          <div className={`${styles.col} ${styles.mentor}`} data-reveal="right" style={{ ['--i' as string]: 2 }}>
            <h3 className={styles.h3}>{scale.mentorTitle}</h3>
            <p className={styles.mentorName}>{owner.name}, ваш наставник в программе</p>
            <ul className={styles.checks}>
              {scale.mentor.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
            <a href="#zayavka" className={`${ui.btn} ${ui.primary}`}>
              Познакомиться
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
