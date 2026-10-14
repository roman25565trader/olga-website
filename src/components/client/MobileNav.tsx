'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/** Закрывает мобильное меню при переходе на другую страницу */
export function MobileNav({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null)
  const path = usePathname()
  useEffect(() => {
    if (ref.current) ref.current.open = false
  }, [path])
  return (
    <details className="mnav m-only" ref={ref}>
      {children}
    </details>
  )
}
