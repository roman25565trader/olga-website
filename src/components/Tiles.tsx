import Link from 'next/link'
import type { Category } from '@/payload-types'
import { plural } from '@/lib/format'
import { Img } from './Img'

export function Tiles({ cats, counts, base }: { cats: Category[]; counts: Record<number, number>; base: string }) {
  return (
    <ul className="tiles">
      {cats.map((c) => {
        const n = counts[c.id] || 0
        return (
          <li key={c.id}>
            <Link href={`/${base}/${c.slug}`} className="tile">
              <span className="tile-m">
                {c.image ? <Img media={c.image} sizes="(max-width: 1023px) 50vw, 25vw" alt="" /> : <span className="tile-ph">{c.title[0]}</span>}
              </span>
              <span className="tile-t">
                <span className="tile-n">{c.title}</span>
                <span className="tile-c">{n ? `${n} ${plural(n, 'вариант', 'варианта', 'вариантов')}` : 'под заказ'}</span>
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
