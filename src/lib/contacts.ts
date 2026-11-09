import { owner } from '../content/owner'
import { isFilled } from '../content/placeholders'

export function telegramUrl(): string | null {
  return isFilled(owner.telegram) ? `https://t.me/${owner.telegram.replace(/^@/, '')}` : null
}

export function whatsappUrl(text?: string): string | null {
  if (!isFilled(owner.whatsapp)) return null
  const digits = owner.whatsapp.replace(/\D/g, '')
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

export function phoneUrl(): string | null {
  return isFilled(owner.phone) ? `tel:${owner.phone.replace(/[^\d+]/g, '')}` : null
}
