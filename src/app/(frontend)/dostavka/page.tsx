import type { Metadata } from 'next'
import Link from 'next/link'
import { Icon } from '@/components/Icon'
import { Opener } from '@/components/Opener'
import { getDelivery, getHome } from '@/lib/data'
import { rub } from '@/lib/format'

export const metadata: Metadata = { title: 'Доставка и оплата' }

export default async function DeliveryPage() {
  const [d, h] = await Promise.all([getDelivery(), getHome()])
  return (
    <div className="wrap sec-b">
      <nav aria-label="Навигационная цепочка">
        <ol className="crumbs">
          <li>
            <Link href="/">Главная</Link>
          </li>
          <li>Доставка и оплата</li>
        </ol>
      </nav>
      <Opener as="h1" title={d.title} text={d.intro} />
      {d.zones && d.zones.length > 0 && (
        <ul className="zones">
          {d.zones.map((z, i) => (
            <li className="zone" key={i}>
              <span className="zone-n">{z.name}</span>
              <span className="zone-d">{z.description}</span>
              <span className="zone-p">{z.priceNote || (z.price ? rub(z.price) : 'бесплатно')}</span>
            </li>
          ))}
        </ul>
      )}
      {d.freeFrom ? (
        <p className="note" style={{ marginTop: 20 }}>
          <Icon name="truck" />
          <span>
            Бесплатная доставка при заказе от <b>{rub(d.freeFrom)}</b>
          </span>
        </p>
      ) : null}
      {d.intervals && d.intervals.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <p className="lbl" style={{ marginBottom: 12 }}>
            Интервалы доставки
          </p>
          <div className="chips">
            {d.intervals.map((i) => (
              <span key={i.label} className="chip" style={{ cursor: 'default' }}>
                {i.label}
              </span>
            ))}
          </div>
        </div>
      )}
      {d.notes && d.notes.length > 0 && (
        <ul className="notes">
          {d.notes.map((n, i) => (
            <li key={i}>
              <h2>{n.title}</h2>
              {n.text ? <p>{n.text}</p> : null}
            </li>
          ))}
        </ul>
      )}
      {d.payment && (
        <section className="sec">
          <Opener k="Оплата" title="Как *оплатить*" />
          <p className="lead" style={{ maxWidth: 760, whiteSpace: 'pre-line' }}>
            {d.payment}
          </p>
        </section>
      )}
      {h.faq && h.faq.length > 0 && (
        <section className="sec">
          <Opener k="Вопросы" title="Коротко *о главном*" />
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
        </section>
      )}
    </div>
  )
}
