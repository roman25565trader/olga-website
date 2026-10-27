'use client'
import { useAllFormFields, useConfig, useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useMemo, useState } from 'react'

type AnyField = {
  type?: string
  name?: string
  label?: unknown
  fields?: AnyField[]
  tabs?: { name?: string; label?: unknown; fields: AnyField[] }[]
  options?: ({ label?: unknown; value: string } | string)[]
  relationTo?: string | string[]
  hasMany?: boolean
}
type Meta = { label: string; type?: string; options?: AnyField['options']; relationTo?: string }

const SKIP = new Set(['id', 'createdAt', 'updatedAt', 'changesPanel', 'reply', 'number', 'globalType'])

const text = (l: unknown, fallback: string) => {
  if (typeof l === 'string') return l
  if (l && typeof l === 'object') return (l as Record<string, string>).ru || Object.values(l as Record<string, string>)[0] || fallback
  return fallback
}

/** Карта «путь без номеров строк» → подпись и тип поля */
function buildMeta(fields: AnyField[], prefix: string, labelPrefix: string, out: Map<string, Meta>) {
  for (const f of fields) {
    if (f.type === 'row' || f.type === 'collapsible') {
      buildMeta(f.fields || [], prefix, labelPrefix, out)
    } else if (f.type === 'tabs') {
      for (const t of f.tabs || []) {
        const p = t.name ? `${prefix}${t.name}.` : prefix
        buildMeta(t.fields, p, labelPrefix, out)
      }
    } else if (f.name) {
      const label = `${labelPrefix}${text(f.label, f.name)}`
      const path = `${prefix}${f.name}`
      out.set(path, {
        label,
        type: f.type,
        options: f.options,
        relationTo: typeof f.relationTo === 'string' ? f.relationTo : undefined,
      })
      if (f.type === 'group') buildMeta(f.fields || [], `${path}.`, `${label} › `, out)
      if (f.type === 'array') buildMeta(f.fields || [], `${path}.`, `${label} › `, out)
    }
  }
}

const idsOf = (v: unknown): (number | string)[] =>
  (Array.isArray(v) ? v : v == null || v === '' ? [] : [v])
    .map((x) => (x && typeof x === 'object' ? ((x as { value?: unknown; id?: unknown }).value ?? (x as { id?: unknown }).id) : x))
    .filter((x): x is number | string => x != null && x !== '')

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

type Change = { path: string; meta: Meta; row?: number; before: unknown; after: unknown }

/**
 * «Что вы поменяли»: показывает каждое изменённое поле — было → станет,
 * а для фото — картинки до и после. Видно, пока изменения не сохранены.
 */
