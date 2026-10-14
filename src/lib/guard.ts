/** Простейшая защита от спама: не больше N запросов в минуту с одного адреса (в пределах одного сервера). */
const hits = new Map<string, number[]>()

export function tooMany(req: Request, limit = 10): boolean {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < 60_000)
  list.push(now)
  hits.set(ip, list)
  if (hits.size > 5000) hits.clear()
  return list.length > limit
}

export const str = (v: unknown, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
