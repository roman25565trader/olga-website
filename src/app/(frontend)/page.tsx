import Link from 'next/link'
import { Em } from '@/components/Em'
import { Icon } from '@/components/Icon'
import { Img } from '@/components/Img'
import { Opener } from '@/components/Opener'
import { ProductGrid } from '@/components/ProductCard'
import { Tiles } from '@/components/Tiles'
import { Builder } from '@/components/client/Builder'
import { ChatOpen } from '@/components/client/ChatOpen'
import { HeroVideo } from '@/components/client/HeroVideo'
import { getBuilder, getCategories, getFlowers, getHome, getProducts, getSettings, productsInCategory } from '@/lib/data'
import { telHref } from '@/lib/format'
import { asMedia, isVideo, thumbUrl } from '@/lib/media'

export default async function HomePage() {
  const [s, h, cats, products, flowers, b] = await Promise.all([
    getSettings(),
    getHome(),
    getCategories(),
    getProducts(),
    getFlowers(),
    getBuilder(),
  ])
  const counts = Object.fromEntries(cats.map((c) => [c.id, productsInCategory(products, c.id).length]))
  const bouquets = cats.filter((c) => c.section === 'bukety')
  const compositions = cats.filter((c) => c.section === 'kompozicii')
  const featured = products.filter((p) => p.featured).slice(0, 8)
  const video = isVideo(h.heroVideo) ? asMedia(h.heroVideo) : null
  const tel = telHref(s.phone)
  const poster = h.heroImage ? <Img media={h.heroImage} sizes="(max-width: 767px) 100vw, 50vw" priority /> : null

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Florist',
    name: s.siteName,
    telephone: s.phone,
    address: { '@type': 'PostalAddress', streetAddress: s.address, addressLocality: s.city },
    openingHours: s.hours,
    sameAs: [s.instagram, s.vk, s.telegram].filter(Boolean),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section className="hero">
        <div className="wrap hero-g">
          <div className="hero-t">
            {h.heroKicker ? <p className="k">{h.heroKicker}</p> : null}
            <h1 className="h1 hero-h">
              <Em text={h.heroTitle} />
            </h1>
            {h.heroText ? <p className="lead hero-x">{h.heroText}</p> : null}
            <div className="hero-act">
              <ChatOpen className="btn btn--primary">
                <Icon name="chat" /> {h.chatButton || 'Написать флористу'}
              </ChatOpen>
              <Link href="#katalog" className="btn btn--outline">
                {h.catalogButton || 'Смотреть букеты'}
              </Link>
            </div>
            <div className="hero-c">
              {tel && (
                <a href={tel}>
                  <Icon name="phone" />
                  <span>
                    <b>{s.phone}</b>
                    <small>{s.hours}</small>
                  </span>
                </a>
              )}
              {s.instagram && (
                <a href={s.instagram} target="_blank" rel="noopener">
                  <Icon name="instagram" />
                  <span>
                    <b>Instagram</b>
                    <small>{s.instagramNote || 'Наши работы'}</small>
                  </span>
                </a>
              )}
            </div>
          </div>
          <div className="hero-m">
            {video?.url ? <HeroVideo src={video.url} poster={poster} /> : poster}
          </div>
        </div>
      </section>

      <div id="katalog" />
      {bouquets.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <Opener k="Каталог" title={h.bouquetsTitle} text={h.bouquetsText} aside={<Link href="/bukety" className="lnk">Все букеты <Icon name="arrow" /></Link>} />
            <Tiles cats={bouquets} counts={counts} base="bukety" />
          </div>
        </section>
      )}

      {compositions.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <Opener k="Каталог" title={h.compositionsTitle} text={h.compositionsText} aside={<Link href="/kompozicii" className="lnk">Все композиции <Icon name="arrow" /></Link>} />
            <Tiles cats={compositions} counts={counts} base="kompozicii" />
          </div>
        </section>
      )}

      {h.showBuilder !== false && flowers.length > 0 && (
        <section className="sec" id="konstruktor">
          <div className="wrap">
            <Opener k="Конструктор" title={b.title} text={b.text} />
            <Builder
              flowers={flowers.map((f) => ({ id: f.id, name: f.name, variety: f.variety, price: f.price, unit: f.unit, stock: f.stock, thumb: thumbUrl(f.image) }))}
              packaging={(b.packaging || []).map((p) => ({ name: p.name, price: p.price, note: p.note }))}
              minStems={b.minStems || 1}
              note={b.note}
            />
          </div>
        </section>
      )}

      {h.showFeatured !== false && featured.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <Opener k="Популярное" title={h.featuredTitle} />
            <ProductGrid products={featured} />
          </div>
        </section>
      )}

      {h.showSteps !== false && h.steps && h.steps.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <Opener k="Как мы работаем" title={h.stepsTitle} />
            <ol className="steps">
              {h.steps.map((st, i) => (
                <li key={i}>
                  <p className="step-n">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="step-h">{st.title}</h3>
                  {st.text ? <p className="step-d">{st.text}</p> : null}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {h.showAbout !== false && (
        <section className="sec">
          <div className="wrap">
            <div className="about">
              <div>
                <p className="k">О флористе</p>
                <h2 className="h2" style={{ marginTop: 20 }}>
                  <Em text={h.aboutTitle} />
                </h2>
                {h.aboutText ? <p className="lead about-x">{h.aboutText}</p> : null}
                <ul className="about-c">
                  {s.address && (
                    <li>
                      <Icon name="pin" /> {s.address}
                      {s.mapLink ? (
                        <>
                          {' · '}
                          <a href={s.mapLink} target="_blank" rel="noopener">
                            на карте
                          </a>
                        </>
                      ) : null}
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
                </ul>
              </div>
              {h.aboutImage ? (
                <div className="about-m">
                  <Img media={h.aboutImage} sizes="(max-width: 1023px) 100vw, 55vw" />
                </div>
              ) : null}
            </div>
            {h.stats && h.stats.length > 0 && (
              <div className="figs">
                {h.stats.map((x, i) => (
                  <div className="fig" key={i}>
                    <span className="fig-v">{x.value}</span>
                    <span className="fig-l">
                      {x.link ? (
                        <a href={x.link} target="_blank" rel="noopener">
                          {x.label}
                        </a>
                      ) : (
                        x.label
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {h.showFaq !== false && h.faq && h.faq.length > 0 && (
        <section className="sec sec-b">
          <div className="wrap faq-g">
            <div>
              <p className="k">Вопросы</p>
              <h2 className="h2" style={{ marginTop: 20 }}>
                Коротко <em>о главном</em>
              </h2>
              <p className="lead" style={{ marginTop: 16 }}>
                Не нашли ответ?{' '}
                <ChatOpen className="lnk">Спросите флориста</ChatOpen>
              </p>
            </div>
            <div className="accs">
              {h.faq.map((f, i) => (
                <details className="acc" key={i}>
                  <summary>
                    {f.q}
                    <Icon name="plus" />
                  </summary>
                  <p className="acc-a">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
      {!(h.showFaq !== false && h.faq && h.faq.length > 0) && <div className="sec-b" />}
    </>
  )
}
