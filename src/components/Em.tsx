import { splitEm } from '@/lib/format'

/** Текст, где *слово* выделено курсивом */
export function Em({ text }: { text?: string | null }) {
  return (
    <>
      {splitEm(text).map((p, i) => (p.em ? <em key={i}>{p.t}</em> : <span key={i}>{p.t}</span>))}
    </>
  )
}
