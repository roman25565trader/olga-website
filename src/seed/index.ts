/**
 * Первичное наполнение сайта: разделы, букеты, цветы для конструктора, тексты.
 * Запускается один раз (на Vercel — автоматически при первой сборке); повторно ничего не делает.
 * Принудительно: SEED_FORCE=1 npm run seed
 */
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const img = (name: string) => path.resolve(dirname, 'images', `${name}.jpg`)

type Node = Record<string, unknown>
const text = (t: string): Node => ({ type: 'text', text: t, format: 0, style: '', mode: 'normal', detail: 0, version: 1 })
const para = (t: string): Node => ({ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, children: [text(t)] })
const h2 = (t: string): Node => ({ type: 'heading', tag: 'h2', format: '', indent: 0, version: 1, direction: 'ltr', children: [text(t)] })
const doc = (...children: Node[]) => ({ root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children } }) as never

const payload = await getPayload({ config })

const settings = await payload.findGlobal({ slug: 'settings', depth: 0 })
if (settings.seededAt && !process.env.SEED_FORCE) {
  payload.logger.info('Сайт уже наполнен — пропускаем')
  process.exit(0)
}

payload.logger.info('Наполняем сайт стартовым содержимым…')

// Ошибки наполнения пишем в служебную таблицу seed_log — их видно и без доступа к логам сборки
const log = async (msg: string) => {
  console.error(msg)
  try {
    const pool = (payload.db as unknown as { pool: { query: (q: string, v?: unknown[]) => Promise<unknown> } }).pool
    await pool.query('create table if not exists seed_log (at timestamptz default now(), msg text)')
    await pool.query('insert into seed_log (msg) values ($1)', [msg.slice(0, 4000)])
  } catch {}
}
for (const ev of ['unhandledRejection', 'uncaughtException'] as const)
  process.on(ev, async (e: unknown) => {
    await log(`${ev}: ${e instanceof Error ? e.stack : String(e)}`)
    process.exit(1)
  })

const media: Record<string, number> = {}
// Фото не должно ронять сборку: если загрузка не удалась, сайт наполнится без него
const up = async (name: string, alt: string): Promise<number | undefined> => {
  if (media[name]) return media[name]
  try {
    const m = await payload.create({ collection: 'media', data: { alt }, filePath: img(name) })
    media[name] = m.id
    return m.id
  } catch (e) {
    await log(`media ${name}: ${e instanceof Error ? e.stack || e.message : String(e)}`)
    return undefined
  }
}

// ---------- разделы ----------
const CAT_SLUG: Record<string, string> = {
  'b-mono': 'mono',
  'b-avt': 'avtorskie',
  'b-oform': 's-oformleniem',
  'b-lenta': 'tolko-lenta',
  'k-mono': 'mono-kompozicii',
  'k-avt': 'avtorskie-kompozicii',
  'k-bag': 'v-sumochkah',
  'k-box': 'v-korobochkah',
}

const catDefs = [
  { key: 'b-mono', title: 'Моно', section: 'bukety', image: ['roses-25', 'Монобукет из красных роз'], description: 'Букеты из одного вида цветов: розы, хризантемы, эустома.' },
  { key: 'b-avt', title: 'Авторские', section: 'bukety', image: ['peach', 'Авторский букет из садовых роз'], description: 'Ольга собирает сочетания сама — из сегодняшней поставки.' },
  { key: 'b-oform', title: 'С оформлением', section: 'bukety', image: ['pudra', 'Букет в пудровой бумаге'], description: 'В бумаге или матовой плёнке, с лентой.' },
  { key: 'b-lenta', title: 'Только лента', section: 'bukety', image: ['ribbon', 'Букет, перевязанный лентой'], description: 'Без упаковки — только живые стебли и атласная лента.' },
  { key: 'k-mono', title: 'Моно', section: 'kompozicii', image: ['peonies', 'Композиция из белых пионов'], description: 'Композиции из одного вида цветов.' },
  { key: 'k-avt', title: 'Авторские', section: 'kompozicii', image: ['red-accent', 'Авторская композиция'], description: 'Авторские композиции Ольги.' },
  { key: 'k-bag', title: 'В сумочках', section: 'kompozicii', image: ['hatbox', 'Цветы в сумочке'], description: 'Цветы в сумочке — удобно дарить и нести.' },
  { key: 'k-box', title: 'В коробочках', section: 'kompozicii', image: ['box-garden', 'Цветы в коробке'], description: 'Композиции в коробке на флористической губке — стоят без вазы.' },
] as const

