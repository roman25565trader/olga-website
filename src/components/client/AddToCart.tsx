'use client'
import { useState } from 'react'
import { cart } from '@/lib/cart'
import { rub } from '@/lib/format'

type Size = { label: string; note?: string | null; price: number }
type Props = {
  id: number
  slug: string
  title: string
  price: number
  oldPrice?: number | null
  sizes: Size[]
  image?: string
}

export function AddToCart({ id, slug, title, price, oldPrice, sizes, image }: Props) {
  const [sel, setSel] = useState(sizes.length ? Math.min(1, sizes.length - 1) : -1)
  const size = sel >= 0 ? sizes[sel] : null
  const current = size ? size.price : price

  return (
    <>
      <div className="pp-pr">
        <span>{rub(current)}</span>
        {!size && oldPrice ? <s>{rub(oldPrice)}</s> : null}
      </div>
      {sizes.length > 0 && (
        <div className="sizes" role="group" aria-label="Размер">
          {sizes.map((s, i) => (
            <button key={i} type="button" className="size" aria-pressed={i === sel} onClick={() => setSel(i)}>
              <span className="size-l">{s.label}</span>
              {s.note ? <span className="size-m">{s.note}</span> : null}
              <span className="size-p">{rub(s.price)}</span>
            </button>
          ))}
        </div>
      )}
      <div className="pp-act">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() =>
            cart.add({
              key: `p${id}-${size?.label ?? ''}`,
              kind: 'product',
              id,
              slug,
              title,
              variant: size?.label,
              price: current,
              qty: 1,
              image,
            })
          }
        >
          В корзину · {rub(current)}
        </button>
      </div>
    </>
  )
}
