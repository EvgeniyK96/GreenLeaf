/**
 * Приём заявок с формы (Vercel Function, Node.js runtime).
 * Секреты только в переменных окружения Vercel, в клиент не попадают:
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID — куда доставлять заявку;
 *   ALLOWED_ORIGIN (необязательно) — например https://example.ru, чужие Origin отклоняются.
 * Клиент: VITE_FORM_ENDPOINT=/api/lead
 *
 * ВНИМАНИЕ (152-ФЗ): доставка в Telegram = передача данных за рубеж. Перед запуском согласуйте
 * канал с юристом или замените отправку на сервер/CRM в РФ (см. content/COMPLIANCE.md).
 */

type Lead = {
  step: 'meet' | 'register'
  name: string
  contact: string
  city: string
  interest: string
  consent: true
  page?: string
  website?: string
}

const INTERESTS: Record<string, string> = {
  buy: 'Покупки для себя и семьи',
  team: 'Команда и бонусы',
  center: 'Сервисный центр',
  retail: 'Магазин или маркетплейс',
  unsure: 'Пока не знаю',
}

const hits = new Map<string, number[]>()
const WINDOW_MS = 10 * 60 * 1000
const LIMIT = 5

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  list.push(now)
  hits.set(ip, list)
  return list.length > LIMIT
}

const str = (v: unknown, min: number, max: number) =>
  typeof v === 'string' && v.trim().length >= min && v.trim().length <= max ? v.trim() : null

function parse(body: unknown): Lead | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  const name = str(b.name, 2, 60)
  const contact = str(b.contact, 5, 40)
  const city = str(b.city, 2, 60)
  const step = b.step === 'meet' || b.step === 'register' ? b.step : null
  const interest = typeof b.interest === 'string' && b.interest in INTERESTS ? b.interest : null
  if (!name || !contact || !city || !step || !interest || b.consent !== true) return null
  return {
    name,
    contact,
    city,
    step,
    interest,
    consent: true,
    page: typeof b.page === 'string' ? b.page.slice(0, 200) : undefined,
    website: typeof b.website === 'string' ? b.website : '',
  }
}

export async function POST(request: Request): Promise<Response> {
  const allowed = process.env.ALLOWED_ORIGIN
  const origin = request.headers.get('origin')
  if (allowed && origin !== allowed) return json(403, { ok: false, error: 'origin' })

  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown'
  if (rateLimited(ip)) return json(429, { ok: false, error: 'rate_limited' })

  const raw = await request.text()
  if (raw.length > 4096) return json(413, { ok: false, error: 'too_large' })

  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return json(400, { ok: false, error: 'bad_json' })
  }
  const lead = parse(data)
  if (!lead) return json(422, { ok: false, error: 'invalid' })
  // Ловушка для ботов: отвечаем «успехом», но ничего не отправляем.
  if (lead.website) return json(200, { ok: true })

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return json(503, { ok: false, error: 'not_configured' })

  const text = [
    'Новая заявка GreenLeaf',
    `Шаг: ${lead.step === 'meet' ? 'Встреча' : 'Регистрация по ID'}`,
    `Имя: ${lead.name}`,
    `Контакт: ${lead.contact}`,
    `Город: ${lead.city}`,
    `Интерес: ${INTERESTS[lead.interest]}`,
    'Согласие на обработку ПДн: да',
    lead.page ? `Страница: ${lead.page}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    })
    if (!res.ok) return json(502, { ok: false, error: 'delivery_failed' })
  } catch {
    return json(502, { ok: false, error: 'delivery_failed' })
  }
  return json(200, { ok: true })
}
