import type { Metadata, Viewport } from 'next'
import { siteUrl } from '@/lib/url'
import Script from 'next/script'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Chat } from '@/components/client/Chat'
import { Toast } from '@/components/client/Toast'
import { getFooterPages, getHome, getSettings } from '@/lib/data'
import { telHref } from '@/lib/format'
import { asMedia, thumbUrl } from '@/lib/media'
import './styles.css'

export const revalidate = 86400

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  const title = s.seoTitle || `${s.siteName} — ${s.tagline || 'цветы'}${s.city ? `, ${s.city}` : ''}`
  const og = asMedia(s.ogImage)
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: title, template: `%s — ${s.siteName}` },
    description: s.seoDescription || undefined,
    openGraph: {
      type: 'website',
      locale: 'ru_RU',
      siteName: s.siteName,
      images: og?.url ? [{ url: og.sizes?.lg?.url || og.url }] : undefined,
    },
    formatDetection: { telephone: false },
  }
}

export const viewport: Viewport = { themeColor: '#FFFFFF', width: 'device-width', initialScale: 1 }

export default async function Layout({ children }: { children: React.ReactNode }) {
  const [s, pages, home] = await Promise.all([getSettings(), getFooterPages(), getHome()])
  return (
    <html lang="ru">
      <body>
        <Header s={s} />
        <main>{children}</main>
        <Footer s={s} pages={pages} />
        {s.chatEnabled !== false && (
          <Chat
            greeting={s.chatGreeting || 'Здравствуйте! Напишите, какой букет хотите.'}
            avatar={thumbUrl(home.aboutImage) || undefined}
            name={s.siteName}
            phoneHref={telHref(s.phone) || undefined}
            whatsapp={s.whatsapp || undefined}
            telegram={s.telegram || undefined}
          />
        )}
        <Toast />
        {s.yandexMetrika && /^\d+$/.test(s.yandexMetrika) && (
          <Script id="ym" strategy="lazyOnload">
            {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${s.yandexMetrika},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`}
          </Script>
        )}
      </body>
    </html>
  )
}
