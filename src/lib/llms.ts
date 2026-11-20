import { getCategories, getDelivery, getHome, getProducts, getSettings, productsInCategory } from './data'
import { productPrice, rub } from './format'
import { SECTION_TITLES } from './sections'
import { abs, categoryUrl, compositionLines, inCity, plain, productUrl } from './seo'
import { siteUrl } from './url'

/**
 * llms.txt (llmstxt.org) — короткая справка о магазине для ИИ-помощников: ChatGPT, Claude, Perplexity, Алиса.
 * full = true — полный каталог с описаниями и составом (llms-full.txt).
 */
export async function buildLlms(full: boolean) {
  const [s, d, h, cats, products] = await Promise.all([getSettings(), getDelivery(), getHome(), getCategories(), getProducts()])
  const city = inCity(s.city)
  const out: string[] = []
  const prices = products.map((p) => productPrice(p))

  out.push(`# ${s.siteName} — ${s.tagline || 'цветочный салон'}${s.city ? `, ${s.city}` : ''}`)
  out.push('')
  out.push(
    `> ${plain(s.seoDescription) || `Букеты и композиции с доставкой ${city}.`} В каталоге ${products.length} позиций от ${rub(Math.min(...prices))} до ${rub(Math.max(...prices))}. Сайт: ${siteUrl()}`,
  )
  out.push('')
  out.push('## О магазине')
  out.push('')
  if (h.aboutText) out.push(plain(h.aboutText))
  const facts = [
    s.address && `Адрес: ${s.city ? `${s.city}, ` : ''}${s.address}`,
    s.hours && `Часы работы: ${s.hours}`,
    s.phone && `Телефон: ${s.phone}`,
    s.whatsapp && `WhatsApp: +${s.whatsapp.replace(/\D/g, '')}`,
    s.telegram && `Telegram: ${s.telegram}`,
    s.instagram && /^https?:/.test(s.instagram) && s.instagram !== 'https://www.instagram.com/' && `Instagram: ${s.instagram}`,
    s.vk && `ВКонтакте: ${s.vk}`,
    s.flowwow && `Магазин на Flowwow: ${s.flowwow}`,
    s.legal && `Продавец: ${s.legal}`,
  ].filter(Boolean)
  out.push('')
  out.push(...facts.map((f) => `- ${f}`))
  if (h.stats?.length) out.push(...h.stats.map((x) => `- ${x.value} — ${x.label}`))
  out.push('')

  out.push('## Как заказать')
  out.push('')
  out.push(`- Выберите букет на сайте и оформите заказ в корзине — или напишите флористу в чат на сайте, в WhatsApp или позвоните.`)
  out.push(`- Перед отправкой присылаем фото букета.`)
  if (d.payment) out.push(`- Оплата: ${plain(d.payment)}`)
  out.push(`- Свой букет можно собрать в конструкторе: ${abs('/konstruktor')}`)
  out.push('')

  out.push('## Доставка')
  out.push('')
  if (d.intro) out.push(plain(d.intro))
  for (const z of d.zones || []) out.push(`- ${z.name}: ${z.price ? rub(z.price) : z.priceNote || 'по договорённости'}${z.description ? ` — ${plain(z.description)}` : ''}`)
  if (d.freeFrom) out.push(`- Бесплатно при заказе от ${rub(d.freeFrom)}`)
  if (d.pickupEnabled) out.push(`- Самовывоз${s.address ? `: ${s.address}` : ''}`)
  if (d.intervals?.length) out.push(`- Интервалы доставки: ${d.intervals.map((i) => i.label).join(', ')}`)
  out.push(`- Подробно: ${abs('/dostavka')}`)
  out.push('')

  if (h.faq?.length) {
    out.push('## Частые вопросы')
    out.push('')
    for (const f of h.faq) {
      out.push(`### ${f.q}`)
      out.push(plain(f.a))
      out.push('')
    }
  }

  out.push('## Каталог')
  out.push('')
  for (const section of Object.keys(SECTION_TITLES)) {
    const own = cats.filter((c) => c.section === section)
    if (!own.length) continue
    for (const c of own) {
      const list = productsInCategory(products, c.id)
      if (!list.length) continue
      out.push(`### ${SECTION_TITLES[section]} — ${c.title}`)
      out.push(`${abs(categoryUrl(c))}${c.description ? ` — ${plain(c.description)}` : ''}`)
      out.push('')
      for (const p of list) {
        const price = productPrice(p)
        const old = p.oldPrice && p.oldPrice > price ? ` (было ${rub(p.oldPrice)})` : ''
        out.push(`- [${plain(p.title)}](${abs(productUrl(p))}): ${rub(price)}${old}${p.short ? ` — ${plain(p.short)}` : ''}`)
        if (full) {
          if (p.description) out.push(`  Описание: ${plain(p.description)}`)
          const lines = compositionLines(p)
          if (lines.length) out.push(`  Состав: ${lines.join(', ')}`)
          if (p.width || p.height) out.push(`  Размер: ${[p.width && `ширина ${p.width} см`, p.height && `высота ${p.height} см`].filter(Boolean).join(', ')}`)
          if (p.occasions?.length) out.push(`  Кому и к какому поводу: ${p.occasions.join(', ')}`)
        }
      }
      out.push('')
    }
  }

  out.push('## Ещё')
  out.push('')
  if (!full) out.push(`- [Полный каталог с описаниями и составом](${abs('/llms-full.txt')})`)
  out.push(`- [Фид товаров (YML, Яндекс)](${abs('/yml.xml')})`)
  out.push(`- [Карта сайта](${abs('/sitemap.xml')})`)
  out.push(`- [О салоне](${abs('/o-nas')})`)
  out.push('')
  return out.join('\n')
}
