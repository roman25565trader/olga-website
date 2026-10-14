import type { MediaLike } from '@/lib/media'
import { imgAttrs } from '@/lib/media'

type Props = {
  media: MediaLike
  sizes: string
  className?: string
  alt?: string
  priority?: boolean
}

/** Картинка из админки: webp, srcset, ленивая загрузка (кроме первого экрана). */
export function Img({ media, sizes, className, alt, priority }: Props) {
  const a = imgAttrs(media)
  if (!a) return null
  return (
    <img
      src={a.src}
      srcSet={a.srcSet}
      sizes={sizes}
      alt={alt ?? a.alt}
      width={a.width}
      height={a.height}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
    />
  )
}
