'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '../Icon'
import type { ChatProps } from './Chat'

type Msg = { from: 'client' | 'florist'; text: string; at?: string }

const ls = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k) || ''
    } catch {
      return ''
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v)
    } catch {}
  },
}

const time = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''

export function ChatPanel({ greeting, avatar, name: shopName, phoneHref, whatsapp, telegram, draft, onClose }: ChatProps & { draft?: string; onClose: () => void }) {
  const [token, setToken] = useState(() => ls.get('chat-token'))
  const [name, setName] = useState(() => ls.get('chat-name'))
  const [phone, setPhone] = useState(() => ls.get('chat-phone'))
  const [text, setText] = useState(draft || '')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const body = useRef<HTMLDivElement>(null)
  const hp = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    if (!token) return
    try {
      const r = await fetch(`/shop-api/chat?token=${encodeURIComponent(token)}`, { cache: 'no-store' })
      if (r.status === 404) {
        setToken('')
        ls.set('chat-token', '')
        return
      }
      const d = await r.json()
      setMsgs(d.messages || [])
      ls.set('chat-seen', String((d.messages || []).length))
    } catch {}
  }, [token])

  useEffect(() => {
    load()
    if (!token) return
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [load, token])

  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight })
  }, [msgs])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    if (!token && (!name.trim() || phone.replace(/\D/g, '').length < 10)) {
      setError('Укажите имя и телефон — чтобы Ольга могла ответить, даже если вы закроете сайт')
      return
    }
    setSending(true)
    setError('')
    try {
      const r = await fetch('/shop-api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, name, phone, text: t, website: hp.current?.value }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Не получилось отправить')
      if (d.token && d.token !== token) {
        setToken(d.token)
        ls.set('chat-token', d.token)
      }
      ls.set('chat-name', name)
      ls.set('chat-phone', phone)
      setMsgs(d.messages || [])
      setText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сети, попробуйте ещё раз')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="chat-p" role="dialog" aria-label="Чат с флористом">
      <header className="chat-h">
        <span className="chat-av">{avatar ? <img src={avatar} alt="" width={40} height={40} /> : 'О'}</span>
        <span className="chat-t">
          <b>Флорист {shopName}</b>
          <span>Обычно отвечает за 15 минут</span>
        </span>
        <button type="button" className="ib" onClick={onClose} aria-label="Закрыть чат">
          <Icon name="close" />
        </button>
      </header>
      <div className="chat-b" ref={body}>
        <p className="msg msg--f">{greeting}</p>
        {msgs.map((m, i) => (
          <p key={i} className={`msg ${m.from === 'client' ? 'msg--c' : 'msg--f'}`}>
            {m.text}
            <time>{time(m.at)}</time>
          </p>
        ))}
      </div>
      <form className="chat-f" onSubmit={send}>
        {!token && (
          <div className="row">
            <input className="input" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-label="Ваше имя" />
            <input className="input" placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" aria-label="Ваш телефон" />
          </div>
        )}
        <input ref={hp} name="website" tabIndex={-1} autoComplete="off" className="vh" aria-hidden="true" />
        <div className="row">
          <textarea
            className="textarea"
            placeholder="Какой букет вы хотите?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                e.currentTarget.form?.requestSubmit()
              }
            }}
            rows={1}
            aria-label="Сообщение"
            maxLength={2000}
          />
          <button type="submit" className="btn btn--primary btn--sm" disabled={sending} aria-label="Отправить">
            <Icon name="send" />
          </button>
        </div>
        {error && <p className="err">{error}</p>}
        <p className="chat-alt">
          Или напишите:
          {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener">WhatsApp</a>}
          {telegram && <a href={telegram} target="_blank" rel="noopener">Telegram</a>}
          {phoneHref && <a href={phoneHref}>позвонить</a>}
        </p>
      </form>
    </section>
  )
}
