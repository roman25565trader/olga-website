'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/** «Добавлено в корзину» */
export function Toast() {
  const [text, setText] = useState<string | null>(null)
  const path = usePathname()
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const on = (e: Event) => {
      setText(`«${(e as CustomEvent<string>).detail}» в корзине`)
      clearTimeout(t)
      t = setTimeout(() => setText(null), 3500)
    }
    window.addEventListener('cart:added', on)
    return () => {
      window.removeEventListener('cart:added', on)
      clearTimeout(t)
    }
  }, [])
  if (!text || path === '/korzina') return null
  return (
    <div className="toast" role="status">
      <span>{text}</span>
      <Link href="/korzina" className="toast-a" onClick={() => setText(null)}>
        Оформить
      </Link>
    </div>
  )
}
