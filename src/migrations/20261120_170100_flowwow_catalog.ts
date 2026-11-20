import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { CATALOG, CATALOG_CATEGORIES, DEMO_EMPTY_CATEGORIES, DEMO_TITLES } from '../catalog/flowwow'

/**
 * Каталог с Flowwow: 37 товаров с фото, разделы, тексты для поисковиков.
 * Запускается один раз. Уже загруженные товары (по flowwowId) не трогает — правки из админки не пропадут.
 * Демо-букеты из макета прячет (галочка «В продаже» снимается), а не удаляет.
 */

const dirname = path.dirname(fileURLToPath(import.meta.url))
const imagesDir = path.resolve(dirname, '../catalog/images')

// Стартовые описания разделов из наполнения — их можно заменить, своё не трогаем
const SEED_DESCRIPTIONS = new Set([
  'Букеты из одного вида цветов: розы, хризантемы, эустома.',
  'Цветы в сумочке — удобно дарить и нести.',
])

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const log = (m: string) => payload.logger.info(`[каталог Flowwow] ${m}`)

  // ---------- разделы ----------
  const catIds: Record<string, number> = {}
  for (const c of CATALOG_CATEGORIES) {
    const found = await payload.find({ collection: 'categories', where: { slug: { equals: c.slug } }, limit: 1, depth: 0, req })
    const cur = found.docs[0]
    if (cur) {
      const doc = await payload.update({
        collection: 'categories',
        id: cur.id,
        data: {
          seoText: cur.seoText || c.seoText,
          seo: { title: cur.seo?.title || c.seo.title, description: cur.seo?.description || c.seo.description },
          description: !cur.description || SEED_DESCRIPTIONS.has(cur.description) ? c.description : cur.description,
          active: true,
        },
        req,
      })
      catIds[c.slug] = doc.id
    } else {
      const doc = await payload.create({
        collection: 'categories',
        data: {
          title: c.title,
          slug: c.slug,
          section: c.section,
          description: c.description,
          seoText: c.seoText,
          seo: c.seo,
          sortOrder: c.sortOrder,
          active: true,
        },
        req,
      })
      catIds[c.slug] = doc.id
    }
  }
  log(`разделы готовы: ${Object.keys(catIds).join(', ')}`)

  // ---------- товары ----------
  const firstImage: Record<string, number> = {}
  let created = 0
  let photos = 0
  for (const [i, p] of CATALOG.entries()) {
    const exists = await payload.find({ collection: 'products', where: { flowwowId: { equals: p.fw } }, limit: 1, depth: 0, req })
    if (exists.docs[0]) continue

    const images: number[] = []
    for (let n = 1; n <= p.photos.length; n++) {
      const file = path.join(imagesDir, `${p.slug}-${n}.webp`)
      if (!fs.existsSync(file)) continue
      try {
        const m = await payload.create({ collection: 'media', data: { alt: `${p.title} — фото ${n}` }, filePath: file, req })
        images.push(m.id)
        photos++
      } catch (e) {
        log(`фото ${p.slug}-${n} не загрузилось: ${e instanceof Error ? e.message : String(e)}`)
      }
    }

    await payload.create({
      collection: 'products',
      data: {
        title: p.title,
        slug: p.slug,
        flowwowId: p.fw,
        price: p.price,
        oldPrice: p.oldPrice,
        short: p.short,
        description: p.description,
        composition: p.composition,
        width: p.width,
        height: p.height,
        occasions: p.occasions,
        seo: p.seo,
        images,
        categories: [catIds[p.cat]],
        featured: Boolean(p.featured),
        badge: p.badge,
        sortOrder: i + 1,
        active: true,
      },
      req,
    })
    if (images[0] && !firstImage[p.cat]) firstImage[p.cat] = images[0]
    created++
  }
  log(`товаров добавлено: ${created}, фото: ${photos}`)

  // Картинка раздела — первое фото первого товара (вместо картинки-ориентира из макета)
  for (const [slug, image] of Object.entries(firstImage)) {
    await payload.update({ collection: 'categories', id: catIds[slug], data: { image }, req })
  }

  // ---------- демо-букеты из макета: прячем ----------
  const demo = await payload.update({
    collection: 'products',
    where: { and: [{ title: { in: DEMO_TITLES } }, { flowwowId: { exists: false } }] },
    data: { active: false, featured: false },
    req,
  })
  log(`демо-букетов скрыто: ${demo.docs.length}`)

  // Разделы макета, которые остались пустыми
  for (const slug of DEMO_EMPTY_CATEGORIES) {
    const c = await payload.find({ collection: 'categories', where: { slug: { equals: slug } }, limit: 1, depth: 0, req })
    if (!c.docs[0]) continue
    const left = await payload.count({
      collection: 'products',
      where: { and: [{ categories: { in: [c.docs[0].id] } }, { active: { equals: true } }] },
      req,
    })
    if (left.totalDocs === 0) await payload.update({ collection: 'categories', id: c.docs[0].id, data: { active: false }, req })
  }

  // ---------- реквизиты и тексты для поисковиков (только стартовые значения) ----------
  await db.execute(sql`
    UPDATE "settings" SET "legal" = 'ИП Шашкова Ольга Владиславовна · ОГРНИП 325745600228935'
      WHERE "legal" IS NULL OR "legal" = '' OR "legal" = 'ИП [ФИО] · ИНН [—]';
    UPDATE "settings" SET "seo_title" = 'Клумба — доставка цветов в Магнитогорске: букеты и композиции'
      WHERE "seo_title" IS NULL OR "seo_title" = '';
    UPDATE "settings" SET "seo_description" = 'Цветочный салон «Клумба» в Магнитогорске: монобукеты из роз и хризантем, авторские букеты, цветы в коробке и сумочке. Доставка в день заказа, фото букета до отправки, рейтинг 4,88 на Flowwow.'
      WHERE "seo_description" IS NULL OR "seo_description" = '' OR "seo_description" = 'Букеты и композиции с доставкой по Магнитогорску. Конструктор своего букета, чат с флористом, фото до отправки.';
    UPDATE "home_stats" SET "label" = 'Flowwow · 10 768 оценок', "link" = 'https://flowwow.com/shop/klumbaf-8650/'
      WHERE "label" = 'Flowwow · 10 410 оценок' AND ("link" IS NULL OR "link" = '');`)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  // Откат: прячем товары каталога и возвращаем демо-букеты (ничего не удаляем)
  await payload.update({ collection: 'products', where: { flowwowId: { exists: true } }, data: { active: false }, req })
  await payload.update({ collection: 'products', where: { title: { in: DEMO_TITLES } }, data: { active: true }, req })
}
