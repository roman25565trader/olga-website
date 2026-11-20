import { getCategories, getDelivery, getProducts, getSettings } from '@/lib/data'
import { productPrice } from '@/lib/format'
import { SECTION_TITLES } from '@/lib/sections'
import { abs, compositionLines, plain, productImages, productUrl } from '@/lib/seo'
import { siteUrl } from '@/lib/url'

/** Фид товаров в формате YML — для Яндекс Вебмастера / Яндекс Товаров и ИИ-поиска. */
export const revalidate = 3600

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

export async function GET() {
  const [s, d, cats, products] = await Promise.all([getSettings(), getDelivery(), getCategories(), getProducts()])
  const sections = Object.keys(SECTION_TITLES).filter((x) => cats.some((c) => c.section === x))
  const sectionId = (x: string) => 1000 + sections.indexOf(x)
  const minShip = Math.min(...(d.zones || []).map((z) => z.price).filter((x) => x > 0), Infinity)
  const date = new Date().toISOString().slice(0, 16)

  const offers = products
    .map((p) => {
      const cat = (p.categories || []).map((c) => (typeof c === 'object' ? c : cats.find((x) => x.id === c))).find(Boolean)
      if (!cat || !p.slug) return ''
      const price = productPrice(p)
      const desc = [plain(p.description), plain(p.short)].filter(Boolean).join(' ')
      const lines = compositionLines(p)
      return [
        `<offer id="${p.id}" available="true">`,
        `<url>${esc(abs(productUrl(p))!)}</url>`,
        `<price>${price}</price>`,
        p.oldPrice && p.oldPrice > price ? `<oldprice>${p.oldPrice}</oldprice>` : '',
        `<currencyId>RUR</currencyId>`,
        `<categoryId>${cat.id}</categoryId>`,
        ...productImages(p).slice(0, 10).map((u) => `<picture>${esc(u)}</picture>`),
        `<name>${esc(plain(p.title))}</name>`,
        `<vendor>${esc(s.siteName)}</vendor>`,
        desc ? `<description><![CDATA[${desc.replace(/]]>/g, ']]&gt;')}]]></description>` : '',
        `<delivery>true</delivery>`,
        d.pickupEnabled ? `<pickup>true</pickup>` : '',
        `<store>true</store>`,
        lines.length ? `<param name="Состав">${esc(lines.join(', '))}</param>` : '',
        p.width ? `<param name="Ширина" unit="см">${p.width}</param>` : '',
        p.height ? `<param name="Высота" unit="см">${p.height}</param>` : '',
        p.occasions?.length ? `<param name="Повод">${esc(p.occasions.join(', '))}</param>` : '',
        `</offer>`,
      ]
        .filter(Boolean)
        .join('')
    })
    .filter(Boolean)

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${date}">
<shop>
<name>${esc(s.siteName)}</name>
<company>${esc(s.legal || s.siteName)}</company>
<url>${esc(siteUrl())}</url>
<currencies><currency id="RUR" rate="1"/></currencies>
<categories>
${sections.map((x) => `<category id="${sectionId(x)}">${esc(SECTION_TITLES[x])}</category>`).join('\n')}
${cats.map((c) => `<category id="${c.id}" parentId="${sectionId(c.section)}">${esc(c.title)}</category>`).join('\n')}
</categories>
${Number.isFinite(minShip) ? `<delivery-options><option cost="${minShip}" days="0"/></delivery-options>` : ''}
<offers>
${offers.join('\n')}
</offers>
</shop>
</yml_catalog>
`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
