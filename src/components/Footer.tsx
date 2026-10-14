import Link from 'next/link'
import type { Setting } from '@/payload-types'
import { telHref } from '@/lib/format'
import { Icon } from './Icon'
import { NAV, Logo } from './Header'

export function Footer({ s, pages }: { s: Setting; pages: { title: string; slug?: string | null }[] }) {
  const tel = telHref(s.phone)
  const soc = [
    s.instagram && { href: s.instagram, icon: 'instagram', label: 'Instagram' },
    s.telegram && { href: s.telegram, icon: 'telegram', label: 'Telegram' },
    s.whatsapp && { href: `https://wa.me/${s.whatsapp}`, icon: 'whatsapp', label: 'WhatsApp' },
    s.vk && { href: s.vk, icon: 'vk', label: 'ВКонтакте' },
  ].filter(Boolean) as { href: string; icon: string; label: string }[]
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr-g">
          <div className="ftr-c ftr-c--logo">
            <Logo s={s} />
            {soc.length > 0 && (
              <div className="soc">
                {soc.map((x) => (
                  <a key={x.icon} href={x.href} target="_blank" rel="noopener" aria-label={x.label}>
                    <Icon name={x.icon} />
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="ftr-c">
            <p className="ftr-h">Магазин</p>
            <ul>
              {s.address && <li>{s.mapLink ? <a href={s.mapLink} target="_blank" rel="noopener">{s.address}</a> : s.address}</li>}
              {s.hours && <li className="fm">{s.hours}</li>}
              {tel && (
                <li>
                  <a href={tel}>{s.phone}</a>
                </li>
              )}
              {s.max && (
                <li>
                  <a href={s.max} target="_blank" rel="noopener">
                    MAX
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div className="ftr-c">
            <p className="ftr-h">Покупателям</p>
            <ul>
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="ftr-c">
            <p className="ftr-h">Документы</p>
            <ul>
              {pages.map((p) => (
                <li key={p.slug}>
                  <Link href={`/info/${p.slug}`}>{p.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="ftr-b">
          <span>
            © {new Date().getFullYear()} {s.siteName}
            {s.legal ? ` · ${s.legal}` : ''}
          </span>
          {s.city && <span>{s.city}</span>}
        </div>
      </div>
    </footer>
  )
}
