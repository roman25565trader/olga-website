'use client'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { Icon } from '../Icon'

export type ChatProps = {
  greeting: string
  avatar?: string
  name: string
  phoneHref?: string
  whatsapp?: string
  telegram?: string
}

const Panel = dynamic(() => import('./ChatPanel').then((m) => m.ChatPanel), { ssr: false })

/** Кнопка «Чат с флористом»; само окно загружается только по нажатию */
export function Chat(props: ChatProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<string | undefined>()
  const [unread, setUnread] = useState(false)

  useEffect(() => {
    const on = (e: Event) => {
      setDraft((e as CustomEvent<string | undefined>).detail)
      setOpen(true)
    }
    window.addEventListener('chat:open', on)
    return () => window.removeEventListener('chat:open', on)
  }, [])

  // Если чат уже начат — раз в 30 секунд проверяем, не ответила ли Ольга
  useEffect(() => {
    if (open) return
    let token: string | null = null
    try {
      token = localStorage.getItem('chat-token')
    } catch {}
    if (!token) return
    const check = async () => {
      try {
        const r = await fetch(`/shop-api/chat?token=${encodeURIComponent(token!)}&peek=1`, { cache: 'no-store' })
        if (!r.ok) return
        const d = await r.json()
        const seen = Number(localStorage.getItem('chat-seen') || 0)
        setUnread(d.count > seen && d.lastFrom === 'florist')
      } catch {}
    }
    check()
    const t = setInterval(check, 30000)
    return () => clearInterval(t)
  }, [open])

  return open ? (
    <Panel {...props} draft={draft} onClose={() => { setOpen(false); setUnread(false) }} />
  ) : (
    <button type="button" className="chat-fab" onClick={() => setOpen(true)}>
      <span className="dot" aria-hidden="true" />
      <Icon name="chat" />
      <span>{unread ? 'Новый ответ' : 'Чат с флористом'}</span>
    </button>
  )
}
