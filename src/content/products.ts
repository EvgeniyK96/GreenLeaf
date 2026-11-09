/** Позиции из каталога greenleaf-company.ru (API сайта), цены на 09.11.2026. */

export type Product = {
  section: string
  sectionUrl: string
  name: string
  retail: number
  partner: number
  pv: number
  /** Позиция из «Бады и витамины» — нужна пометка «не является лекарственным средством». */
  isSupplement?: boolean
}

const c = (slug: string) => `https://greenleaf-company.ru/catalog/${slug}`

export const productList: Product[] = [
  {
    section: 'Полость рта',
    sectionUrl: c('uhod-za-polostyu-rta'),
    name: 'Зубная паста на основе морских водорослей',
    retail: 430,
    partner: 215,
    pv: 0.5,
  },
  {
    section: 'Волосы',
    sectionUrl: c('uhod-dlya-volos'),
    name: 'Шампунь с цветочным ароматом',
    retail: 1028,
    partner: 514,
    pv: 1,
  },
  {
    section: 'Тело',
    sectionUrl: c('uhod-za-kozhey-tela'),
    name: 'Увлажняющий гель для душа с гиалуроновой кислотой',
    retail: 1094,
    partner: 547,
    pv: 2,
  },
  {
    section: 'Дом и быт',
    sectionUrl: c('tovary-dlya-doma-i-byta'),
    name: 'Антибактериальный жидкий порошок «Камелия»',
    retail: 1200,
    partner: 600,
    pv: 1,
  },
  {
    section: 'Гигиена',
    sectionUrl: c('gigiena'),
    name: 'Дневные гигиенические прокладки',
    retail: 518,
    partner: 259,
    pv: 1,
  },
  {
    section: 'Детям',
    sectionUrl: c('tovary-dlya-detey'),
    name: 'Детский увлажняющий крем',
    retail: 614,
    partner: 307,
    pv: 0.5,
  },
  {
    section: 'Лицо',
    sectionUrl: c('uhod-za-kozhey-litsa'),
    name: 'Сыворотка с пробиотической эссенцией',
    retail: 1430,
    partner: 715,
    pv: 3.5,
  },
  {
    section: 'Здоровье',
    sectionUrl: c('zdorove'),
    name: 'Комплекс витаминов группы B',
    retail: 826,
    partner: 413,
    pv: 1.5,
    isSupplement: true,
  },
]
