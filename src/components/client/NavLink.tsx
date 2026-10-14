'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const path = usePathname()
  const cur = path === href || (href !== '/' && path.startsWith(href + '/'))
  return (
    <Link href={href} className={className} aria-current={cur ? 'page' : undefined}>
      {children}
    </Link>
  )
}
