/** Текст о разделе внизу страницы: для покупателей и поисковиков. Пустая строка — новый абзац. */
export function SeoText({ title, text }: { title: string; text?: string | null }) {
  const paras = (text || '')
    .split(/\n\s*\n/)
    .map((x) => x.trim())
    .filter(Boolean)
  if (!paras.length) return null
  return (
    <section className="seo-t">
      <h2>{title}</h2>
      <div>
        {paras.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  )
}
