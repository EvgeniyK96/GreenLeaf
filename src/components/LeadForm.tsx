import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { form as copy } from '../content/copy'
import { owner } from '../content/owner'
import { isFilled, SHOW_PLACEHOLDERS } from '../content/placeholders'
import { site } from '../content/site'
import { copyText } from '../lib/clipboard'
import { phoneUrl, telegramUrl, whatsappUrl } from '../lib/contacts'
import { setLeadStep, useLeadStep, type LeadStep } from '../lib/leadStore'
import { MeetPlace, Ph } from './Ph'
import ui from './ui.module.css'
import styles from './LeadForm.module.css'

type Field = 'name' | 'contact' | 'city' | 'interest' | 'consent'
type Values = { name: string; contact: string; city: string; interest: string; consent: boolean; website: string }
type Status = 'idle' | 'sending' | 'success' | 'error-network' | 'error-server' | 'not-configured'

/** Адрес приёма заявок (серверная функция). Секретов в клиенте нет: только URL. */
const ENDPOINT = (import.meta.env.VITE_FORM_ENDPOINT as string | undefined)?.trim() || ''
const MIN_FILL_MS = 2500

const TG_RE = /^@?[a-zA-Z][a-zA-Z0-9_]{4,31}$/

function validate(v: Values): Partial<Record<Field, string>> {
  const e: Partial<Record<Field, string>> = {}
  const name = v.name.trim()
  if (name.length < 2 || name.length > 60) e.name = copy.errors.name
  const contact = v.contact.trim()
  const digits = contact.replace(/\D/g, '')
  const isPhone = /^[\d\s()+-]+$/.test(contact) && digits.length >= 10 && digits.length <= 15
  if (!isPhone && !TG_RE.test(contact)) e.contact = copy.errors.contact
  const city = v.city.trim()
  if (city.length < 2 || city.length > 60) e.city = copy.errors.city
  if (!v.interest) e.interest = copy.errors.interest
  if (!v.consent) e.consent = copy.errors.consent
  return e
}

function stepLabel(step: LeadStep) {
  return step === 'meet' ? copy.stepMeet : copy.stepRegister
}

function requestText(step: LeadStep, v: Values) {
  const interest = copy.interests.find((i) => i.value === v.interest)?.label ?? '—'
  return [
    'Здравствуйте! Заявка со страницы GreenLeaf Family.',
    `Шаг: ${stepLabel(step)}`,
    `Имя: ${v.name.trim()}`,
    `Контакт: ${v.contact.trim()}`,
    `Город: ${v.city.trim()}`,
    `Интерес: ${interest}`,
  ].join('\n')
}

const EMPTY: Values = { name: '', contact: '', city: '', interest: '', consent: false, website: '' }

type Variant = 'section' | 'modal'

