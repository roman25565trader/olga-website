import { getBuilder, getClient, getDelivery } from '@/lib/data'
import { str, tooMany } from '@/lib/guard'

export const dynamic = 'force-dynamic'

type InItem =
  | { kind: 'product'; id: number; variant?: string; qty: number }
  | { kind: 'builder'; lines: { id: number; qty: number }[]; packaging?: string; qty: number }

const bad = (error: string, status = 400) => Response.json({ error }, { status })

export async function POST(req: Request) {
  if (tooMany(req, 6)) return bad('Слишком много попыток, подождите минуту', 429)
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return bad('Неверный запрос')
  }
  if (str(body.website)) return Response.json({ number: '0' }) // бот

  const customerName = str(body.customerName, 120)
  const customerPhone = str(body.customerPhone, 40)
  if (!customerName || customerPhone.replace(/\D/g, '').length < 10) return bad('Укажите имя и телефон')
  const raw = Array.isArray(body.items) ? (body.items as InItem[]).slice(0, 50) : []
  if (!raw.length) return bad('Корзина пуста')

  const payload = await getClient()
  const [builder, delivery] = await Promise.all([getBuilder(), getDelivery()])

  // Пересчитываем цены по базе — цене из браузера не доверяем
  const items: { title: string; variant?: string; qty: number; price: number }[] = []
  const packagingNames: string[] = []
  let source: 'cart' | 'builder' = 'cart'
  for (const it of raw) {
    const qty = Math.max(1, Math.min(99, Math.floor(Number(it.qty) || 1)))
    if (it.kind === 'product') {
      const p = await payload.findByID({ collection: 'products', id: Number(it.id), depth: 0, disableErrors: true })
      if (!p || !p.active) return bad('Один из букетов уже недоступен — обновите корзину')
      const size = it.variant ? (p.sizes || []).find((s) => s.label === it.variant) : null
      if (it.variant && !size) return bad(`Размер у «${p.title}» изменился — обновите корзину`)
      items.push({ title: p.title, variant: size?.label || undefined, qty, price: size ? size.price : p.price })
    } else if (it.kind === 'builder') {
      source = 'builder'
      const lines = (Array.isArray(it.lines) ? it.lines : []).slice(0, 60)
      const parts: string[] = []
      let sum = 0
      let stems = 0
      for (const l of lines) {
        const n = Math.max(0, Math.min(500, Math.floor(Number(l.qty) || 0)))
        if (!n) continue
        const f = await payload.findByID({ collection: 'flowers', id: Number(l.id), depth: 0, disableErrors: true })
        if (!f || !f.active || f.stock === 'out') return bad('Какой-то цветок закончился — соберите букет заново')
        sum += f.price * n
        stems += n
        parts.push(`${f.name}${f.variety ? ` ${f.variety}` : ''} × ${n}`)
      }
      if (stems < (builder.minStems || 1)) return bad('В букете слишком мало цветов')
      const pack = (builder.packaging || []).find((p) => p.name === it.packaging) || builder.packaging?.[0]
      if (pack) {
        sum += pack.price
        packagingNames.push(pack.name)
      }
      items.push({ title: `Свой букет: ${parts.join(', ')}`, variant: pack?.name, qty, price: sum })
    }
  }
  if (!items.length) return bad('Корзина пуста')

  const itemsTotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const method = body.deliveryMethod === 'pickup' ? 'pickup' : 'delivery'
  let deliveryPrice = 0
  let zoneName = ''
  if (method === 'delivery') {
    const zone = (delivery.zones || []).find((z) => z.name === body.zone) || delivery.zones?.[0]
    zoneName = zone?.name || ''
    deliveryPrice = zone ? (delivery.freeFrom && itemsTotal >= delivery.freeFrom ? 0 : zone.price) : 0
    if (!str(body.address)) return bad('Укажите адрес доставки')
  }

  const order = await payload.create({
    collection: 'orders',
    overrideAccess: true,
    data: {
      status: 'new',
      source,
      customerName,
      customerPhone,
      recipientName: str(body.recipientName, 120),
      recipientPhone: str(body.recipientPhone, 40),
      items,
      packaging: packagingNames.join(', '),
      itemsTotal,
      deliveryPrice,
      total: itemsTotal + deliveryPrice,
      deliveryMethod: method,
      zone: zoneName,
      address: str(body.address, 300),
      deliveryDate: str(body.deliveryDate, 20),
      deliveryTime: str(body.deliveryTime, 40),
      cardText: str(body.cardText, 500),
      comment: str(body.comment, 1000),
      anonymous: Boolean(body.anonymous),
    },
  })
  return Response.json({ number: order.number })
}
