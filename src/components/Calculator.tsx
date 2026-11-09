import { useEffect, useId, useState } from 'react'
import { calculator as copy } from '../content/copy'
import { site } from '../content/site'
import { rub } from '../lib/format'
import { setLeadStep } from '../lib/leadStore'
import { AnimatedRub } from './AnimatedNumber'
import ui from './ui.module.css'
import styles from './Calculator.module.css'

const clamp = (n: number) => Math.min(copy.max, Math.max(copy.min, n))

export function Calculator() {
  const [amount, setAmount] = useState(copy.initial)
  const [exact, setExact] = useState(String(copy.initial))
  const [announce, setAnnounce] = useState('')
  const rangeId = useId()
  const exactId = useId()

  const partner = amount * site.partnerPriceRatio
  const saved = amount - partner
  const year = saved * 12
  const fill = ((amount - copy.min) / (copy.max - copy.min)) * 100

  /* Для скринридера — итог после паузы, а не на каждом шаге ползунка */
  useEffect(() => {
    const t = window.setTimeout(
      () => setAnnounce(`Экономия ${rub(saved)} в месяц, ${rub(year)} за год`),
      700,
    )
    return () => window.clearTimeout(t)
  }, [saved, year])

  const set = (n: number) => {
    const v = clamp(n)
    setAmount(v)
    setExact(String(v))
  }

  return (
    <section id="kalkulyator" className={`${ui.section} ${styles.section}`} aria-labelledby="calc-title">
      <div className={`${ui.container} ${styles.grid}`}>
        <div className={styles.controls}>
          <h2 id="calc-title" className={ui.h2}>
            {copy.title}
          </h2>
          <p className={ui.lead}>{copy.lead}</p>

          <label htmlFor={rangeId} className={styles.label}>
            {copy.inputLabel}
          </label>
          <p className={styles.amount} aria-hidden="true">
            <AnimatedRub value={amount} />
          </p>
          <input
            id={rangeId}
            type="range"
            className={styles.range}
            min={copy.min}
            max={copy.max}
            step={copy.step}
            value={amount}
            aria-valuetext={rub(amount)}
            style={{ ['--fill' as string]: `${fill}%` }}
            onChange={(e) => set(Number(e.target.value))}
          />
          <div className={styles.scale} aria-hidden="true">
            <span>{rub(copy.min)}</span>
            <span>{rub(copy.max)}</span>
          </div>

          <div className={styles.presets} role="group" aria-label="Быстрый выбор суммы">
            {copy.presets.map((p) => (
              <button
                key={p}
                type="button"
                className={`${styles.preset} ${amount === p ? styles.presetOn : ''}`}
                aria-pressed={amount === p}
                onClick={() => set(p)}
              >
                {rub(p)}
              </button>
            ))}
          </div>

          <div className={styles.exact}>
            <label htmlFor={exactId}>Или введите точную сумму, ₽</label>
            <input
              id={exactId}
              inputMode="numeric"
              autoComplete="off"
              value={exact}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 6)
                setExact(digits)
                if (digits) setAmount(clamp(Number(digits)))
              }}
              onBlur={() => setExact(String(amount))}
            />
          </div>
        </div>

        <figure className={styles.receipt} aria-labelledby="receipt-title">
          <figcaption id="receipt-title" className={styles.receiptHead}>
            <span className={styles.receiptTitle}>{copy.receiptTitle}</span>
            <span className={styles.receiptDate}>цены каталога на {site.pricesDate}</span>
          </figcaption>
          <dl className={styles.rows}>
            <div className={styles.row}>
              <dt>{copy.rowRetail}</dt>
              <dd className="tnum">
                <AnimatedRub value={amount} />
              </dd>
            </div>
            <div className={styles.row}>
              <dt>{copy.rowPartner}</dt>
              <dd className="tnum">
                <AnimatedRub value={partner} />
              </dd>
            </div>
            <div className={`${styles.row} ${styles.total}`}>
              <dt>{copy.rowSaved}</dt>
              <dd className="tnum">
                <AnimatedRub value={saved} />
              </dd>
            </div>
            <div className={`${styles.row} ${styles.year}`}>
              <dt>{copy.rowYear}</dt>
              <dd className="tnum">
                <AnimatedRub value={year} />
              </dd>
            </div>
          </dl>
          <div className={styles.check}>
            <p className={styles.checkTitle}>{copy.checkTitle}</p>
            <ul>
              {copy.checkItems.map((it) => (
                <li key={it.name}>
                  <span>{it.name}</span>
                  <span className="tnum">
                    <s aria-label={`розница ${rub(it.retail)}`}>{rub(it.retail)}</s>{' '}
                    <b>{rub(it.partner)}</b>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="visually-hidden" aria-live="polite">
            {announce}
          </p>
        </figure>

        <div className={styles.after}>
          <p className={ui.note}>{copy.note}</p>
          <a href="#zayavka" className={`${ui.btn} ${ui.primary}`} onClick={() => setLeadStep('meet')}>
            {copy.cta}
          </a>
        </div>
      </div>
    </section>
  )
}