/** Форма заявки: блок внизу страницы (variant="section") или содержимое окна (variant="modal"). */
export function LeadForm({ variant = 'section', titleId }: { variant?: Variant; titleId?: string }) {
  const modal = variant === 'modal'
  const step = useLeadStep()
  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [copied, setCopied] = useState<'' | 'id' | 'request'>('')
  const startedAt = useRef(0)
  const sending = useRef(false)
  const fieldRefs = useRef<Partial<Record<Field, HTMLElement | null>>>({})
  const statusRef = useRef<HTMLDivElement>(null)
  const uid = useId()
  const id = (f: string) => `${uid}-${f}`

  useEffect(() => {
    startedAt.current = Date.now()
    // Блок гидрируется лениво: если человек успел что-то ввести в готовый HTML до гидрации,
    // переносим эти значения из DOM в состояние, чтобы они не потерялись.
    const r = fieldRefs.current
    const read = (el: HTMLElement | null | undefined) =>
      el instanceof HTMLInputElement || el instanceof HTMLSelectElement ? el.value : ''
    const typed: Partial<Values> = {}
    if (read(r.name)) typed.name = read(r.name)
    if (read(r.contact)) typed.contact = read(r.contact)
    if (read(r.city)) typed.city = read(r.city)
    if (read(r.interest)) typed.interest = read(r.interest)
    if (r.consent instanceof HTMLInputElement && r.consent.checked) typed.consent = true
    if (Object.keys(typed).length > 0) {
      startedAt.current = Date.now() - MIN_FILL_MS // человек начал заполнять до гидрации
      // eslint-disable-next-line react/set-state-in-effect -- синхронизация с DOM, заполненным до гидрации
      setValues((v) => ({ ...v, ...typed }))
    }
  }, [])

  useEffect(() => {
    if (status === 'success' || status.startsWith('error') || status === 'not-configured') statusRef.current?.focus()
  }, [status])

  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(''), 2200)
    return () => window.clearTimeout(t)
  }, [copied])

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (sending.current) return
    const found = validate(values)
    setErrors(found)
    const order: Field[] = ['name', 'contact', 'city', 'interest', 'consent']
    const first = order.find((f) => found[f])
    if (first) {
      fieldRefs.current[first]?.focus()
      return
    }
    // Антиспам: скрытое поле заполнено или форма «заполнена» быстрее человека — тихо не отправляем.
    if (values.website || Date.now() - startedAt.current < MIN_FILL_MS) {
      setStatus('success')
      return
    }
    if (!ENDPOINT) {
      setStatus('not-configured')
      return
    }
    sending.current = true
    setStatus('sending')
    const ctrl = new AbortController()
    const timer = window.setTimeout(() => ctrl.abort(), 12000)
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step,
          name: values.name.trim(),
          contact: values.contact.trim(),
          city: values.city.trim(),
          interest: values.interest,
          consent: true,
          consentVersion: site.consentUrl,
          page: window.location.href.split('#')[0],
          website: values.website,
        }),
        signal: ctrl.signal,
      })
      setStatus(res.ok ? 'success' : 'error-server')
    } catch {
      setStatus('error-network')
    } finally {
      window.clearTimeout(timer)
      sending.current = false
    }
  }

  const reset = () => {
    setValues(EMPTY)
    setErrors({})
    setStatus('idle')
    startedAt.current = Date.now()
  }

  const idFilled = isFilled(owner.id)
  const tg = telegramUrl()
  const wa = whatsappUrl(status === 'not-configured' || status.startsWith('error') ? requestText(step, values) : undefined)
  const tel = phoneUrl()
  const showFallbackCopy = status === 'not-configured' || status.startsWith('error')

  const statusText =
    status === 'error-network'
      ? copy.errorNetwork
      : status === 'error-server'
        ? copy.errorServer
        : status === 'not-configured'
          ? copy.notConfigured
          : ''

  const idBox = (
    <div className={`${styles.idBox} ${modal ? styles.light : ''}`}>
      <p className={styles.idLabel}>{copy.idLabel}</p>
      <p className={idFilled || SHOW_PLACEHOLDERS ? styles.idValue : styles.idMissing}>
        <Ph value={owner.id} fallback={copy.idMissing} />
      </p>
      <button
        type="button"
        className={`${ui.btn} ${modal ? ui.primary : ui.onDark} ${ui.small}`}
        disabled={!idFilled}
        onClick={async () => {
          if (await copyText(owner.id)) setCopied('id')
        }}
      >
        {copied === 'id' ? copy.copiedId : copy.copyId}
      </button>
      <p className={styles.live} aria-live="polite">
        {copied === 'id' ? copy.copiedId : ''}
      </p>
    </div>
  )

  const direct = (tg || wa || tel || SHOW_PLACEHOLDERS) && (
    <div className={`${styles.direct} ${modal ? styles.light : ''}`}>
      <p className={styles.directLabel}>{copy.direct}</p>
      <div className={styles.directLinks}>
        {tg ? (
          <a className={`${ui.btn} ${modal ? ui.secondary : ui.ghostDark} ${ui.small}`} href={tg} target="_blank" rel="noopener">
            Telegram
          </a>
        ) : (
          SHOW_PLACEHOLDERS && (
            <span className={styles.directPh}>
              Telegram: <Ph value={owner.telegram} />
            </span>
          )
        )}
        {wa ? (
          <a className={`${ui.btn} ${modal ? ui.secondary : ui.ghostDark} ${ui.small}`} href={wa} target="_blank" rel="noopener">
            WhatsApp
          </a>
        ) : (
          SHOW_PLACEHOLDERS && (
            <span className={styles.directPh}>
              WhatsApp: <Ph value={owner.whatsapp} />
            </span>
          )
        )}
        {tel ? (
          <a className={`${ui.btn} ${modal ? ui.secondary : ui.ghostDark} ${ui.small}`} href={tel}>
            Позвонить
          </a>
        ) : (
          SHOW_PLACEHOLDERS && (
            <span className={styles.directPh}>
              Телефон: <Ph value={owner.phone} />
            </span>
          )
        )}
      </div>
    </div>
  )

  const card = (
    <div className={modal ? styles.cardFlat : styles.card}>
      {status === 'success' ? (
        <div ref={statusRef} tabIndex={-1} className={styles.success} role="status">
          <p className={styles.successTitle}>{copy.success}</p>
          <p>
            {owner.name} ответит
            {isFilled(owner.responseTime) ? ` в течение ${owner.responseTime}` : ''} в выбранном мессенджере.{' '}
            {!isFilled(owner.responseTime) && SHOW_PLACEHOLDERS && <Ph value={owner.responseTime} />}
          </p>
          <button type="button" className={`${ui.btn} ${ui.secondary} ${ui.small}`} onClick={reset}>
            {copy.successMore}
          </button>
        </div>
      ) : (
        <form noValidate onSubmit={onSubmit} aria-describedby={id('privacy')}>
          {/* Без action и без name у полей: если нажать «Отправить» до гидрации, браузер не
              отправит личные данные в адресной строке. */}
          <fieldset className={styles.steps}>
            <legend className={styles.legend}>{copy.stepLegend}</legend>
            {(['meet', 'register'] as const).map((s) => (
              <label key={s} className={`${styles.stepOption} ${step === s ? styles.stepOn : ''}`}>
                <input
                  type="radio"
                  name="step"
                  value={s}
                  checked={step === s}
                  onChange={() => setLeadStep(s)}
                />
                <span className={styles.stepTitle}>{s === 'meet' ? copy.stepMeet : copy.stepRegister}</span>
                <span className={styles.stepHint}>
                  {s === 'meet' ? <MeetPlace /> : copy.stepRegisterHint}
                </span>
              </label>
            ))}
          </fieldset>

          <div className={styles.field}>
            <label htmlFor={id('name')}>{copy.name}</label>
            <input
              id={id('name')}
              ref={(el) => {
                fieldRefs.current.name = el
              }}
              data-field="name"
              autoComplete="given-name"
              maxLength={60}
              value={values.name}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? id('name-err') : undefined}
              onChange={(e) => set('name', e.target.value)}
            />
            {errors.name && (
              <p id={id('name-err')} className={styles.error}>
                {errors.name}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor={id('contact')}>{copy.contact}</label>
            <input
              id={id('contact')}
              ref={(el) => {
                fieldRefs.current.contact = el
              }}
              data-field="contact"
              autoComplete="tel"
              maxLength={40}
              value={values.contact}
              aria-invalid={!!errors.contact}
              aria-describedby={`${id('contact-hint')}${errors.contact ? ` ${id('contact-err')}` : ''}`}
              onChange={(e) => set('contact', e.target.value)}
            />
            <p id={id('contact-hint')} className={styles.hint}>
              {copy.contactHint}
            </p>
            {errors.contact && (
              <p id={id('contact-err')} className={styles.error}>
                {errors.contact}
              </p>
            )}
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor={id('city')}>{copy.city}</label>
              <input
                id={id('city')}
                ref={(el) => {
                  fieldRefs.current.city = el
                }}
                data-field="city"
                autoComplete="address-level2"
                maxLength={60}
                value={values.city}
                aria-invalid={!!errors.city}
                aria-describedby={errors.city ? id('city-err') : undefined}
                onChange={(e) => set('city', e.target.value)}
              />
              {errors.city && (
                <p id={id('city-err')} className={styles.error}>
                  {errors.city}
                </p>
              )}
            </div>
            <div className={styles.field}>
              <label htmlFor={id('interest')}>{copy.interest}</label>
              <select
                id={id('interest')}
                ref={(el) => {
                  fieldRefs.current.interest = el
                }}
                data-field="interest"
                value={values.interest}
                aria-invalid={!!errors.interest}
                aria-describedby={errors.interest ? id('interest-err') : undefined}
                onChange={(e) => set('interest', e.target.value)}
              >
                <option value="">Выберите</option>
                {copy.interests.map((i) => (
                  <option key={i.value} value={i.value}>
                    {i.label}
                  </option>
                ))}
              </select>
              {errors.interest && (
                <p id={id('interest-err')} className={styles.error}>
                  {errors.interest}
                </p>
              )}
            </div>
          </div>

          {/* Ловушка для ботов: людям не видна и недоступна с клавиатуры */}
          <div className={styles.trap} aria-hidden="true">
            <label htmlFor={id('website')}>Сайт</label>
            <input
              id={id('website')}
              data-field="website"
              tabIndex={-1}
              autoComplete="off"
              value={values.website}
              onChange={(e) => set('website', e.target.value)}
            />
          </div>

          <div className={styles.consent}>
            <input
              id={id('consent')}
              ref={(el) => {
                fieldRefs.current.consent = el
              }}
              type="checkbox"
              checked={values.consent}
              aria-invalid={!!errors.consent}
              aria-describedby={errors.consent ? id('consent-err') : undefined}
              onChange={(e) => set('consent', e.target.checked)}
            />
            <label htmlFor={id('consent')}>{copy.consent}</label>
          </div>
          <p id={id('privacy')} className={styles.docs}>
            <a href={site.consentUrl} target="_blank" rel="noopener">
              {copy.consentDoc}
            </a>
            <a href={site.privacyUrl} target="_blank" rel="noopener">
              {copy.privacyDoc}
            </a>
          </p>
          {errors.consent && (
            <p id={id('consent-err')} className={styles.error}>
              {errors.consent}
            </p>
          )}

          <button
            type="submit"
            className={`${ui.btn} ${ui.primary} ${styles.submit}`}
            disabled={status === 'sending'}
            aria-busy={status === 'sending'}
          >
            {status === 'sending' ? copy.sending : copy.submit}
          </button>
          <p className={styles.hint}>{copy.noPassport}</p>

          {statusText && (
            <div ref={statusRef} tabIndex={-1} className={styles.problem} role="alert">
              <p>{statusText}</p>
              {showFallbackCopy && (
                <button
                  type="button"
                  className={`${ui.btn} ${ui.secondary} ${ui.small}`}
                  onClick={async () => {
                    if (await copyText(requestText(step, values))) setCopied('request')
                  }}
                >
                  {copied === 'request' ? copy.copiedRequest : copy.copyRequest}
                </button>
              )}
            </div>
          )}
        </form>
      )}
    </div>
  )

  if (modal) {
    return (
      <div className={styles.modalBody}>
        <h2 id={titleId} className={styles.modalTitle}>
          {copy.title}
        </h2>
        <p className={styles.modalLead}>{copy.lead}</p>
        {card}
        <div className={styles.modalExtras}>
          {idBox}
          {direct}
        </div>
      </div>
    )
  }

  return (
    <section id="zayavka" className={styles.section} aria-labelledby="form-title">
      <div className={`${ui.container} ${styles.grid}`}>
        <div className={styles.intro} data-reveal="left">
          <h2 id="form-title" className={`${ui.h2} ${styles.title}`}>
            {copy.title}
          </h2>
          <p className={styles.lead}>{copy.lead}</p>
          {idBox}
          {direct}
        </div>
        <div data-reveal="right" style={{ ['--i' as string]: 1 }}>
          {card}
        </div>
      </div>
    </section>
  )
}
