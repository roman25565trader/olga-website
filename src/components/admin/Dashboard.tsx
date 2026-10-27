import type { Payload } from 'payload'
import type { Media } from '@/payload-types'

type Props = { payload: Payload; user?: { name?: string | null; email?: string } | null }

const A = '/admin'

const thumb = (m: unknown) => {
  const media = m && typeof m === 'object' ? (m as Media) : null
  return media?.sizes?.xs?.url || media?.thumbnailURL || media?.url || null
}

function Tile({
  href,
  icon,
  title,
  text,
  count,
  countLabel,
  photos,
  accent,
}: {
  href: string
  icon: string
  title: string
  text: string
  count?: number
  countLabel?: string
  photos?: (string | null)[]
  accent?: boolean
}) {
  const pics = (photos || []).filter(Boolean).slice(0, 4) as string[]
  return (
    <a href={href} className={`oc-tile${accent ? ' oc-tile--accent' : ''}`}>
      <span className="oc-tile-top">
        <span className="oc-tile-i" aria-hidden="true">
          {icon}
        </span>
        {typeof count === 'number' ? (
          <span className={`oc-tile-c${count > 0 && accent ? ' is-hot' : ''}`}>
            <b>{count}</b> {countLabel}
          </span>
        ) : null}
      </span>
      <span className="oc-tile-h">{title}</span>
      <span className="oc-tile-x">{text}</span>
      {pics.length > 0 && (
        <span className="oc-tile-pics">
          {pics.map((src, i) => (
            <img key={i} src={src} alt="" width={64} height={64} loading="lazy" />
          ))}
        </span>
      )}
    </a>
  )
}

/** Главная страница админки: всё, что нужно, крупными плитками */
export async function Dashboard({ payload, user }: Props) {
  const [newOrders, allOrders, unread, products, flowers, cats, media] = await Promise.all([
    payload.count({ collection: 'orders', where: { status: { equals: 'new' } }, overrideAccess: true }),
    payload.count({ collection: 'orders', overrideAccess: true }),
    payload.count({ collection: 'chats', where: { unread: { equals: true } }, overrideAccess: true }),
    payload.find({ collection: 'products', limit: 4, depth: 1, sort: 'sortOrder', overrideAccess: true }),
    payload.find({ collection: 'flowers', limit: 4, depth: 1, sort: 'sortOrder', overrideAccess: true }),
    payload.find({ collection: 'categories', limit: 4, depth: 1, sort: 'sortOrder', overrideAccess: true }),
    payload.find({ collection: 'media', limit: 4, depth: 0, sort: '-createdAt', overrideAccess: true }),
  ])
  const name = user?.name || 'Ольга'

  return (
    <div className="oc-dash">
      <div className="oc-dash-head">
        <div>
          <h1 className="oc-dash-h">Здравствуйте, {name}! 🌷</h1>
          <p className="oc-dash-x">
            Нажмите на нужную плитку, поменяйте что хотите и нажмите <b>«Сохранить»</b> — сайт обновится сам через несколько
            секунд.
          </p>
        </div>
        <a href="/" target="_blank" rel="noopener" className="oc-site">
          Открыть сайт ↗
        </a>
      </div>

      <h2 className="oc-dash-s">Клиенты</h2>
      <div className="oc-grid">
        <Tile
          href={`${A}/collections/orders?where[status][equals]=new`}
          icon="📦"
          title="Новые заказы"
          text="Заказы, которые ещё не взяли в работу"
          count={newOrders.totalDocs}
          countLabel="новых"
          accent
        />
        <Tile
          href={`${A}/collections/chats`}
          icon="💬"
          title="Сообщения с сайта"
          text="Чат с флористом: прочитать и ответить"
          count={unread.totalDocs}
          countLabel="непрочитанных"
          accent
        />
        <Tile
          href={`${A}/collections/orders`}
          icon="🗂"
          title="Все заказы"
          text="История заказов и статусы"
          count={allOrders.totalDocs}
          countLabel="всего"
        />
      </div>

      <h2 className="oc-dash-s">Что продаём</h2>
      <div className="oc-grid">
        <Tile
          href={`${A}/collections/products`}
          icon="💐"
          title="Букеты и композиции"
          text="Добавить, поменять фото и цену, убрать из продажи"
          count={products.totalDocs}
          countLabel="шт."
          photos={products.docs.map((p) => thumb(p.images?.[0]))}
        />
        <Tile
          href={`${A}/collections/flowers`}
          icon="🌷"
          title="Цветы для конструктора"
          text="Что есть сегодня и почём за стебель"
          count={flowers.totalDocs}
          countLabel="видов"
          photos={flowers.docs.map((f) => thumb(f.image))}
        />
        <Tile
          href={`${A}/collections/categories`}
          icon="🧺"
          title="Разделы каталога"
          text="Моно, авторские, в коробочках…"
          count={cats.totalDocs}
          countLabel="разделов"
          photos={cats.docs.map((c) => thumb(c.image))}
        />
        <Tile
          href={`${A}/collections/media`}
          icon="🖼"
          title="Все фото и видео"
          text="Загрузить новые фото и видео-обращение"
          count={media.totalDocs}
          countLabel="файлов"
          photos={media.docs.map(thumb)}
        />
      </div>

      <h2 className="oc-dash-s">Тексты сайта</h2>
      <div className="oc-grid oc-grid--sm">
        <Tile href={`${A}/globals/home`} icon="🏠" title="Главная страница" text="Заголовок, видео, вопросы-ответы" />
        <Tile href={`${A}/globals/delivery`} icon="🚚" title="Доставка и оплата" text="Зоны, цены, время доставки" />
        <Tile href={`${A}/globals/builder`} icon="🎀" title="Конструктор букета" text="Оформление и его цена" />
        <Tile href={`${A}/globals/about`} icon="👩‍🌾" title="О нас" text="Текст и фото" />
        <Tile href={`${A}/globals/settings`} icon="📞" title="Телефон и контакты" text="Телефон, Instagram, адрес, часы" />
        <Tile href={`${A}/collections/pages`} icon="📄" title="Документы" text="Оферта, политика" />
      </div>
    </div>
  )
}
