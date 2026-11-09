import { steps } from '../content/copy'
import { owner } from '../content/owner'
import { setLeadStep } from '../lib/leadStore'
import { MeetPlace, Ph } from './Ph'
import ui from './ui.module.css'
import styles from './Steps.module.css'

export function Steps() {
  return (
    <section id="start" className={ui.section} aria-labelledby="steps-title">
      <div className={ui.container}>
        <h2 id="steps-title" className={ui.h2}>
          {steps.title}
        </h2>
        <ol className={styles.list}>
          {steps.items.map((s, i) => (
            <li key={i} className={styles.step}>
              <span className={styles.node} aria-hidden="true">
                {i + 1}
              </span>
              {s.kind === 'branch' ? (
                <div className={styles.fork}>
                  <div className={styles.branch}>
                    <p className={styles.branchLabel}>{s.a.label}</p>
                    <h3 className={styles.title}>
                      {s.a.title}{' '}
                      <span className={styles.titleSub}>
                        <MeetPlace />
                      </span>
                    </h3>
                    <p>{s.a.text}</p>
                    <a href="#zayavka" className={`${ui.btn} ${ui.primary} ${ui.small}`} onClick={() => setLeadStep('meet')}>
                      {s.a.cta}
                    </a>
                  </div>
                  <div className={styles.branch}>
                    <p className={styles.branchLabel}>{s.b.label}</p>
                    <h3 className={styles.title}>{s.b.title}</h3>
                    <p>{s.b.text}</p>
                    <a
                      href="#zayavka"
                      className={`${ui.btn} ${ui.secondary} ${ui.small}`}
                      onClick={() => setLeadStep('register')}
                    >
                      {s.b.cta}
                    </a>
                  </div>
                </div>
              ) : (
                <div className={styles.body}>
                  <h3 className={styles.title}>
                    {s.title}
                    {i === steps.items.length - 1 && (
                      <>
                        {': '}
                        <span className={styles.id}>
                          <Ph value={owner.id} fallback="ID уточняется" />
                        </span>
                      </>
                    )}
                  </h3>
                  <p>{s.text}</p>
                </div>
              )}
            </li>
          ))}
        </ol>
        <p className={styles.prepare}>{steps.prepare}</p>
      </div>
    </section>
  )
}
