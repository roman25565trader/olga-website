'use client'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cart, cartTotal, useCart } from '@/lib/cart'
import { rub } from '@/lib/format'
import { Icon } from '../Icon'

type Zone = { name: string; price: number; priceNote?: string | null; description?: string | null }
type Props = {
  zones: Zone[]
  freeFrom?: number | null
  pickupEnabled: boolean
  pickupAddress?: string | null
  intervals: string[]
  paymentText?: string | null
  policyHref?: string
}

function F({ name, label, errors, children }: { name: string; label: string; errors: Record<string, string>; children: React.ReactNode }) {
  return (
    <label className={`field${errors[name] ? ' is-err' : ''}`}>
      <span className="label">{label}</span>
      {children}
      {errors[name] && <span className="err">{errors[name]}</span>}
    </label>
  )
}

const today = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

export function Checkout({ zones, freeFrom, pickupEnabled, pickupAddress, intervals, paymentText, policyHref }: Props) {
  const items = useCart()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [method, setMethod] = useState<'delivery' | 'pickup'>(zones.length ? 'delivery' : 'pickup')
  const [zone, setZone] = useState(0)
  const [other, setOther] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const [fail, setFail] = useState('')
  const form = useRef<HTMLFormElement>(null)

  const itemsTotal = cartTotal(items)
  const z = zones[zone]
  const deliveryPrice = useMemo(() => {
    if (method === 'pickup' || !z) return 0
    if (freeFrom && itemsTotal >= freeFrom) return 0
    return z.price
  }, [method, z, freeFrom, itemsTotal])
  const total = itemsTotal + deliveryPrice

  if (done)
    return (
      <div className="ok">
        <p className="k" style={{ justifyContent: 'center' }}>
          Заказ №{done}
        </p>
        <h2 className="h2">
          Спасибо, <em>заказ принят</em>
        </h2>
        <p>Ольга свяжется с вами в ближайшее время, подтвердит состав и время, пришлёт ссылку на оплату. Фото букета — до отправки.</p>
        <p style={{ marginTop: 28 }}>
          <Link href="/" className="btn btn--outline">
            На главную
          </Link>
        </p>
      </div>
    )

  if (!mounted) return <p className="empty">Загружаем корзину…</p>

  if (!items.length)
    return (
      <div className="ok">
        <h2 className="h2">Корзина пуста</h2>
        <p>Выберите букет в каталоге или соберите свой в конструкторе.</p>
        <p style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/bukety" className="btn btn--primary">
            Букеты
          </Link>
          <Link href="/konstruktor" className="btn btn--outline">
            Собрать свой
          </Link>
        </p>
      </div>
    )

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData(form.current!)
    const v = (k: string) => String(fd.get(k) || '').trim()
    const errs: Record<string, string> = {}
    if (!v('customerName')) errs.customerName = 'Как к вам обращаться?'
    if (v('customerPhone').replace(/\D/g, '').length < 10) errs.customerPhone = 'Нужен телефон, чтобы подтвердить заказ'
    if (method === 'delivery' && !v('address')) errs.address = 'Куда привезти?'
    if (!fd.get('agree')) errs.agree = 'Нужно согласие на обработку данных'
    setErrors(errs)
    if (Object.keys(errs).length) {
      form.current?.querySelector<HTMLElement>('.is-err input, .is-err textarea')?.focus()
      return
    }
    setSending(true)
    setFail('')
    try {
      const r = await fetch('/shop-api/order', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) =>
            i.kind === 'product'
              ? { kind: 'product', id: i.id, variant: i.variant, qty: i.qty }
              : { kind: 'builder', lines: i.lines.map((l) => ({ id: l.id, qty: l.qty })), packaging: i.packaging, qty: i.qty },
          ),
          customerName: v('customerName'),
          customerPhone: v('customerPhone'),
          recipientName: other ? v('recipientName') : '',
          recipientPhone: other ? v('recipientPhone') : '',
          deliveryMethod: method,
          zone: method === 'delivery' ? z?.name : '',
          address: method === 'delivery' ? v('address') : '',
          deliveryDate: v('deliveryDate'),
          deliveryTime: v('deliveryTime'),
          cardText: v('cardText'),
          comment: v('comment'),
          anonymous: Boolean(fd.get('anonymous')),
          website: v('website'),
        }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Не получилось оформить заказ')
      cart.clear()
      setDone(d.number)
      window.scrollTo({ top: 0 })
    } catch (err) {
      setFail(err instanceof Error ? err.message : 'Ошибка сети. Попробуйте ещё раз или позвоните нам.')
    } finally {
      setSending(false)
    }
  }

  return (
    <form className="co" ref={form} onSubmit={submit} noValidate>
      <div>
        <section className="co-sec">
          <h2>Ваш заказ</h2>
          <ul>
            {items.map((i) => (
              <li key={i.key} className="li">
                {i.image ? <img className="li-ph" src={i.image} alt="" width={72} height={90} /> : <span className="li-ph" />}
                <div>
                  <p className="li-n">
                    {i.kind === 'product' ? <Link href={`/tovar/${i.slug}`}>{i.title}</Link> : i.title}
                  </p>
                  <p className="li-m">
                    {i.kind === 'product'
                      ? i.variant
                        ? `Размер ${i.variant}`
                        : null
                      : `${i.lines.map((l) => `${l.name} × ${l.qty}`).join(', ')}${i.packaging ? ` · ${i.packaging}` : ''}`}
                  </p>
                  <div className="li-a">
                    <span className="qty qty--sm">
                      <button type="button" className="qty-b" onClick={() => cart.setQty(i.key, i.qty - 1)} aria-label="Меньше">
                        <Icon name="minus" />
                      </button>
                      <span className="qty-v">{i.qty}</span>
                      <button type="button" className="qty-b" onClick={() => cart.setQty(i.key, i.qty + 1)} aria-label="Больше">
                        <Icon name="plus" />
                      </button>
                    </span>
                    <button type="button" onClick={() => cart.remove(i.key)}>
                      Удалить
                    </button>
                  </div>
                </div>
                <p className="li-p">{rub(i.price * i.qty)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="co-sec">
          <h2>Ваши контакты</h2>
          <div className="fields fields--2">
            <F errors={errors} name="customerName" label="Имя">
              <input className="input" name="customerName" autoComplete="name" />
            </F>
            <F errors={errors} name="customerPhone" label="Телефон">
              <input className="input" name="customerPhone" type="tel" autoComplete="tel" placeholder="+7" />
            </F>
          </div>
          <label className="check">
            <input type="checkbox" checked={other} onChange={(e) => setOther(e.target.checked)} />
            <span>Получатель — другой человек</span>
          </label>
          {other && (
            <div className="fields fields--2">
              <F errors={errors} name="recipientName" label="Имя получателя">
                <input className="input" name="recipientName" />
              </F>
              <F errors={errors} name="recipientPhone" label="Телефон получателя">
                <input className="input" name="recipientPhone" type="tel" placeholder="+7" />
              </F>
              <label className="check">
                <input type="checkbox" name="anonymous" />
                <span>Не говорить получателю, от кого букет</span>
              </label>
            </div>
          )}
        </section>

        <section className="co-sec">
          <h2>Доставка</h2>
          {pickupEnabled && zones.length > 0 && (
            <div className="chips" role="group" aria-label="Способ получения" style={{ marginBottom: 16 }}>
              <button type="button" className="chip" aria-pressed={method === 'delivery'} onClick={() => setMethod('delivery')}>
                Доставка
              </button>
              <button type="button" className="chip" aria-pressed={method === 'pickup'} onClick={() => setMethod('pickup')}>
                Самовывоз <small>бесплатно</small>
              </button>
            </div>
          )}
          {method === 'delivery' ? (
            <div className="fields">
              {zones.length > 1 && (
                <div className="chips" role="group" aria-label="Зона доставки">
                  {zones.map((zz, i) => (
                    <button key={i} type="button" className="chip" aria-pressed={i === zone} onClick={() => setZone(i)}>
                      {zz.name} <small>{zz.priceNote || rub(zz.price)}</small>
                    </button>
                  ))}
                </div>
              )}
              {z?.description && <p className="meta">{z.description}</p>}
              <F errors={errors} name="address" label="Адрес">
                <input className="input" name="address" autoComplete="street-address" placeholder="Улица, дом, квартира, подъезд" />
              </F>
            </div>
          ) : (
            <p className="note">
              <Icon name="pin" />
              <span>Самовывоз: {pickupAddress}</span>
            </p>
          )}
          <div className="fields fields--2" style={{ marginTop: 16 }}>
            <F errors={errors} name="deliveryDate" label="Дата">
              <input className="input" type="date" name="deliveryDate" defaultValue={today()} min={today()} />
            </F>
            <F errors={errors} name="deliveryTime" label="Время">
              {intervals.length ? (
                <select className="select" name="deliveryTime" defaultValue="">
                  <option value="">Как можно скорее</option>
                  {intervals.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              ) : (
                <input className="input" name="deliveryTime" placeholder="Например, 14:00–16:00" />
              )}
            </F>
          </div>
          <div className="fields" style={{ marginTop: 16 }}>
            <F errors={errors} name="cardText" label="Текст открытки (необязательно)">
              <textarea className="textarea" name="cardText" maxLength={500} />
            </F>
            <F errors={errors} name="comment" label="Комментарий (необязательно)">
              <textarea className="textarea" name="comment" maxLength={1000} placeholder="Пожелания по цветам, удобное время звонка…" />
            </F>
          </div>
        </section>
      </div>

      <aside className="sum">
        <div className="sum-r">
          <span>Товары</span>
          <b>{rub(itemsTotal)}</b>
        </div>
        <div className="sum-r">
          <span>Доставка</span>
          <b>{method === 'pickup' ? 'самовывоз' : deliveryPrice === 0 ? 'бесплатно' : z?.priceNote || rub(deliveryPrice)}</b>
        </div>
        <div className="sum-r sum-r--t">
          <span>Итого</span>
          <b>{rub(total)}</b>
        </div>
        {freeFrom && method === 'delivery' && itemsTotal < freeFrom ? (
          <p className="meta" style={{ marginTop: 8 }}>
            До бесплатной доставки — {rub(freeFrom - itemsTotal)}
          </p>
        ) : null}
        <input name="website" tabIndex={-1} autoComplete="off" className="vh" aria-hidden="true" />
        <label className={`check${errors.agree ? ' is-err' : ''}`} style={{ marginTop: 12 }}>
          <input type="checkbox" name="agree" defaultChecked />
          <span>
            Согласен(на) на обработку персональных данных
            {policyHref ? (
              <>
                {' '}
                — <Link href={policyHref}>политика</Link>
              </>
            ) : null}
          </span>
        </label>
        {errors.agree && <p className="err">{errors.agree}</p>}
        <button type="submit" className="btn btn--primary btn--block" disabled={sending} style={{ marginTop: 12 }}>
          {sending ? 'Отправляем…' : `Оформить заказ · ${rub(total)}`}
        </button>
        {fail && (
          <p className="err" role="alert" style={{ marginTop: 10 }}>
            {fail}
          </p>
        )}
        {paymentText ? (
          <p className="meta" style={{ marginTop: 14 }}>
            {paymentText}
          </p>
        ) : null}
      </aside>
    </form>
  )
}
