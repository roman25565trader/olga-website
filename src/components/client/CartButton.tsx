'use client'
import Link from 'next/link'
import { cartCount, useCart } from '@/lib/cart'
import { Icon } from '../Icon'

export function CartButton() {
  const n = cartCount(useCart())
  return (
    <Link href="/korzina" className="ib" aria-label={n ? `Корзина, товаров: ${n}` : 'Корзина'}>
      <Icon name="bag" />
      {n > 0 && <span className="ib-cnt">{n}</span>}
    </Link>
  )
}
