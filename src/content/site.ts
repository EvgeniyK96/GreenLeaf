/** Общие ссылки, даты и источники. */
export const site = {
  planPdf: '/docs/greenleaf-marketing-plan-2026.pdf',
  planDate: '24.09.2026',
  pricesDate: '09.11.2026',
  catalogUrl: 'https://greenleaf-company.ru/catalog',
  catalogHealthUrl: 'https://greenleaf-company.ru/catalog/zdorove',
  privacyUrl: '/privacy.html',
  consentUrl: '/consent.html',
  company: {
    phone: '8 (800) 333-79-76',
    phoneHref: 'tel:88003337976',
    email: 'info@greenleaf-global.com',
    site: 'greenleaf-global.com',
    siteUrl: 'https://greenleaf-global.com',
  },
  /** Коэффициент калькулятора: партнёрская цена / розничная (430 из 441 позиций = 0,5). */
  partnerPriceRatio: 0.5,
  catalogStats: {
    total: 441,
    exactHalf: 430,
    sections: 10,
    health: 66,
    minDiscount: 43,
    maxDiscount: 65,
  },
} as const

export const planPage = (page: number) => `${site.planPdf}#page=${page}`

export const nav = [
  { href: '#kalkulyator', label: 'Экономия' },
  { href: '#nachisleniya', label: 'Начисления' },
  { href: '#nabory', label: 'Наборы' },
  { href: '#voprosy', label: 'Вопросы' },
] as const
