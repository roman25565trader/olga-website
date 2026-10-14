'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { cart } from '@/lib/cart'
import { plural, rub } from '@/lib/format'
import { Icon } from '../Icon'

export type BuilderFlower = {
  id: number
  name: string
  variety?: string | null
  price: number
  unit?: string | null
  stock?: string | null
  thumb?: string
}
type Pack = { name: string; price: number; note?: string | null }
type Props = { flowers: BuilderFlower[]; packaging: Pack[]; minStems: number; note?: string | null }

const UNIT: Record<string, string> = { stem: 'стебель', branch: 'ветку', pcs: 'шт' }

export function Builder({ flowers, packaging, minStems, note }: Props) {
  const router = useRouter()
  const [qty, setQty] = useState<Record<number, number>>({})
  const [pack, setPack] = useState(0)

  const lines = useMemo(
    () => flowers.filter((f) => (qty[f.id] || 0) > 0).map((f) => ({ id: f.id, name: f.variety ? `${f.name} ${f.variety}` : f.name, qty: qty[f.id], price: f.price })),
    [flowers, qty],
  )
  const count = lines.reduce((s, l) => s + l.qty, 0)
  const packObj = packaging[pack]
  const total = lines.reduce((s, l) => s + l.qty * l.price, 0) + (count ? packObj?.price || 0 : 0)
  const enough = count >= minStems

  useEffect(() => {
    document.body.classList.toggle('has-bar', count > 0)
    return () => document.body.classList.remove('has-bar')
  }, [count])

  const change = (id: number, d: number) => setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(201, (q[id] || 0) + d)) }))

  const submit = () => {
    if (!enough) return
    const key = `b-${lines.map((l) => `${l.id}x${l.qty}`).join('-')}-${pack}`
    cart.add({
      key,
      kind: 'builder',
      title: 'Ваш букет',
      lines,
      packaging: packObj?.name,
      price: total,
      qty: 1,
      image: flowers.find((f) => f.id === lines[0]?.id)?.thumb,
    })
    setQty({})
    router.push('/korzina')
  }

  return (
    <div className="bld">
      <ul className="bld-list">
        {flowers.map((f) => {
          const n = qty[f.id] || 0
          const out = f.stock === 'out'
          return (
            <li key={f.id} className={`bld-row${out ? ' is-out' : ''}${n ? ' is-on' : ''}`}>
              {f.thumb ? <img src={f.thumb} alt="" width={64} height={64} loading="lazy" decoding="async" /> : <span className="bld-ph" />}
              <span>
                <span className="bld-n">{f.name}</span>
                <span className="bld-v">
                  {[f.variety, out ? 'закончился' : f.stock === 'low' ? 'осталось мало' : null].filter(Boolean).join(' · ')}
                </span>
              </span>
              <span className="bld-p">
                {rub(f.price)}
                <small>за {UNIT[f.unit || 'stem'] || 'шт'}</small>
              </span>
              <span className="qty">
                <button type="button" className="qty-b" onClick={() => change(f.id, -1)} disabled={!n} aria-label={`Убрать: ${f.name}`}>
                  <Icon name="minus" />
                </button>
                <span className="qty-v" aria-live="polite">
                  {n}
                </span>
                <button type="button" className="qty-b" onClick={() => change(f.id, 1)} disabled={out} aria-label={`Добавить: ${f.name}`}>
                  <Icon name="plus" />
                </button>
              </span>
            </li>
          )
        })}
      </ul>

      <aside className="bld-sum" id="bld-sum">
        <p className="bld-sum-h">Ваш букет</p>
        <p className="bld-sel">
          {lines.length
            ? lines.map((l) => `${l.name} × ${l.qty}`).join(', ')
            : 'Пока пусто — добавьте цветы кнопкой «+»'}
        </p>
        {packaging.length > 0 && (
          <div className="bld-pack">
            <p className="lbl">Оформление</p>
            {packaging.map((p, i) => (
              <button key={i} type="button" className="opt" aria-pressed={i === pack} onClick={() => setPack(i)}>
                <span>
                  {p.name}
                  {p.note ? <small>{p.note}</small> : null}
                </span>
                <span className="nw">{p.price ? `+${rub(p.price)}` : 'бесплатно'}</span>
              </button>
            ))}
          </div>
        )}
        <div className="bld-tot">
          <span className="meta">
            {count} {plural(count, 'цветок', 'цветка', 'цветов')}
          </span>
          <span className="bld-tot-v">{rub(total)}</span>
        </div>
        <button type="button" className="btn btn--primary btn--block" disabled={!enough} onClick={submit}>
          {enough ? `Итог — оформить · ${rub(total)}` : `Добавьте от ${minStems} ${plural(minStems, 'цветка', 'цветов', 'цветов')}`}
        </button>
        {note ? <p className="bld-note">{note}</p> : null}
      </aside>

      {count > 0 && (
        <div className="bld-bar m-only">
          <span>
            <b>{rub(total)}</b>
            <small>
              {count} {plural(count, 'цветок', 'цветка', 'цветов')}
            </small>
          </span>
          <a href="#bld-sum" className="btn btn--primary btn--sm">
            Итог
          </a>
        </div>
      )}
    </div>
  )
}
