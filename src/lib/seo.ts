import type { Category, Delivery, Media, Product, Setting } from '@/payload-types'
import { productPrice, rub, telHref } from './format'
import { asMedia } from './media'
import { SECTION_TITLES } from './sections'
import { siteUrl } from './url'

/** Абсолютный адрес: для ссылок в разметке, фидах и llms.txt */
export const abs = (u?: string | null) => (u ? new URL(u, siteUrl()).href : undefined)

/** «Магнитогорск» → «в Магнитогорске» */
export const inCity = (city?: string | null) => {
  if (!city) return ''
  const c = city.trim()
  if (/[бвгджзклмнпрстфхцчшщ]$/i.test(c)) return `в ${c}е`
  if (/а$/i.test(c)) return `в ${c.slice(0, -1)}е`
  return `в ${c}`
}

const clip = (s: string, n = 160) => {
  const t = s.replace(/\s+/g, ' ').trim()
  if (t.length <= n) return t
  const cut = t.slice(0, n - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : cut.length)}…`
}

/** Убираем эмодзи — в сниппетах поисковиков они только мешают */
export const plain = (s?: string | null) =>
  (s || '')
    // эмодзи часто стоит вместо точки: «…хризантемы 🤍 Лидер продаж» → «…хризантемы. Лидер продаж»
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]+/gu, '\u0000')
    .replace(/([^.!?…:\s\u0000])[ \t]*\u0000[\s\u0000]*(?=[А-ЯЁA-Z«])/g, '$1. ')
    .replace(/[ \t]*\u0000[ \t\u0000]*/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ +([,.!?])/g, '$1')
    .replace(/([^.!?…:,;\s])[ \t]*\n\s*(?=[А-ЯЁA-Z«])/g, '$1. ')
    .replace(/\s*\n\s*/g, ' ')
    .trim()

export const productUrl = (p: Pick<Product, 'slug'>) => `/tovar/${p.slug}`
export const categoryUrl = (c: Pick<Category, 'slug' | 'section'>) => `/${c.section}/${c.slug}`

export const productTitle = (p: Product, s: Setting) => p.seo?.title || `${p.title} — купить с доставкой ${inCity(s.city)}`.trim()

export const productDescription = (p: Product, s: Setting) =>
  p.seo?.description ||
  clip(
    [
      plain(p.short) || plain(p.title),
      p.description ? plain(p.description) : '',
      `Доставка ${inCity(s.city)} в день заказа, фото до отправки.`,
    ]
      .filter(Boolean)
      .join('. ')
      .replace(/\.\./g, '.'),
  )

export const categoryTitle = (c: Category, s: Setting) =>
  c.seo?.title || `${c.title} — ${SECTION_TITLES[c.section]?.toLowerCase() || ''} с доставкой ${inCity(s.city)}`

export const categoryDescription = (c: Category, s: Setting) =>
  c.seo?.description || clip(`${c.description || c.title}. Доставка ${inCity(s.city)} в день заказа, фото букета до отправки.`)

export const productImages = (p: Product): string[] =>
  (p.images || [])
    .map((m) => asMedia(m))
    .filter((m): m is Media => Boolean(m?.url))
    .map((m) => abs(m.sizes?.lg?.url || m.url)!)

export const compositionLines = (p: Pick<Product, 'composition'>) =>
  (p.composition || '')
    .split(/\n|;\s*/)
    .map((x) => x.trim().replace(/[,;]$/, ''))
    .filter(Boolean)

const sizeText = (p: Pick<Product, 'width' | 'height'>) =>
  p.width && p.height ? `${p.width} × ${p.height} см` : p.width ? `ширина ${p.width} см` : p.height ? `высота ${p.height} см` : ''

// ---------------- schema.org ----------------

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

/** «Ежедневно 10:00–21:00» → OpeningHoursSpecification */
export function openingHours(hours?: string | null) {
  const m = (hours || '').match(/(\d{1,2}[:.]\d{2})\s*[–—-]\s*(\d{1,2}[:.]\d{2})/)
  if (!m || !/ежедневно|без выходных|каждый день/i.test(hours || '')) return undefined
  const t = (x: string) => x.replace('.', ':').padStart(5, '0')
  return [{ '@type': 'OpeningHoursSpecification', dayOfWeek: DAYS.map((d) => `https://schema.org/${d}`), opens: t(m[1]), closes: t(m[2]) }]
}

export const shopId = () => `${siteUrl()}/#shop`

export function shopLd(s: Setting, products: Product[], categories: Category[]) {
  const prices = products.map((p) => productPrice(p)).filter((x) => x > 0)
  const logo = asMedia(s.logo)
  const og = asMedia(s.ogImage)
  const tel = telHref(s.phone).replace('tel:', '')
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Florist',
      '@id': shopId(),
      name: s.siteName,
      alternateName: s.tagline ? `${s.siteName} — ${s.tagline}` : undefined,
      description: s.seoDescription || undefined,
      url: siteUrl(),
      logo: abs(logo?.url),
      image: abs(og?.sizes?.lg?.url || og?.url || logo?.url),
      telephone: tel || undefined,
      address: s.address
        ? { '@type': 'PostalAddress', streetAddress: s.address, addressLocality: s.city || undefined, addressCountry: 'RU' }
        : undefined,
      areaServed: s.city ? { '@type': 'City', name: s.city } : undefined,
      openingHoursSpecification: openingHours(s.hours),
      priceRange: prices.length ? `${rub(Math.min(...prices))} – ${rub(Math.max(...prices))}` : undefined,
      currenciesAccepted: 'RUB',
      legalName: s.legal || undefined,
      sameAs: [s.instagram, s.vk, s.telegram, s.max, s.flowwow].filter((x): x is string => Boolean(x && /^https?:\/\//.test(x))),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Каталог цветов',
        itemListElement: categories.map((c) => ({ '@type': 'OfferCatalog', name: `${SECTION_TITLES[c.section]}: ${c.title}`, url: abs(categoryUrl(c)) })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${siteUrl()}/#website`,
      name: s.siteName,
      url: siteUrl(),
      inLanguage: 'ru-RU',
      publisher: { '@id': shopId() },
    },
  ]
}

export function breadcrumbsLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.url) })),
  }
}

