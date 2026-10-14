import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Icon } from '@/components/Icon'
import { Img } from '@/components/Img'
import { Opener } from '@/components/Opener'
import { ChatOpen } from '@/components/client/ChatOpen'
import { getAbout, getSettings } from '@/lib/data'
import { telHref } from '@/lib/format'

export const metadata: Metadata = { title: 'О нас' }

export default async function AboutPage() {
  const [a, s] = await Promise.all([getAbout(), getSettings()])
  const tel = telHref(s.phone)
  return (
    <div className="wrap sec-b">
      <nav aria-label="Навигационная цепочка">
        <ol className="crumbs">
          <li>
            <Link href="/">Главная</Link>
          </li>
          <li>О нас</li>
        </ol>
      </nav>
      <Opener as="h1" title={a.title} text={a.lead} />
      <div className="about">
        <div>
          {a.content ? (
            <div className="prose">
              <RichText data={a.content} />
            </div>
          ) : null}
          <ul className="about-c">
            {s.address && (
              <li>
                <Icon name="pin" /> {s.address}
              </li>
            )}
            {s.hours && (
              <li>
                <Icon name="clock" /> {s.hours}
              </li>
            )}
            {tel && (
              <li>
                <Icon name="phone" /> <a href={tel}>{s.phone}</a>
              </li>
            )}
            {s.instagram && (
              <li>
                <Icon name="instagram" />{' '}
                <a href={s.instagram} target="_blank" rel="noopener">
                  {s.instagramNote || 'Instagram'}
                </a>
              </li>
            )}
          </ul>
          <ChatOpen className="btn btn--primary" >
            <Icon name="chat" /> Написать флористу
          </ChatOpen>
        </div>
        {a.image ? (
          <div className="about-m">
            <Img media={a.image} sizes="(max-width: 1023px) 100vw, 55vw" priority />
          </div>
        ) : null}
      </div>
      {a.gallery && a.gallery.length > 0 && (
        <ul className="tiles sec">
          {a.gallery.map((m, i) => (
            <li key={i} className="tile-m">
              <Img media={m} sizes="(max-width: 1023px) 50vw, 25vw" />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
