'use client'
import { useDocumentInfo } from '@payloadcms/ui'

type Msg = { from?: string; text?: string; at?: string }

const when = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : ''

/** Переписка в виде сообщений, как в мессенджере */
export function ChatThread() {
  const { savedDocumentData } = useDocumentInfo()
  const messages = ((savedDocumentData as { messages?: Msg[] } | undefined)?.messages || []) as Msg[]
  if (!messages.length) return null
  return (
    <div className="oc-chat">
      <p className="oc-chat-h">Переписка</p>
      {messages.map((m, i) => (
        <div key={i} className={`oc-msg ${m.from === 'florist' ? 'oc-msg--me' : ''}`}>
          <span className="oc-msg-who">{m.from === 'florist' ? 'Вы' : 'Покупатель'}</span>
          <span className="oc-msg-t">{m.text}</span>
          <span className="oc-msg-at">{when(m.at)}</span>
        </div>
      ))}
    </div>
  )
}
