import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Icon } from '@/components/Icon'
import { Img } from '@/components/Img'
import { Opener } from '@/components/Opener'
import { ProductGrid } from '@/components/ProductCard'
import { AddToCart } from '@/components/client/AddToCart'
import { ChatOpen } from '@/components/client/ChatOpen'
import { getProduct, getProducts } from '@/lib/data'
import { productPrice } from '@/lib/format'
import { asMedia, thumbUrl } from '@/lib/media'
import type { Category } from '@/payload-types'
import { SECTION_TITLES } from '@/lib/sections'

type P = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getProducts()).filter((p) => p.slug).map((p) => ({ slug: p.slug! }))
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = await getProduct((await params).slug)
  if (!p) return {}
  const img = asMedia(p.images?.[0])
  return {
    title: p.title,
    description: p.short || p.description?.slice(0, 160) || undefined,
    openGraph: { images: img?.sizes?.md?.url ? [{ url: img.sizes.md.url }] : undefined },
  }
}

export default async function ProductPage({ params }: P) {
  const p = await getProduct((await params).slug)
  if (!p) notFound()
  const cat = (p.categories || []).find((c): c is Category => typeof c === 'object')
  const all = await getProducts()
  const catIds = new Set((p.categories || []).map((c) => (typeof c === 'object' ? c.id : c)))
  const related = all
    .filter((x) => x.id !== p.id && (x.categories || []).some((c) => catIds.has(typeof c === 'object' ? c.id : c)))
    .slice(0, 4)
  const images = p.images || []

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title,
    description: p.description || p.short,
    image: asMedia(images[0])?.url,
    offers: { '@type': 'Offer', priceCurrency: 'RUB', price: productPrice(p), availability: 'https://schema.org/InStock' },
  }

  return (
    <div className="wrap sec-b">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav aria-label="Навигационная цепочка">
        <ol className="crumbs">
          <li>
            <Link href="/">Главная</Link>
          </li>
          {cat && (
            <>
              <li>
                <Link href={`/${cat.section}`}>{SECTION_TITLES[cat.section]}</Link>
              </li>
              <li>
                <Link href={`/${cat.section}/${cat.slug}`}>{cat.title}</Link>
              </li>
            </>
          )}
          <li>{p.title}</li>
        </ol>
      </nav>
      <div className="pp">
        <div className="gal">
          {images.length ? (
            images.map((m, i) => (
              <div key={i}>
                <Img media={m} sizes={i === 0 ? '(max-width: 1023px) 100vw, 58vw' : '(max-width: 1023px) 88vw, 29vw'} priority={i === 0} alt={`${p.title} — фото ${i + 1}`} />
              </div>
            ))
          ) : (
            <div />
          )}
        </div>
        <div className="pp-i">
          <h1 className="h1 h1--task">{p.title}</h1>
          {p.short ? <p className="pp-s">{p.short}</p> : null}
          <AddToCart
            id={p.id}
            slug={p.slug || ''}
            title={p.title}
            price={p.price}
            oldPrice={p.oldPrice}
            sizes={(p.sizes || []).map((s) => ({ label: s.label, note: s.note, price: s.price }))}
            image={thumbUrl(images[0])}
          />
          <ul className="trust">
            <li>
              <Icon name="camera" /> Фото до отправки
            </li>
            <li>
              <Icon name="leaf" /> Свежие цветы
            </li>
            <li>
              <Icon name="truck" /> Доставка в день заказа
            </li>
          </ul>
          <p style={{ marginTop: 16 }}>
            <ChatOpen className="lnk" text={`Здравствуйте! Вопрос по букету «${p.title}»: `}>
              <Icon name="chat" /> Спросить флориста об этом букете
            </ChatOpen>
          </p>
          <div className="pp-d">
            {p.description ? (
              <div>
                <h2>Описание</h2>
                <p>{p.description}</p>
              </div>
            ) : null}
            {p.composition ? (
              <div>
                <h2>Состав</h2>
                <p>{p.composition}</p>
              </div>
            ) : null}
            <div>
              <h2>Доставка</h2>
              <p>
                Привезём сегодня или в удобный день. <Link href="/dostavka" className="lnk">Условия доставки</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="sec">
          <Opener k="Ещё" title="Похожие *букеты*" />
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  )
}
