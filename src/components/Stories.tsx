import { stories, storiesCopy } from '../content/stories'
import ui from './ui.module.css'
import styles from './Stories.module.css'

/** Скрыт, пока нет реальных историй с согласием героев (правило 4 CLAUDE.md). */
export function Stories() {
  if (stories.length === 0) return null
  return (
    <section id="istorii" className={ui.section} aria-labelledby="stories-title">
      <div className={ui.container}>
        <h2 id="stories-title" className={ui.h2}>
          {storiesCopy.title}
        </h2>
        <p className={ui.lead}>{storiesCopy.lead}</p>
        <ul className={styles.list}>
          {stories.map((s) => (
            <li key={s.name + s.city} className={styles.card}>
              {s.photo && <img src={s.photo} alt={`${s.name}, ${s.city}`} loading="lazy" width={800} height={600} />}
              <h3>
                {s.name}, {s.city}
              </h3>
              <p>
                <b>С чего начинал(а):</b> {s.started}
              </p>
              <p>
                <b>Что изменилось:</b> {s.changed}
              </p>
              {s.videoUrl && (
                <a href={s.videoUrl} target="_blank" rel="noopener">
                  Смотреть видео
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
