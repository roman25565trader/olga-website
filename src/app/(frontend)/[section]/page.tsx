import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Opener } from '@/components/Opener'
import { ProductGrid } from '@/components/ProductCard'
import { Tiles } from '@/components/Tiles'
import { getCategories, getHome, getProducts, productsInCategory, productsInSection } from '@/lib/data'

import { SECTION_TITLES } from '@/lib/sections'

export const generateStaticParams = () => Object.keys(SECTION_TITLES).map((section) => ({ section }))

type P = { params: Promise<{ section: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { section } = await params
  return { title: SECTION_TITLES[section] }
}

export default async function SectionPage({ params }: P) {
  const { section } = await params
  if (!SECTION_TITLES[section]) notFound()
  const [cats, products, h] = await Promise.all([getCategories(), getProducts(), getHome()])
  const own = cats.filter((c) => c.section === section)
  const counts = Object.fromEntries(own.map((c) => [c.id, productsInCategory(products, c.id).length]))
  const list = productsInSection(products, cats, section)
  const title = section === 'bukety' ? h.bouquetsTitle : h.compositionsTitle
  const text = section === 'bukety' ? h.bouquetsText : h.compositionsText
  return (
    <div className="wrap sec-b">
      <nav aria-label="Навигационная цепочка">
        <ol className="crumbs">
          <li>
            <Link href="/">Главная</Link>
          </li>
          <li>{SECTION_TITLES[section]}</li>
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
