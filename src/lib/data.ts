import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'
import type { Category, Flower, Product } from '@/payload-types'

export const getClient = cache(() => getPayload({ config }))

export const getSettings = cache(async () => (await getClient()).findGlobal({ slug: 'settings', depth: 1 }))
export const getHome = cache(async () => (await getClient()).findGlobal({ slug: 'home', depth: 1 }))
export const getDelivery = cache(async () => (await getClient()).findGlobal({ slug: 'delivery', depth: 0 }))
export const getBuilder = cache(async () => (await getClient()).findGlobal({ slug: 'builder', depth: 0 }))
export const getAbout = cache(async () => (await getClient()).findGlobal({ slug: 'about', depth: 1 }))

export const getCategories = cache(async (): Promise<Category[]> => {
  const res = await (await getClient()).find({
    collection: 'categories',
    where: { active: { equals: true } },
    sort: 'sortOrder',
    depth: 1,
    limit: 100,
  })
  return res.docs
})

export const getProducts = cache(async (): Promise<Product[]> => {
  const res = await (await getClient()).find({
    collection: 'products',
    where: { active: { equals: true } },
    sort: 'sortOrder',
    depth: 1,
    limit: 500,
  })
  return res.docs
})

export const getProduct = cache(async (slug: string): Promise<Product | null> => {
  const res = await (await getClient()).find({
    collection: 'products',
    where: { and: [{ slug: { equals: slug } }, { active: { equals: true } }] },
    depth: 2,
    limit: 1,
  })
  return res.docs[0] ?? null
})

export const getFlowers = cache(async (): Promise<Flower[]> => {
  const res = await (await getClient()).find({
    collection: 'flowers',
    where: { active: { equals: true } },
    sort: 'sortOrder',
    depth: 1,
    limit: 200,
  })
  return res.docs
})

export const getFooterPages = cache(async () => {
  const res = await (await getClient()).find({
    collection: 'pages',
    where: { inFooter: { equals: true } },
    depth: 0,
    limit: 20,
    select: { title: true, slug: true },
  })
  return res.docs
})

export const getPage = cache(async (slug: string) => {
  const res = await (await getClient()).find({ collection: 'pages', where: { slug: { equals: slug } }, depth: 1, limit: 1 })
  return res.docs[0] ?? null
})

/** Товары раздела: id категории → товары */
export const productsInCategory = (products: Product[], categoryId: number) =>
  products.filter((p) => (p.categories || []).some((c) => (typeof c === 'object' ? c.id : c) === categoryId))

export const productsInSection = (products: Product[], categories: Category[], section: string) => {
  const ids = new Set(categories.filter((c) => c.section === section).map((c) => c.id))
  return products.filter((p) => (p.categories || []).some((c) => ids.has(typeof c === 'object' ? c.id : c)))
}
