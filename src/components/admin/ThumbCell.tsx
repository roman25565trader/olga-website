import type { Payload } from 'payload'
import type { Media } from '@/payload-types'

type Props = {
  cellData?: unknown
  payload: Payload
  linkURL?: string
}

const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id?: number }).id : (v as number | undefined))

/** Ячейка списка: миниатюры фото вместо номеров файлов */
export async function ThumbCell({ cellData, payload, linkURL }: Props) {
  const list = (Array.isArray(cellData) ? cellData : cellData ? [cellData] : []).map(idOf).filter(Boolean) as number[]
  if (!list.length) return <span className="oc-thumbs oc-thumbs--empty">нет фото</span>
  const res = await payload.find({
    collection: 'media',
    where: { id: { in: list.slice(0, 3) } },
    depth: 0,
    limit: 3,
    overrideAccess: true,
  })
  const byId = new Map(res.docs.map((m) => [m.id, m as Media]))
  const thumbs = list
    .slice(0, 3)
    .map((id) => byId.get(id))
    .filter((m): m is Media => Boolean(m))
  const inner = (
    <span className="oc-thumbs">
      {thumbs.map((m) => (
        <img key={m.id} src={m.sizes?.xs?.url || m.thumbnailURL || m.url || ''} alt={m.alt || ''} width={56} height={56} />
      ))}
      {list.length > 3 ? <span className="oc-thumbs-more">+{list.length - 3}</span> : null}
    </span>
  )
  return linkURL ? <a href={linkURL}>{inner}</a> : inner
}
