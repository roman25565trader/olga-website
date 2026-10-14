import type { Metadata } from 'next'
import Link from 'next/link'
import { Checkout } from '@/components/client/Checkout'
import { getClient, getDelivery, getSettings } from '@/lib/data'

export const metadata: Metadata = { title: 'Корзина и оформление', robots: { index: false } }

export default async function CartPage() {
  const [d, s, payload] = await Promise.all([getDelivery(), getSettings(), getClient()])
  const policy = await payload.find({ collection: 'pages', where: { slug: { contains: 'politika' } }, limit: 1, depth: 0 })
  return (
    <div className="wrap sec-b">
      <nav aria-label="Навигационная цепочка">
        <ol className="crumbs">
          <li>
            <Link href="/">Главная</Link>
          </li>
          <li>Корзина</li>
        </ol>
      </nav>
      <h1 className="h1 h1--task" style={{ marginBottom: 32 }}>
        Оформление <em>заказа</em>
      </h1>
      <Checkout
        zones={(d.zones || []).map((z) => ({ name: z.name, price: z.price, priceNote: z.priceNote, description: z.description }))}
        freeFrom={d.freeFrom}
        pickupEnabled={d.pickupEnabled !== false}
        pickupAddress={[s.address, s.hours].filter(Boolean).join(' · ')}
        intervals={(d.intervals || []).map((i) => i.label)}
        paymentText={d.payment}
        policyHref={policy.docs[0]?.slug ? `/info/${policy.docs[0].slug}` : undefined}
      />
    </div>
  )
}
