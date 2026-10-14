import type { Metadata } from 'next'
import Link from 'next/link'
import { Opener } from '@/components/Opener'
import { Builder } from '@/components/client/Builder'
import { getBuilder, getFlowers } from '@/lib/data'
import { thumbUrl } from '@/lib/media'

export const metadata: Metadata = { title: 'Собрать свой букет', description: 'Конструктор букета: выберите цветы и количество — цена считается сразу.' }

export default async function BuilderPage() {
  const [b, flowers] = await Promise.all([getBuilder(), getFlowers()])
  return (
    <div className="wrap sec-b">
      <nav aria-label="Навигационная цепочка">
        <ol className="crumbs">
          <li>
            <Link href="/">Главная</Link>
          </li>
          <li>Конструктор букета</li>
        </ol>
      </nav>
      <Opener as="h1" title={b.title} text={b.text} />
      {flowers.length ? (
        <Builder
          flowers={flowers.map((f) => ({ id: f.id, name: f.name, variety: f.variety, price: f.price, unit: f.unit, stock: f.stock, thumb: thumbUrl(f.image) }))}
          packaging={(b.packaging || []).map((p) => ({ name: p.name, price: p.price, note: p.note }))}
          minStems={b.minStems || 1}
          note={b.note}
        />
      ) : (
        <p className="empty">Сегодняшняя поставка ещё не добавлена. Загляните чуть позже или напишите флористу.</p>
      )}
    </div>
  )
}
