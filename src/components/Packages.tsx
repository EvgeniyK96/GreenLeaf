import { useRef, type PointerEvent } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { packagesCopy as copy } from '../content/copy'
import { packages, type BusinessPackage } from '../content/packages'
import { planPage } from '../content/site'
import { int } from '../lib/format'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { Accordion } from './Accordion'
import ui from './ui.module.css'
import styles from './Packages.module.css'

/** Карточка-пластина: лёгкий 3D-наклон за курсором (CSS-перспектива, без WebGL). */
function PackageCard({ p, tilt }: { p: BusinessPackage; tilt: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 220, damping: 20 })
  const sry = useSpring(ry, { stiffness: 220, damping: 20 })

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (!tilt || e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    ry.set((x - 0.5) * 10)
    rx.set((0.5 - y) * 8)
    ref.current.style.setProperty('--mx', `${x * 100}%`)
    ref.current.style.setProperty('--my', `${y * 100}%`)
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <motion.article
      ref={ref}
      className={`${styles.card} ${styles[p.id]}`}
      style={tilt ? { rotateX: srx, rotateY: sry, transformPerspective: 900 } : undefined}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-labelledby={`pkg-${p.id}`}
    >
      <span className={styles.sheen} aria-hidden="true" />
      <header className={styles.head}>
        <h3 id={`pkg-${p.id}`} className={styles.name}>
          {p.name}
        </h3>
      </header>
      <p className={styles.pv}>
        <span className={styles.pvNum}>{int(p.pv)}</span> PV
      </p>
      <dl className={styles.facts}>
        <div>
          <dt>Подарочные купоны</dt>
          <dd className="tnum">{int(p.coupons)}</dd>
        </div>
        <div>
          <dt>Ориентир цены</dt>
          <dd>{p.priceHint ?? 'уточняется в центре'}</dd>
        </div>
      </dl>
      <p className={styles.fit}>{p.fit}</p>
      <Accordion
        headingLevel={4}
        items={[
          {
            id: `rates-${p.id}`,
            title: copy.ratesToggle,
            content: (
              <>
              <dl className={styles.rates}>
                <div>
                  <dt>Командный бонус GB</dt>
                  <dd>
                    {p.gbRate}, не более {p.gbLimit} в день
                  </dd>
                </div>
                <div>
                  <dt>Бонус с продаж SB</dt>
                  <dd>{p.sbPair} за пару</dd>
                </div>
                {p.extraRate && (
                  <div>
                    <dt>Также</dt>
                    <dd>{p.extraRate}</dd>
                  </div>
                )}
              </dl>
                <p className={styles.ratesSrc}>
                  План: <a href={planPage(2)} target="_blank" rel="noopener">с. 2</a>,{' '}
                  <a href={planPage(4)} target="_blank" rel="noopener">с. 4</a>,{' '}
                  <a href={planPage(6)} target="_blank" rel="noopener">с. 6</a>
                </p>
              </>
            ),
          },
        ]}
      />
    </motion.article>
  )
}

export function Packages() {
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)')
  const reduce = useReducedMotion()
  const tilt = fine && !reduce
  const groups = [
    { title: 'Без ранга', items: packages.filter((p) => p.rank !== 'VIP') },
    { title: 'VIP', items: packages.filter((p) => p.rank === 'VIP') },
  ]
  return (
    <section id="nabory" className={ui.section} aria-labelledby="packages-title">
      <div className={ui.container}>
        <h2 id="packages-title" className={ui.h2}>
          {copy.title}
        </h2>
        <p className={ui.lead}>{copy.lead}</p>

        <aside className={styles.hint} aria-labelledby="pkg-hint">
          <h3 id="pkg-hint" className={styles.hintTitle}>
            {copy.hintTitle}
          </h3>
          <p>{copy.hint}</p>
        </aside>

        {groups.map((g) => (
          <div key={g.title} className={styles.group}>
            <h3 className={styles.groupTitle}>{g.title}</h3>
            <div className={styles.cards} role="list">
              {g.items.map((p) => (
                <div key={p.id} role="listitem" className={styles.cell}>
                  <PackageCard p={p} tilt={tilt} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <p className={`${ui.note} ${styles.note}`}>{copy.note}</p>
      </div>
    </section>
  )
}
