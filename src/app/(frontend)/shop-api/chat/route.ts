import { randomBytes } from 'crypto'
import { siteUrl } from '@/lib/url'
import { getClient } from '@/lib/data'
import { str, tooMany } from '@/lib/guard'
import { notifyTelegram } from '@/lib/notify'

export const dynamic = 'force-dynamic'

const pub = (messages: { from: string; text: string; at?: string | null }[] | null | undefined) =>
  (messages || []).map((m) => ({ from: m.from, text: m.text, at: m.at }))

async function byToken(token: string) {
  if (!/^[a-f0-9]{32}$/.test(token)) return null
  const payload = await getClient()
  const res = await payload.find({ collection: 'chats', where: { token: { equals: token } }, limit: 1, depth: 0, overrideAccess: true })
  return res.docs[0] ?? null
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const chat = await byToken(url.searchParams.get('token') || '')
  if (!chat) return Response.json({ error: 'not found' }, { status: 404 })
  const messages = pub(chat.messages)
  if (url.searchParams.get('peek')) return Response.json({ count: messages.length, lastFrom: messages.at(-1)?.from })
  return Response.json({ messages }, { headers: { 'cache-control': 'no-store' } })
}

export async function POST(req: Request) {
  if (tooMany(req, 12)) return Response.json({ error: 'Слишком часто, подождите минуту' }, { status: 429 })
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Неверный запрос' }, { status: 400 })
  }
  const text = str(body.text, 2000)
  if (!text) return Response.json({ error: 'Пустое сообщение' }, { status: 400 })
  if (str(body.website)) return Response.json({ messages: [] })

  const payload = await getClient()
  const now = new Date().toISOString()
  const msg = { from: 'client' as const, text, at: now }
  let chat = await byToken(str(body.token, 64))

  if (chat) {
    if ((chat.messages || []).length > 300) return Response.json({ error: 'Чат слишком длинный, позвоните нам' }, { status: 400 })
    chat = await payload.update({
      collection: 'chats',
      id: chat.id,
      overrideAccess: true,
      data: { messages: [...(chat.messages || []), msg], unread: true, lastMessageAt: now, lastText: text.slice(0, 120) },
    })
  } else {
    const name = str(body.name, 80)
    const phone = str(body.phone, 40)
    if (!name || phone.replace(/\D/g, '').length < 10) return Response.json({ error: 'Укажите имя и телефон' }, { status: 400 })
    chat = await payload.create({
      collection: 'chats',
      overrideAccess: true,
      data: { name, phone, token: randomBytes(16).toString('hex'), messages: [msg], unread: true, lastMessageAt: now, lastText: text.slice(0, 120) },
    })
  }

  await notifyTelegram(payload, `💬 Чат на сайте — ${chat.name} ${chat.phone}\n\n${text}\n\nОтветить: ${siteUrl()}/admin/collections/chats/${chat.id}`)
  return Response.json({ token: chat.token, messages: pub(chat.messages) })
}
