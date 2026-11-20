import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Icon } from '@/components/Icon'
import { Img } from '@/components/Img'
import { JsonLd } from '@/components/JsonLd'
import { Opener } from '@/components/Opener'
import { ProductGrid } from '@/components/ProductCard'
import { AddToCart } from '@/components/client/AddToCart'
import { ChatOpen } from '@/components/client/ChatOpen'
import { getDelivery, getProduct, getProducts, getSettings } from '@/lib/data'
import { thumbUrl } from '@/lib/media'
import type { Category } from '@/payload-types'
import { SECTION_TITLES } from '@/lib/sections'
import {
  breadcrumbsLd,
  categoryUrl,
  compositionLines,
  faqLd,
  productDescription,
  productFaq,
  productImages,
  productLd,
  productTitle,
  productUrl,
} from '@/lib/seo'

type P = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getProducts()).filter((p) => p.slug).map((p) => ({ slug: p.slug! }))
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const [p, s] = await Promise.all([getProduct((await params).slug), getSettings()])
  if (!p) return {}
  const title = productTitle(p, s)
  const description = productDescription(p, s)
  return {
    title,
    description,
    alternates: { canonical: productUrl(p) },
    openGraph: { title, description, url: productUrl(p), images: productImages(p).slice(0, 4).map((url) => ({ url, alt: p.title })) },
  }
}

export default async function ProductPage({ params }: P) {
  const p = await getProduct((await params).slug)
  if (!p) notFound()
  const [all, s, d] = await Promise.all([getProducts(), getSettings(), getDelivery()])
  const cat = (p.categories || []).find((c): c is Category => typeof c === 'object')
  const catIds = new Set((p.categories || []).map((c) => (typeof c === 'object' ? c.id : c)))
  const related = all
    .filter((x) => x.id !== p.id && (x.categories || []).some((c) => catIds.has(typeof c === 'object' ? c.id : c)))
    .slice(0, 4)
  const images = p.images || []
  const lines = compositionLines(p)
  const faq = productFaq(p, d, s, cat)
  const isVase = cat?.slug === 'vazy'

  const crumbs = [
    { name: 'Главная', url: '/' },
    ...(cat
      ? [
          { name: SECTION_TITLES[cat.section], url: `/${cat.section}` },
          { name: cat.title, url: categoryUrl(cat) },
        ]
      : []),
    { name: p.title, url: productUrl(p) },
  ]

  return (
    <div className="wrap sec-b">
      <JsonLd data={[productLd(p, s, d, cat), breadcrumbsLd(crumbs), faqLd(faq)]} />
      <nav aria-label="Навигационная цепочка">
        <ol className="crumbs">
          {crumbs.slice(0, -1).map((c) => (
            <li key={c.url}>
              <Link href={c.url}>{c.name}</Link>
            </li>
          ))}
          <li aria-current="page">{p.title}</li>
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
          {p.badge ? <p className="pp-badge">{p.badge}</p> : null}
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
            <ChatOpen className="lnk" text={`Здравствуйте! Вопрос про «${p.title}»: `}>
              <Icon name="chat" /> Спросить флориста
            </ChatOpen>
          </p>
          <div className="pp-d">
            {p.description ? (
              <div>
                <h2>Описание</h2>
                <p>{p.description}</p>
              </div>
            ) : null}
            {lines.length > 0 && !isVase ? (
              <div>
                <h2>Состав</h2>
                <ul className="pp-list">
                  {lines.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {p.width || p.height ? (
              <div>
                <h2>Размер</h2>
                <dl className="pp-dims">
                  {p.width ? (
                    <div>
                      <dt>{isVase ? 'Диаметр' : 'Ширина'}</dt>
                      <dd>{p.width} см</dd>
                    </div>
                  ) : null}
                  {p.height ? (
                    <div>
                      <dt>Высота</dt>
                      <dd>{p.height} см</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            ) : null}
            {p.occasions && p.occasions.length > 0 ? (
              <div>
                <h2>{isVase ? 'Подойдёт' : 'Кому подарить'}</h2>
                <ul className="pp-tags">
                  {p.occasions.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div>
              <h2>Доставка</h2>
              <p>
                {d.intro || 'Привезём сегодня или в удобный день.'}{' '}
                <Link href="/dostavka" className="lnk">
                  Условия доставки
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {faq.length > 0 && (
        <section className="sec">
          <div className="faq-g">
            <div>
              <p className="k">Вопросы</p>
              <h2 className="h2" style={{ marginTop: 20 }}>
                Коротко <em>о главном</em>
              </h2>
            </div>
            <div className="accs">
              {faq.map((f, i) => (
                <details className="acc" key={i} open={i === 0}>
                  <summary>
                    {f.q}
                    <Icon name="plus" />
                  </summary>
                  <p className="acc-a">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="sec">
          <Opener k="Ещё" title={isVase ? 'Ещё *вазы*' : cat?.section === 'kompozicii' ? 'Похожие *композиции*' : 'Похожие *букеты*'} />
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  )
}
