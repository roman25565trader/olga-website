import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/JsonLd'
import { Opener } from '@/components/Opener'
import { ProductGrid } from '@/components/ProductCard'
import { SeoText } from '@/components/SeoText'
import { getCategories, getProducts, getSettings, productsInCategory } from '@/lib/data'
import { SECTION_TITLES } from '@/lib/sections'
import { breadcrumbsLd, categoryDescription, categoryTitle, categoryUrl, inCity, itemListLd } from '@/lib/seo'

type P = { params: Promise<{ section: string; category: string }> }

export async function generateStaticParams() {
  const cats = await getCategories()
  return cats.filter((c) => c.slug).map((c) => ({ section: c.section, category: c.slug! }))
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { section, category } = await params
  const [cats, s] = await Promise.all([getCategories(), getSettings()])
  const cat = cats.find((c) => c.slug === category && c.section === section)
  if (!cat) return {}
  const title = categoryTitle(cat, s)
  const description = categoryDescription(cat, s)
  return { title, description, alternates: { canonical: categoryUrl(cat) }, openGraph: { title, description, url: categoryUrl(cat) } }
}

export default async function CategoryPage({ params }: P) {
  const { section, category } = await params
  const [cats, products, s] = await Promise.all([getCategories(), getProducts(), getSettings()])
  const cat = cats.find((c) => c.slug === category && c.section === section)
  if (!cat) notFound()
  const siblings = cats.filter((c) => c.section === section)
  const list = productsInCategory(products, cat.id)
  const crumbs = [
    { name: 'Главная', url: '/' },
    { name: SECTION_TITLES[section], url: `/${section}` },
    { name: cat.title, url: categoryUrl(cat) },
  ]
  return (
    <div className="wrap sec-b">
      <JsonLd data={[breadcrumbsLd(crumbs), itemListLd(`${SECTION_TITLES[section]}: ${cat.title}`, list)]} />
      <nav aria-label="Навигационная цепочка">
        <ol className="crumbs">
          <li>
            <Link href="/">Главная</Link>
          </li>
          <li>
            <Link href={`/${section}`}>{SECTION_TITLES[section]}</Link>
          </li>
          <li aria-current="page">{cat.title}</li>
        </ol>
      </nav>
      <Opener as="h1" title={cat.title} text={cat.description} />
      {siblings.length > 1 && (
        <div className="scroller" style={{ marginBottom: 24 }}>
          <div className="chips">
            {siblings.map((c) => (
              <Link key={c.id} href={`/${section}/${c.slug}`} className="chip" aria-current={c.id === cat.id ? 'page' : undefined}>
                {c.title}
              </Link>
            ))}
          </div>
        </div>
      )}
      <ProductGrid products={list} h={2} eager={2} />
      <SeoText title={`${SECTION_TITLES[section]} «${cat.title}» ${inCity(s.city)}`} text={cat.seoText} />
    </div>
  )
}
