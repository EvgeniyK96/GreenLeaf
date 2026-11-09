/** Стартовые наборы (бизнес-места): ПЛАН с. 2, ставки GB с. 4, SB с. 6; ориентиры цен — черновик. */

export type Metal = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'crown'

export type BusinessPackage = {
  id: Metal
  name: string
  rank: string
  pv: number
  coupons: number
  gbRate: string
  gbLimit: string
  sbPair: string
  /** Ориентир цены из материалов; null — нет данных. */
  priceHint: string | null
  fit: string
  extraRate?: string
}

export const packages: BusinessPackage[] = [
  {
    id: 'bronze',
    name: 'Бронза',
    rank: 'без ранга',
    pv: 55,
    coupons: 20580,
    gbRate: '5%',
    gbLimit: '100 $',
    sbPair: '16 $',
    priceHint: '≈ 7 000 ₽',
    fit: 'Попробовать продукцию и покупать по партнёрской цене.',
    extraRate: 'MB и MB 25% — с 1–10 уровня',
  },
  {
    id: 'silver',
    name: 'Серебро',
    rank: 'без ранга',
    pv: 110,
    coupons: 41160,
    gbRate: '6%',
    gbLimit: '180 $',
    sbPair: '16 $',
    priceHint: null,
    fit: 'Семье, которая регулярно берёт уход и бытовую химию.',
    extraRate: 'MB и MB 25% — с 1–10 уровня',
  },
  {
    id: 'gold',
    name: 'Золото',
    rank: 'без ранга',
    pv: 165,
    coupons: 61740,
    gbRate: '7%',
    gbLimit: '300 $',
    sbPair: '48 $',
    priceHint: null,
    fit: 'Тем, кто хочет больше продукции в наборе.',
    extraRate: 'MB и MB 25% — с 1–10 уровня',
  },
  {
    id: 'platinum',
    name: 'Платина',
    rank: 'VIP',
    pv: 275,
    coupons: 102900,
    gbRate: '10%',
    gbLimit: '600 $',
    sbPair: '88 $',
    priceHint: '≈ 28 900 ₽',
    fit: 'Первый VIP-статус: с него начисляется реферальный бонус 5%.',
    extraRate: 'Реферальный бонус 5%',
  },
  {
    id: 'diamond',
    name: 'Бриллиант',
    rank: 'VIP',
    pv: 825,
    coupons: 308700,
    gbRate: '12%',
    gbLimit: '700 $',
    sbPair: '240 $',
    priceHint: '≈ 87 000 ₽',
    fit: 'Тем, кто сразу планирует строить команду.',
    extraRate: 'Реферальный бонус 5%',
  },
  {
    id: 'crown',
    name: 'Корона',
    rank: 'VIP',
    pv: 1650,
    coupons: 617400,
    gbRate: '15%',
    gbLimit: '800 $',
    sbPair: '440 $',
    priceHint: null,
    fit: 'Максимальные ставки командных бонусов в плане.',
    extraRate: 'Реферальный бонус 5%',
  },
]
