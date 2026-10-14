export const rub = (n: number | null | undefined) =>
  `${Math.round(n ?? 0).toLocaleString('ru-RU').replace(/,/g, ' ')} ₽`

/** «Цветы с *душой*» → части для курсива */
export const splitEm = (s: string | null | undefined): { t: string; em: boolean }[] =>
  (s || '').split(/(\*[^*]+\*)/g).filter(Boolean).map((p) => (p.startsWith('*') && p.endsWith('*') ? { t: p.slice(1, -1), em: true } : { t: p, em: false }))

export const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

export const telHref = (phone?: string | null) => {
  const d = (phone || '').replace(/\D/g, '')
  if (!d) return ''
  return `tel:+${d.length === 11 && d.startsWith('8') ? `7${d.slice(1)}` : d}`
}

export const productPrice = (p: { price: number; sizes?: { price: number }[] | null }) =>
  p.sizes && p.sizes.length ? Math.min(...p.sizes.map((s) => s.price)) : p.price
