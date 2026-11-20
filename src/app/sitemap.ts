import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/url'
import { getCategories, getClient, getProducts } from '@/lib/data'
import { productImages } from '@/lib/seo'
import { SECTION_TITLES } from '@/lib/sections'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const [cats, products, pages] = await Promise.all([
    getCategories(),
    getProducts(),
    (await getClient()).find({ collection: 'pages', limit: 100, depth: 0, select: { slug: true, updatedAt: true } }),
  ])
  const sections = Object.keys(SECTION_TITLES).filter((s) => cats.some((c) => c.section === s))
  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    ...sections.map((s) => ({ url: `${base}/${s}`, changeFrequency: 'daily' as const, priority: 0.9 })),
    ...cats.map((c) => ({ url: `${base}/${c.section}/${c.slug}`, lastModified: c.updatedAt, changeFrequency: 'daily' as const, priority: 0.8 })),
    ...products.map((p) => ({
      url: `${base}/tovar/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      images: productImages(p).slice(0, 10),
    })),
    ...['/konstruktor', '/dostavka', '/o-nas'].map((u) => ({ url: `${base}${u}`, changeFrequency: 'monthly' as const, priority: 0.5 })),
    ...pages.docs.map((p) => ({ url: `${base}/info/${p.slug}`, lastModified: p.updatedAt, priority: 0.2 })),
  ]
}