const cat: Record<string, number> = {}
for (const [i, c] of catDefs.entries()) {
  const doc = await payload.create({
    collection: 'categories',
    data: {
      title: c.title,
      section: c.section,
      slug: CAT_SLUG[c.key],
      description: c.description,
      image: await up(c.image[0], c.image[1]),
      sortOrder: i + 1,
      active: true,
    },
  })
  cat[c.key] = doc.id
}

// ---------- товары ----------
const products = [
  { title: '25 роз', price: 5100, short: 'Монобукет из красных роз 50 см · Ø 45 см', cats: ['b-mono'], imgs: [['roses-25', 'Монобукет из 25 красных роз']], featured: true, badge: 'Хит', composition: 'Роза «Эксплорер» 50 см — 25 шт, лента.' },
  { title: 'Аваланж', price: 3200, short: '15 белых роз 60 см · Ø 40 см', cats: ['b-mono', 'b-lenta'], imgs: [['avalanche', 'Букет из белых роз в вазе']], featured: true, composition: 'Роза «Аваланж» 60 см — 15 шт, атласная лента.' },
  { title: 'Белый шум', price: 2900, short: '9 веток кустовой хризантемы в крафте', cats: ['b-mono', 'b-oform'], imgs: [['white-noise', 'Букет из белой кустовой хризантемы']], composition: 'Хризантема кустовая «Бакарди» — 9 веток, крафт.' },
  { title: 'Тишина', price: 4200, short: '11 белых эустом · только лента', cats: ['b-mono', 'b-lenta'], imgs: [['silence', 'Букет из белой эустомы']], composition: 'Эустома белая — 11 веток, лента.' },
  {
    title: 'Пудра',
    price: 3600,
    short: 'Альстромерия, кустовая роза, гипсофила, эвкалипт',
    cats: ['b-avt', 'b-oform'],
    imgs: [['pudra', 'Букет «Пудра» в розовой бумаге'], ['ribbon', 'Лента на букете «Пудра»']],
    featured: true,
    description: 'Пудровая гамма из сегодняшней поставки. Нежный, лёгкий букет — на день рождения, маме, коллеге.',
    composition: 'Альстромерия, кустовая роза, гипсофила, эвкалипт «Цинерея», бумага, лента.',
    sizes: [
      { label: 'S', note: '9 стеблей · Ø 25 см', price: 2900 },
      { label: 'M', note: '15 стеблей · Ø 35 см', price: 3600 },
      { label: 'L', note: '25 стеблей · Ø 45 см', price: 5400 },
    ],
  },
  { title: 'Утро', price: 3300, short: 'Эустома и зелень · Ø 35 см', cats: ['b-avt', 'b-lenta'], imgs: [['morning', 'Букет «Утро» из розовой эустомы']], featured: true, composition: 'Эустома розовая, зелень, лента.' },
  { title: 'Персиковый сад', price: 4600, short: 'Пионовидные розы, гвоздика, зелень', cats: ['b-avt'], imgs: [['peach', 'Букет из персиковых садовых роз'], ['peach-2', 'Садовые розы крупным планом']], featured: true, composition: 'Роза пионовидная, гвоздика, лимониум, зелень.' },
  { title: 'Осенний сад', price: 3200, short: 'Танацетум, злаки, сухие травы · Ø 40 см', cats: ['b-avt'], imgs: [['autumn', 'Букет «Осенний сад»']], composition: 'Танацетум, злаки, сухоцветы.' },
  { title: 'Гербарий', price: 2400, short: 'Сухоцветы, лагурус, ранункулюс · Ø 30 см', cats: ['b-avt'], imgs: [['herbarium', 'Букет «Гербарий»']], composition: 'Ранункулюс, лагурус, сухоцветы, эвкалипт.' },
  { title: 'Мини', price: 1500, short: '5 стеблей в крафте · коллеге, учителю', cats: ['b-oform'], imgs: [['mini', 'Небольшой букет в крафте']], featured: true, composition: 'Сезонные цветы — 5 стеблей, крафт, лента.' },
  { title: 'Красный акцент', price: 4400, short: 'Белые и бордовые розы, эвкалипт', cats: ['k-avt'], imgs: [['red-accent', 'Композиция из белых и бордовых роз']], composition: 'Роза белая, роза бордовая, эвкалипт, флористическая губка.' },
  { title: 'Пионы у окна', price: 5900, short: 'Белые пионы в вазе', cats: ['k-mono'], imgs: [['peonies', 'Белые пионы в вазе']], composition: 'Пион белый — 9 шт, ваза в подарок.' },
  { title: 'Сад в коробке', price: 6900, short: 'Розы, эустома, гвоздика · коробка 40 × 30 см', cats: ['k-box'], imgs: [['box-garden', 'Цветы в коробке'], ['box-garden-2', 'Композиция в коробке']], featured: true, composition: 'Роза, эустома, гвоздика, зелень, коробка, губка.' },
  { title: 'Нежность в сумочке', price: 4800, short: 'Пионовидные розы и диантус', cats: ['k-bag'], imgs: [['hatbox', 'Цветы в сумочке']], composition: 'Роза пионовидная, диантус, гвоздика, сумочка.' },
]