export function ChangesPanel() {
  const [fields] = useAllFormFields()
  const { config, getEntityConfig } = useConfig()
  const { collectionSlug, globalSlug } = useDocumentInfo()
  const [lookup, setLookup] = useState<Record<string, { title?: string; thumb?: string }>>({})

  const meta = useMemo(() => {
    const entity = collectionSlug
      ? getEntityConfig({ collectionSlug })
      : globalSlug
        ? getEntityConfig({ globalSlug })
        : null
    const map = new Map<string, Meta>()
    if (entity) buildMeta((entity as unknown as { fields: AnyField[] }).fields, '', '', map)
    return map
  }, [collectionSlug, globalSlug, getEntityConfig])

  const changes = useMemo(() => {
    const list: Change[] = []
    for (const [path, state] of Object.entries(fields || {})) {
      const top = path.split('.')[0]
      if (SKIP.has(top)) continue
      const schemaPath = path.replace(/\.\d+(?=\.|$)/g, '')
      const m = meta.get(schemaPath)
      if (!m || m.type === 'ui') continue
      const s = state as { value?: unknown; initialValue?: unknown }
      if (m.type === 'array') {
        if (Number(s.value ?? 0) !== Number(s.initialValue ?? 0))
          list.push({ path, meta: m, before: `строк: ${s.initialValue ?? 0}`, after: `строк: ${s.value ?? 0}` })
        continue
      }
      if (m.type === 'group' || m.type === 'tabs') continue
      if (same(s.value, s.initialValue)) continue
      const rowMatch = path.match(/\.(\d+)\./)
      list.push({ path, meta: m, row: rowMatch ? Number(rowMatch[1]) + 1 : undefined, before: s.initialValue, after: s.value })
    }
    return list
  }, [fields, meta])

  // Подтягиваем картинки и названия для фото и связей (разделы и т.п.)
  const needed = useMemo(() => {
    const want: { rel: string; id: number | string }[] = []
    for (const c of changes) {
      if (c.meta.type !== 'upload' && c.meta.type !== 'relationship') continue
      const rel = c.meta.relationTo || 'media'
      for (const id of [...idsOf(c.before), ...idsOf(c.after)]) if (!lookup[`${rel}:${id}`]) want.push({ rel, id })
    }
    return want
  }, [changes, lookup])

  useEffect(() => {
    if (!needed.length) return
    const api = `${config.serverURL || ''}${config.routes?.api || '/api'}`
    const byRel = new Map<string, (number | string)[]>()
    for (const n of needed) byRel.set(n.rel, [...(byRel.get(n.rel) || []), n.id])
    let alive = true
    Promise.all(
      [...byRel].map(async ([rel, ids]) => {
        const q = ids.map((id, i) => `where[id][in][${i}]=${encodeURIComponent(String(id))}`).join('&')
        const r = await fetch(`${api}/${rel}?${q}&depth=0&limit=100`, { credentials: 'include' })
        const d = await r.json()
        return (d.docs || []).map((doc: Record<string, unknown>) => [
          `${rel}:${doc.id}`,
          {
            title: (doc.title || doc.name || doc.filename || doc.email || `№${doc.id}`) as string,
            thumb: ((doc.sizes as { xs?: { url?: string } } | undefined)?.xs?.url || (String(doc.mimeType || '').startsWith('image/') ? doc.url : undefined)) as string | undefined,
          },
        ])
      }),
    )
      .then((parts) => alive && setLookup((prev) => ({ ...prev, ...Object.fromEntries(parts.flat()) })))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [needed, config])

  if (!changes.length) return null

  const show = (c: Change, v: unknown) => {
    const t = c.meta.type
    if (t === 'upload' || t === 'relationship') {
      const ids = idsOf(v)
      if (!ids.length) return <span className="oc-ch-empty">пусто</span>
      const rel = c.meta.relationTo || 'media'
      return (
        <span className="oc-ch-pics">
          {ids.map((id) => {
            const it = lookup[`${rel}:${id}`]
            return it?.thumb ? (
              <img key={id} src={it.thumb} alt="" width={72} height={72} />
            ) : (
              <span key={id} className="oc-ch-chip">
                {it?.title || '…'}
              </span>
            )
          })}
        </span>
      )
    }
    if (t === 'checkbox') return <b>{v ? '✅ Да' : '— Нет'}</b>
    if (t === 'richText') return <span className="oc-ch-empty">текст</span>
    if (v == null || v === '') return <span className="oc-ch-empty">пусто</span>
    if (t === 'select') {
      const opt = (c.meta.options || []).find((o) => (typeof o === 'string' ? o : o.value) === v)
      return <b>{opt && typeof opt === 'object' ? text(opt.label, String(v)) : String(v)}</b>
    }
    if (t === 'date') return <b>{new Date(String(v)).toLocaleString('ru-RU')}</b>
    if (typeof v === 'object') return <b>изменено</b>
    return <b className="oc-ch-val">{String(v)}</b>
  }

  return (
    <div className="oc-ch">
      <div className="oc-ch-head">
        <span className="oc-ch-title">✏️ Вы поменяли — ещё не сохранено</span>
        <button type="button" className="oc-ch-undo" onClick={() => window.location.reload()}>
          ↩︎ Отменить всё
        </button>
      </div>
      <ul className="oc-ch-list">
        {changes.map((c) => (
          <li key={c.path}>
            <span className="oc-ch-label">
              {c.meta.label}
              {c.row ? ` (строка ${c.row})` : ''}
            </span>
            <span className="oc-ch-diff">
              <span className="oc-ch-was">
                <small>было</small>
                {show(c, c.before)}
              </span>
              <span className="oc-ch-arrow">→</span>
              <span className="oc-ch-now">
                <small>станет</small>
                {show(c, c.after)}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className="oc-ch-hint">
        Всё верно? Нажмите <b>«Сохранить»</b> вверху справа. Передумали — «Отменить всё».
      </p>
    </div>
  )
}
