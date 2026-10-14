import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Opener } from '@/components/Opener'
import { ProductGrid } from '@/components/ProductCard'
import { getCategories, getProducts, productsInCategory } from '@/lib/data'
import { SECTION_TITLES } from '@/lib/sections'

type P = { params: Promise<{ section: string; category: string }> }

export async function generateStaticParams() {
  const cats = await getCategories()
  return cats.filter((c) => c.slug).map((c) => ({ section: c.section, category: c.slug! }))
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { category } = await params
  const cat = (await getCategories()).find((c) => c.slug === category)
  return { title: cat ? `${cat.title} — ${SECTION_TITLES[cat.section]?.toLowerCase()}` : undefined, description: cat?.description || undefined }
}

export default async function CategoryPage({ params }: P) {
  const { section, category } = await params
  const [cats, products] = await Promise.all([getCategories(), getProducts()])
  const cat = cats.find((c) => c.slug === category && c.section === section)
  if (!cat) notFound()
  const siblings = cats.filter((c) => c.section === section)
  const list = productsInCategory(products, cat.id)
  return (
    <div className="wrap sec-b">
      <nav aria-label="Навигационная цепочка">
        <ol className="crumbs">
          <li>
            <Link href="/">Главная</Link>
          </li>
          <li>
            <Link href={`/${section}`}>{SECTION_TITLES[section]}</Link>
          </li>
          <li>{cat.title}</li>
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
    </div>
  )
}