for (const [i, p] of products.entries()) {
  const images: number[] = []
  for (const [n, alt] of p.imgs) {
    const id = await up(n, alt)
    if (id) images.push(id)
  }
  await payload.create({
    collection: 'products',
    data: {
      title: p.title,
      price: p.price,
      short: p.short,
      description: 'description' in p ? p.description : undefined,
      composition: p.composition,
      categories: p.cats.map((k) => cat[k]),
      images,
      featured: Boolean(p.featured),
      badge: 'badge' in p ? p.badge : undefined,
      sizes: 'sizes' in p ? p.sizes : [],
      sortOrder: i + 1,
      active: true,
    },
  })
}

// ---------- цветы для конструктора ----------
const flowers = [
  ['Хризантема', 'кустовая «Бакарди», белая', 250, 'branch', 'in', 'f-chrysanthemum'],
  ['Роза', '«Аваланж», белая, 60 см', 190, 'stem', 'in', 'f-rose-white'],
  ['Роза', '«Эксплорер», красная, 60 см', 210, 'stem', 'in', 'f-rose-red'],
  ['Альстромерия', 'пудровая', 230, 'branch', 'in', 'f-alstroemeria'],
  ['Эустома', 'нежно-розовая', 320, 'branch', 'in', 'f-eustoma'],
  ['Диантус', 'бордовый', 160, 'stem', 'in', 'f-dianthus'],
  ['Гипсофила', 'белая, наполнитель', 200, 'branch', 'low', 'f-gypsophila'],
  ['Эвкалипт', '«Цинерея», зелень', 150, 'branch', 'in', 'f-eucalyptus'],
  ['Писташ', 'тёмно-зелёный, зелень', 120, 'branch', 'in', 'f-pistache'],
] as const
for (const [i, [name, variety, price, unit, stock, image]] of flowers.entries()) {
  await payload.create({
    collection: 'flowers',
    data: { name, variety, price, unit, stock, image: await up(image, `${name} ${variety}`), sortOrder: i + 1, active: true },
  })
}

