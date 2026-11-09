const intFmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const pvFmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })

/** 12 345 ₽ с неразрывными пробелами. */
export function rub(n: number): string {
  return `${intFmt.format(Math.round(n))} ₽`
}

export function int(n: number): string {
  return intFmt.format(Math.round(n))
}

export function pv(n: number): string {
  return pvFmt.format(n)
}

/** Русское склонение: plural(4, ['вид', 'вида', 'видов']) → 'вида'. */
export function plural(n: number, forms: [string, string, string]): string {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return forms[0]
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return forms[1]
  return forms[2]
}
