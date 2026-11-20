import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/JsonLd'
import { Opener } from '@/components/Opener'
import { ProductGrid } from '@/components/ProductCard'
import { Tiles } from '@/components/Tiles'
import { getCategories, getHome, getProducts, getSettings, productsInCategory, productsInSection } from '@/lib/data'
import { SECTION_SEO, SECTION_TITLES } from '@/lib/sections'
import { breadcrumbsLd, inCity, itemListLd } from '@/lib/seo'

export const generateStaticParams = () => Object.keys(SECTION_TITLES).map((section) => ({ section }))

type P = { params: Promise<{ section: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { section } = await params
  const seo = SECTION_SEO[section]
  if (!seo) return {}
  const s = await getSettings()
  const title = `${seo.title} ${inCity(s.city)}`.trim()
  const description = `${SECTION_TITLES[section]} ${inCity(s.city)}: ${seo.description}`
  return { title, description, alternates: { canonical: `/${section}` }, openGraph: { title, description, url: `/${section}` } }
}

export default async function SectionPage({ params }: P) {
  const { section } = await params
  if (!SECTION_TITLES[section]) notFound()
  const [cats, products, h] = await Promise.all([getCategories(), getProducts(), getHome()])
  const own = cats.filter((c) => c.section === section)
  const counts = Object.fromEntries(own.map((c) => [c.id, productsInCategory(products, c.id).length]))
  const list = productsInSection(products, cats, section)
  const title = section === 'bukety' ? h.bouquetsTitle : section === 'kompozicii' ? h.compositionsTitle : null
  const text = section === 'bukety' ? h.bouquetsText : section === 'kompozicii' ? h.compositionsText : null
  return (
    <div className="wrap sec-b">
      <JsonLd
        data={[
          breadcrumbsLd([
            { name: 'Главная', url: '/' },
            { name: SECTION_TITLES[section], url: `/${section}` },
          ]),
          itemListLd(SECTION_TITLES[section], list),
        ]}
      />
      <nav aria-label="Навигационная цепочка">
        <ol className="crumbs">
          <li>
            <Link href="/">Главная</Link>
          </li>
          <li aria-current="page">{SECTION_TITLES[section]}</li>
        </ol>
      </nav>
      <Opener as="h1" title={title || SECTION_TITLES[section]} text={text} />
      {own.length > 0 && <Tiles cats={own} counts={counts} base={section} eager={2} />}
      {list.length > 0 && (
        <div className="sec">
          <Opener k={`Все ${SECTION_TITLES[section].toLowerCase()}`} title={`${list.length} в наличии`} />
          <ProductGrid products={list} />
        </div>
      )}
    </div>
  )
}
