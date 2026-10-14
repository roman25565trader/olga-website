import type { Media } from '@/payload-types'

export type MediaLike = number | Media | null | undefined

export const asMedia = (m: MediaLike): Media | null => (m && typeof m === 'object' ? m : null)

export const isVideo = (m: MediaLike) => Boolean(asMedia(m)?.mimeType?.startsWith('video/'))

/** srcset из нарезанных размеров (webp) */
export function imgAttrs(m: MediaLike) {
  const media = asMedia(m)
  if (!media?.url) return null
  const s = media.sizes || {}
  const set = (['sm', 'md', 'lg'] as const)
    .map((k) => s[k])
    .filter((x): x is NonNullable<typeof x> => Boolean(x?.url && x.width))
    .map((x) => `${x.url} ${x.width}w`)
  if (media.width && !s.lg?.url) set.push(`${media.url} ${media.width}w`)
  return {
    src: s.md?.url || media.url,
    srcSet: set.length ? set.join(', ') : undefined,
    alt: media.alt || '',
    width: media.width || undefined,
    height: media.height || undefined,
  }
}

export const thumbUrl = (m: MediaLike) => {
  const media = asMedia(m)
  return media?.sizes?.xs?.url || media?.sizes?.sm?.url || media?.url || ''
}
