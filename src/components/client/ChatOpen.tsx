'use client'

/** Любая кнопка, открывающая чат с флористом */
export function ChatOpen({ className, children, text }: { className?: string; children?: React.ReactNode; text?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent('chat:open', { detail: text }))}
    >
      {children}
    </button>
  )
}
