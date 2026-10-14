'use client'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '../Icon'

type Props = { src: string; poster?: React.ReactNode; label?: string }

/**
 * Видео-обращение. Чтобы не тормозить загрузку страницы, видео подгружается
 * после загрузки страницы и играет без звука; звук — по кнопке.
 */
export function HeroVideo({ src, poster, label = 'Смотреть со звуком' }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const start = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      v.src = src
      v.play().catch(() => {})
    }
    if (document.readyState === 'complete') {
      const t = setTimeout(start, 600)
      return () => clearTimeout(t)
    }
    const onLoad = () => setTimeout(start, 600)
    window.addEventListener('load', onLoad, { once: true })
    return () => window.removeEventListener('load', onLoad)
  }, [src])

  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (!v.src) v.src = src
    if (muted) {
      v.currentTime = 0
      v.muted = false
      v.loop = false
      v.play().catch(() => {})
      setMuted(false)
    } else {
      v.muted = true
      v.loop = true
      setMuted(true)
    }
  }

  return (
    <>
      {!ready && poster}
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        onPlaying={() => setReady(true)}
        onEnded={() => {
          const v = ref.current
          if (!v) return
          v.muted = true
          v.loop = true
          setMuted(true)
          v.play().catch(() => {})
        }}
        aria-label="Видео-обращение флориста"
      />
      <button type="button" className="hero-play" onClick={toggle}>
        <i>
          <Icon name={muted ? 'play' : 'mute'} />
        </i>
        {muted ? label : 'Выключить звук'}
      </button>
    </>
  )
}
