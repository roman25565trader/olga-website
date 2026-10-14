import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getClient, getPage } from '@/lib/data'

type P = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const res = await (await getClient()).find({ collection: 'pages', limit: 100, depth: 0, select: { slug: true } })
  return res.docs.filter((d) => d.slug).map((d) => ({ slug: d.slug! }))
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = await getPage((await params).slug)
  return { title: p?.title }
}

export default async function InfoPage({ params }: P) {
  const p = await getPage((await params).slug)
  if (!p) notFound()
  return (
    <div className="wrap sec-b">
      <nav aria-label="Навигационная цепочка">
        <ol className="crumbs">
          <li>
            <Link href="/">Главная</Link>
          </li>
          <li>{p.title}</li>
        </ol>
      </nav>
      <h1 className="h1 h1--task" style={{ marginBottom: 32 }}>
        {p.title}
      </h1>
      {p.content ? (
        <div className="prose">
          <RichText data={p.content} />
        </div>
      ) : null}
    </div>
  )
}
