/** Разметка schema.org для поисковиков и ИИ-помощников. «<» экранируем, чтобы текст из админки не закрыл тег. */
export function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