// ---------- страницы ----------
await payload.create({
  collection: 'pages',
  data: {
    title: 'Политика конфиденциальности',
    slug: 'politika-konfidencialnosti',
    inFooter: true,
    content: doc(
      para('Мы бережно относимся к вашим данным. Имя, телефон и адрес нужны только для того, чтобы принять, собрать и доставить заказ, и не передаются третьим лицам, кроме курьера.'),
      h2('Какие данные мы собираем'),
      para('Имя, телефон, адрес доставки, имя и телефон получателя, текст открытки и комментарий к заказу, сообщения в чате с флористом.'),
      h2('Как связаться'),
      para('Чтобы удалить ваши данные, напишите или позвоните нам — контакты внизу страницы. [Замените этот текст на полную политику магазина.]'),
    ),
  },
})
await payload.create({
  collection: 'pages',
  data: {
    title: 'Публичная оферта',
    slug: 'oferta',
    inFooter: true,
    content: doc(para('[Текст публичной оферты — добавьте в админке: «Текстовые страницы» → «Публичная оферта».]')),
  },
})

// ---------- глобальные тексты ----------
const heroImage = await up('peach', 'Садовые розы и гвоздика в стеклянной вазе')
const aboutImage = await up('olga-hands', 'Руки Ольги собирают букет')

await payload.updateGlobal({
  slug: 'home',
  data: {
    heroKicker: 'Цветочный салон · Магнитогорск',
    heroTitle: 'Цветы с *душой*',
    heroText: 'Букеты и композиции Ольги из свежей поставки. Напишите флористу — соберём под ваш повод и бюджет и пришлём фото до отправки.',
    heroImage,
    chatButton: 'Написать флористу',
    catalogButton: 'Смотреть букеты',
    bouquetsTitle: 'Букеты',
    compositionsTitle: 'Композиции',
    showFeatured: true,
    featuredTitle: 'Любимые *букеты*',
    showBuilder: true,
    showSteps: true,
    stepsTitle: 'Как мы *работаем*',
    steps: [
      { title: 'Вы выбираете', text: 'Готовый букет из каталога, свой — в конструкторе, или просто напишите в чат, что хотите.' },
      { title: 'Ольга собирает', text: 'Из свежих цветов сегодняшней поставки — то, что вы видите на сайте.' },
      { title: 'Присылаем фото', text: 'До отправки пришлём фото букета. Одна правка — бесплатно.' },
      { title: 'Привозим', text: 'Курьер по городу в день заказа. Можно анонимно, можно узнать адрес у получателя.' },
    ],
    showAbout: true,
    aboutTitle: 'Ольга Шашкова, *16 лет* во флористике',
    aboutText: 'Владелица и флорист. Каждое утро Ольга сама отбирает цветы из свежей поставки — из них собираются букеты дня и ваш собственный. Девиз салона — «Цветы с душой».',
    aboutImage,
    stats: [
      { value: '4,88', label: 'Flowwow · 10 410 оценок' },
      { value: '4,9', label: '2ГИС · 49 оценок' },
      { value: '16 лет', label: 'во флористике' },
    ],
    showFaq: true,
    faq: [
      { q: 'Как я увижу букет до отправки?', a: 'Пришлём фото в WhatsApp, Telegram или SMS перед отправкой. Одна правка бесплатно: заменим 1–2 цветка, ленту или бумагу.' },
      { q: 'Не знаю адрес получателя', a: 'Укажите только телефон получателя — курьер сам позвонит и уточнит адрес и удобное время. Можем не говорить, от кого букет.' },
      { q: 'Что, если получателя нет дома?', a: 'Курьер ждёт 15 минут и звонит вам. Договоримся о другом времени или передадим соседям/на ресепшен.' },
      { q: 'Сколько простоит букет?', a: 'Букет в воде — от 5 дней при уходе, композиция в коробке — от 3 дней. Подскажем, как ухаживать.' },
      { q: 'Как оплатить?', a: 'После оформления Ольга подтвердит заказ и пришлёт ссылку на оплату по СБП или реквизиты. При самовывозе — можно на месте.' },
    ],
  },
})

