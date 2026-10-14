import Link from 'next/link'
import type { Product } from '@/payload-types'
import { productPrice, rub } from '@/lib/format'
import { Img } from './Img'

export function ProductCard({ p, sizes = '(max-width: 767px) 50vw, (max-width: 1023px) 50vw, 25vw' }: { p: Product; sizes?: string }) {
  const from = p.sizes && p.sizes.length > 1
  return (
    <article className="card">
      <div className="card-m">
        {p.images?.[0] ? <Img media={p.images[0]} sizes={sizes} alt={p.title} /> : null}
        {p.badge ? <span className="badge">{p.badge}</span> : null}
      </div>
      <div className="card-t">
        <h3 className="card-n">
          <Link href={`/tovar/${p.slug}`} className="card-a">
            {p.title}
          </Link>
        </h3>
        <p className="card-p">
          {from ? 'от ' : ''}
          {rub(productPrice(p))}
          {p.oldPrice && !from ? <s>{rub(p.oldPrice)}</s> : null}
        </p>
      </div>
      {p.short ? <p className="card-s">{p.short}</p> : null}
    </article>
  )
}

export function ProductGrid({ products, cols = 4 }: { products: Product[]; cols?: 3 | 4 }) {
  if (!products.length) return <p className="empty">Скоро здесь появятся букеты. А пока — напишите флористу, соберём под ваш запрос.</p>
  return (
    <ul className={`cgrid${cols === 3 ? ' cgrid--3' : ''}`}>
      {products.map((p) => (
        <li key={p.id}>
          <ProductCard p={p} sizes={cols === 3 ? '(max-width: 1023px) 50vw, 33vw' : undefined} />
        </li>
      ))}
    </ul>
  )
}
