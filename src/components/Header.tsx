import Link from 'next/link'
import type { Setting } from '@/payload-types'
import { telHref } from '@/lib/format'
import { asMedia } from '@/lib/media'
import { Icon } from './Icon'
import { CartButton } from './client/CartButton'
import { MobileNav } from './client/MobileNav'
import { NavLink } from './client/NavLink'
import { ChatOpen } from './client/ChatOpen'

export const NAV = [
  { href: '/bukety', label: 'Букеты' },
  { href: '/kompozicii', label: 'Композиции' },
  { href: '/konstruktor', label: 'Собрать букет' },
  { href: '/dostavka', label: 'Доставка' },
  { href: '/o-nas', label: 'О нас' },
]

export function Logo({ s }: { s: Setting }) {
  const logo = asMedia(s.logo)
  return (
    <Link href="/" className="logo">
      {logo?.url ? (
        <img src={logo.sizes?.sm?.url || logo.url} alt={s.siteName} width={logo.width || undefined} height={logo.height || undefined} />
      ) : (
        <span className="logo-w">
          <span className="logo-n">{s.siteName}</span>
          {s.tagline ? <span className="logo-s">{s.tagline}</span> : null}
        </span>
      )}
    </Link>
  )
}

export function Header({ s }: { s: Setting }) {
  const tel = telHref(s.phone)
  return (
    <>
      {s.topBar && s.topBar.length > 0 && (
        <div className="svc">
          <div className="wrap svc-in">
            {s.topBar.map((t, i) => (
              <span key={i}>{t.text}</span>
            ))}
          </div>
        </div>
      )}
      <header className="hdr">
        <div className="wrap hdr-in">
          <MobileNav>
            <summary className="ib" aria-label="Меню">
              <span className="mnav-o">
                <Icon name="menu" />
              </span>
              <span className="mnav-x">
                <Icon name="close" />
              </span>
            </summary>
            <div className="mnav-p">
              <nav className="mnav-l" aria-label="Меню">
                <Link href="/">
                  Главная <Icon name="arrow" />
                </Link>
                {NAV.map((n) => (
                  <Link key={n.href} href={n.href}>
                    {n.label} <Icon name="arrow" />
                  </Link>
                ))}
              </nav>
              <div className="mnav-i">
                {tel && (
                  <a className="btn btn--primary" href={tel}>
                    <Icon name="phone" /> {s.phone}
                  </a>
                )}
                <ChatOpen className="btn btn--outline">
                  <Icon name="chat" /> Написать флористу
                </ChatOpen>
                {s.address && <span>{s.address}</span>}
                {s.hours && <span>{s.hours}</span>}
              </div>
            </div>
          </MobileNav>
          <Logo s={s} />
          <nav className="nav d-only" aria-label="Основное меню">
            {NAV.map((n) => (
              <NavLink key={n.href} href={n.href} className="nav-a">
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="hdr-r">
            {tel && (
              <a className="tel d-only" href={tel}>
                <Icon name="phone" />
                <span>{s.phone}</span>
              </a>
            )}
            {tel && (
              <a className="ib m-only" href={tel} aria-label="Позвонить">
                <Icon name="phone" />
              </a>
            )}
            {s.instagram && (
              <a className="ib d-only" href={s.instagram} target="_blank" rel="noopener" aria-label="Instagram">
                <Icon name="instagram" />
              </a>
            )}
            <CartButton />
          </div>
        </div>
      </header>
    </>
  )
}
