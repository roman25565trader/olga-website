import type { MetadataRoute } from 'next'
import { getCategories, getClient, getProducts } from '@/lib/data'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const [cats, products, pages] = await Promise.all([
    getCategories(),
    getProducts(),
    (await getClient()).find({ collection: 'pages', limit: 100, depth: 0, select: { slug: true } }),
  ])
  const urls = ['', '/bukety', '/kompozicii', '/konstruktor', '/dostavka', '/o-nas']
  return [
    ...urls.map((u) => ({ url: `${base}${u}`, changeFrequency: 'daily' as const })),
    ...cats.map((c) => ({ url: `${base}/${c.section}/${c.slug}` })),
    ...products.map((p) => ({ url: `${base}/tovar/${p.slug}`, lastModified: p.updatedAt })),
    ...pages.docs.map((p) => ({ url: `${base}/info/${p.slug}` })),
  ]
}