await payload.updateGlobal({
  slug: 'builder',
  data: {
    text: 'Здесь вы можете собрать свой букет из предложенных цветов',
    packaging: [
      { name: 'Без оформления', price: 0, note: 'Только лента' },
      { name: 'Матовая прозрачная плёнка', price: 300, note: 'Единое оформление для сборных букетов' },
    ],
    minStems: 3,
    note: 'Лента в подарок. Если число стеблей лучше сделать нечётным — подскажем.',
  },
})

await payload.updateGlobal({
  slug: 'delivery',
  data: {
    title: 'Доставка и *оплата*',
    intro: 'Привозим по Магнитогорску каждый день. Закажите до 19:00 — привезём сегодня.',
    zones: [
      { name: 'Правый берег', price: 300, description: 'По городу, сегодня — при заказе до 19:00' },
      { name: 'Левый берег', price: 450, description: 'По городу, сегодня — при заказе до 19:00' },
      { name: 'Посёлки', price: 600, description: 'Цемзавод, Димитрово, Поля орошения, Берёзки' },
      { name: 'Пригороды', price: 0, priceNote: '≈35 ₽/км', description: 'Агаповка, Абзаково, Банное, аэропорт — цену назовём до оплаты' },
    ],
    freeFrom: 6000,
    pickupEnabled: true,
    intervals: [{ label: '10:00–13:00' }, { label: '13:00–16:00' }, { label: '16:00–19:00' }, { label: '19:00–21:00' }],
    notes: [
      { title: 'Фото до отправки', text: 'Пришлём фото букета перед отправкой. Одна правка бесплатно.' },
      { title: 'Свежесть', text: 'Букет в воде — от 5 дней при уходе. Завянет раньше — пришлите фото, заменим.' },
      { title: 'Честные замены', text: 'Если какого-то цветка не окажется — заменим на близкий по оттенку, не дешевле, и согласуем с вами.' },
    ],
    payment: 'После оформления заказа Ольга свяжется с вами, подтвердит состав и время и пришлёт ссылку на оплату по СБП. Оплата при получении — только при самовывозе.',
  },
})

await payload.updateGlobal({
  slug: 'about',
  data: {
    title: 'О *нас*',
    lead: 'Небольшой цветочный салон в Магнитогорске. Букеты собирает Ольга — 16 лет во флористике.',
    image: await up('olga-work', 'Ольга за работой'),
    content: doc(
      para('Каждое утро Ольга сама отбирает цветы из свежей поставки. Из них собираются букеты дня, композиции и ваш собственный букет из конструктора.'),
      para('Мы не работаем с корзинами и не продаём то, что не подарили бы сами. Всё чётко и понятно: фото до отправки, честные замены и доставка в день заказа.'),
    ),
    gallery: [
      await up('shop', 'Вёдра со свежими цветами у витрины'),
      await up('peonies', 'Белые пионы'),
      await up('peach-2', 'Садовые розы'),
      await up('ribbon', 'Лента на букете'),
    ].filter((x): x is number => Boolean(x)),
  },
})

await payload.updateGlobal({
  slug: 'settings',
  data: {
    siteName: 'Клумба',
    tagline: 'цветочный салон',
    city: 'Магнитогорск',
    topBar: [{ text: 'Магнитогорск' }, { text: 'Закажите до 19:00 — привезём сегодня' }, { text: 'Пришлём фото букета до отправки' }],
    phone: '8 (982) 322-84-85',
    whatsapp: '79823228485',
    telegram: 'https://t.me/olga_klumba',
    instagram: 'https://www.instagram.com/',
    instagramNote: 'Посмотрите наши работы',
    address: 'пр. Карла Маркса, 121',
    hours: 'Ежедневно 10:00–21:00',
    chatEnabled: true,
    seoDescription: 'Букеты и композиции с доставкой по Магнитогорску. Конструктор своего букета, чат с флористом, фото до отправки.',
    ogImage: heroImage,
    legal: 'ИП [ФИО] · ИНН [—]',
    seededAt: new Date().toISOString(),
  },
})

payload.logger.info('Готово: сайт наполнен')
process.exit(0)
