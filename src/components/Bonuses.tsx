import { useEffect, useRef, useState } from 'react'
import { useMotionValue, useScroll, useSpring } from 'motion/react'
import { bonusesCopy as copy, bonusGroups } from '../content/bonuses'
import { planPage, site } from '../content/site'
import { plural } from '../lib/format'
import { setLeadStep } from '../lib/leadStore'
import { GrowthVisual } from '../three/GrowthVisual'
import { Accordion } from './Accordion'
import ui from './ui.module.css'
import styles from './Bonuses.module.css'

function Pages({ pages }: { pages: number[] }) {
  return (
    <>
      {pages.map((p, i) => (
        <span key={p}>
          {i > 0 && ', '}
          <a href={planPage(p)} target="_blank" rel="noopener">
            с. {p}
          </a>
        </span>
      ))}
    </>
  )
}

export function Bonuses() {
  const groupsRef = useRef<HTMLDivElement>(null)
  const groupEls = useRef<(HTMLElement | null)[]>([])
  const [active, setActive] = useState(0)
  const activeMv = useMotionValue(0)
  const { scrollYProgress } = useScroll({ target: groupsRef, offset: ['start 0.8', 'end 0.55'] })
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 28, restDelta: 0.001 })

  useEffect(() => {
    const els = groupEls.current.filter(Boolean) as HTMLElement[]
    if (!els.length || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.index)
            setActive(i)
            activeMv.set(i)
          }
        })
      },
      { rootMargin: '-40% 0px -45% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [activeMv])

  const total = bonusGroups.reduce((n, g) => n + g.bonuses.length, 0)

  return (
    <section id="nachisleniya" className={styles.section} aria-labelledby="bonus-title">
      <div className={`${ui.container} ${styles.grid}`}>
        <div className={styles.visualCol}>
          <div className={styles.sticky}>
            <GrowthVisual progress={progress} activeGroup={activeMv} />
            <p className={styles.visualCaption}>
              {total} {plural(total, ['лист', 'листа', 'листьев'])} — {total} видов начислений: 1 за свои покупки, 6 за
              команду, 4 за лидерство
            </p>
          </div>
        </div>

        <div className={styles.content}>
          <h2 id="bonus-title" className={`${ui.h2} ${styles.title}`}>
            {copy.title}
          </h2>
          <p className={styles.lead}>{copy.lead}</p>

          <dl className={styles.terms}>
            {copy.terms.map((t) => (
              <div key={t.term}>
                <dt>{t.term}</dt>
                <dd>— {t.text}</dd>
              </div>
            ))}
          </dl>

          <div ref={groupsRef} className={styles.groups}>
            {bonusGroups.map((g, gi) => (
              <section
                key={g.id}
                ref={(el) => {
                  groupEls.current[gi] = el
                }}
                data-index={gi}
                className={`${styles.group} ${active === gi ? styles.groupActive : ''}`}
                aria-labelledby={`bonus-group-${g.id}`}
              >
                <p className={styles.count}>
                  {g.bonuses.length} {plural(g.bonuses.length, ['вид', 'вида', 'видов'])}
                </p>
                <h3 id={`bonus-group-${g.id}`} className={styles.groupTitle}>
                  {g.title}
                </h3>
                <p className={styles.groupLead}>{g.lead}</p>
                <Accordion
                  tone="dark"
                  headingLevel={4}
                  items={g.bonuses.map((b) => ({
                    id: b.id,
                    meta: b.code,
                    title: b.name,
                    content: (
                      <dl className={styles.details}>
                        <div>
                          <dt>{copy.labels.forWhat}</dt>
                          <dd>{b.forWhat}</dd>
                        </div>
                        <div>
                          <dt>{copy.labels.terms}</dt>
                          <dd>{b.terms}</dd>
                        </div>
                        <div>
                          <dt>{copy.labels.period}</dt>
                          <dd>{b.period}</dd>
                        </div>
                        {b.example && (
                          <div>
                            <dt>{copy.labels.example}</dt>
                            <dd className="tnum">{b.example} (справочно)</dd>
                          </div>
                        )}
                        <div>
                          <dt>{copy.labels.page}</dt>
                          <dd>
                            <Pages pages={b.pages} />
                          </dd>
                        </div>
                      </dl>
                    ),
                  }))}
                />
                {g.extra && (
                  <p className={styles.extra}>
                    {g.extra.text}
                    {g.extra.pages && (
                      <>
                        {' '}
                        (план, <Pages pages={g.extra.pages} />)
                      </>
                    )}
                  </p>
                )}
              </section>
            ))}
          </div>

          <p className={styles.note}>{copy.note}</p>
          <div className={`${ui.actions} ${styles.actions}`}>
            <a href={site.planPdf} target="_blank" rel="noopener" className={`${ui.btn} ${ui.onDark}`}>
              {copy.ctaPlan}
            </a>
            <a href="#zayavka" className={`${ui.btn} ${ui.ghostDark}`} onClick={() => setLeadStep('meet')}>
              {copy.ctaMeet}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