export function itemListLd(name: string, products: Product[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(productUrl(p)), name: p.title })),
  }
}

export function productLd(p: Product, s: Setting, d: Delivery, cat?: Category) {
  const price = productPrice(p)
  const minShip = Math.min(...(d.zones || []).map((z) => z.price).filter((x) => x > 0), Infinity)
  const props = [
    p.width ? { '@type': 'PropertyValue', name: 'Ширина', value: p.width, unitCode: 'CMT' } : null,
    p.height ? { '@type': 'PropertyValue', name: 'Высота', value: p.height, unitCode: 'CMT' } : null,
    p.composition ? { '@type': 'PropertyValue', name: 'Состав', value: compositionLines(p).join(', ') } : null,
    p.occasions?.length ? { '@type': 'PropertyValue', name: 'Кому и к какому поводу', value: p.occasions.join(', ') } : null,
  ].filter(Boolean)
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${abs(productUrl(p))}#product`,
    name: p.title,
    description: plain(p.description) || plain(p.short) || undefined,
    sku: String(p.id),
    image: productImages(p),
    url: abs(productUrl(p)),
    category: cat ? `${SECTION_TITLES[cat.section]} > ${cat.title}` : undefined,
    brand: { '@type': 'Brand', name: s.siteName },
    additionalProperty: props.length ? props : undefined,
    offers: {
      '@type': 'Offer',
      url: abs(productUrl(p)),
      priceCurrency: 'RUB',
      price,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': shopId() },
      areaServed: s.city ? { '@type': 'City', name: s.city } : undefined,
      shippingDetails: Number.isFinite(minShip)
        ? {
            '@type': 'OfferShippingDetails',
            shippingRate: { '@type': 'MonetaryAmount', value: minShip, currency: 'RUB' },
            shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'RU' },
            deliveryTime: {
              '@type': 'ShippingDeliveryTime',
              handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'DAY' },
              transitTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
            },
          }
        : undefined,
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'RU',
        returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
      },
    },
  }
}

export function faqLd(faq: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
}

// ---------------- вопросы и ответы на странице товара ----------------

const STURDY = /хризантем|альстромер|кеннеди|камилл/i

export function productFaq(p: Product, d: Delivery, s: Setting, cat?: Category): { q: string; a: string }[] {
  const isVase = cat?.slug === 'vazy'
  const onFoam = /губк|оазис/i.test(p.composition || '')
  const noun = isVase ? 'ваза' : onFoam ? 'композиция' : 'букет'
  const out: { q: string; a: string }[] = []
  const size = sizeText(p)
  if (size)
    out.push({
      q: `Какого размера ${noun}?`,
      a: isVase
        ? `Примерно ${size} (диаметр × высота).`
        : `Примерно ${size} (ширина × высота). ${onFoam ? 'Каждая композиция собирается' : 'Каждый букет собирается'} вручную, поэтому размер может немного отличаться.`,
    })
  const lines = compositionLines(p)
  if (lines.length && !isVase) out.push({ q: 'Что входит в состав?', a: `${lines.join(', ').replace(/\.$/, '')}.` })

  out.push({
    q: 'Когда привезёте?',
    a: plain(d.intro) || `Привезём ${inCity(s.city)} в день заказа.`,
  })
  const zones = (d.zones || []).filter((z) => z.name)
  if (zones.length)
    out.push({
      q: 'Сколько стоит доставка?',
      a: `${zones.map((z) => `${z.name} — ${z.price ? rub(z.price) : z.priceNote || 'по договорённости'}`).join('; ')}.${
        d.freeFrom ? ` При заказе от ${rub(d.freeFrom)} доставка бесплатная.` : ''
      }${d.pickupEnabled ? ` Можно забрать самостоятельно${s.address ? `: ${s.address}` : ''}.` : ''}`,
    })
  if (!isVase)
    out.push({
      q: `Увижу ли я ${noun === 'композиция' ? 'композицию' : 'букет'} до отправки?`,
      a: 'Да. Перед отправкой пришлём фото в WhatsApp, Telegram или SMS. Если что-то хочется поправить — скажите, переделаем.',
    })
  if (onFoam)
    out.push({
      q: 'Нужна ли ваза?',
      a: 'Нет. Цветы стоят на флористической губке. Раз в один-два дня аккуратно поливайте губку водой — так композиция простоит дольше.',
    })
  else if (!isVase)
    out.push({
      q: 'Как ухаживать за букетом?',
      a: `Подрежьте стебли наискосок на 1–2 см и поставьте букет в прохладную воду — не ниже уровня ленты. Меняйте воду каждый день.${
        STURDY.test(p.composition || '') ? ' Хризантемы и альстромерия — одни из самых стойких цветов: при таком уходе стоят до двух-трёх недель.' : ''
      }`,
    })
  return out
}
