import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getUserFromCookies } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import Order from '@/lib/models/Order'
import type { OrderDoc } from '@/lib/models/Order'
import { toOrderDTO } from '@/lib/serializers'
import type { OrderDTO } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const user = await getUserFromCookies()
  if (!user) {
    redirect('/login')
  }
  await dbConnect().catch(() => null)
  const doc = await Order.findById(params.id).lean<OrderDoc>().catch(() => null)
  if (!doc || String(doc.user) !== user.id) {
    return notFound()
  }
  const order: OrderDTO = toOrderDTO(doc)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.3em] text-brand-accent">Order</span>
        <h1 className="text-3xl font-semibold">{order.id}</h1>
        <p className="text-xs uppercase tracking-wider text-brand-accent">{order.status}</p>
        <p className="text-xs text-slate-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
      </div>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Items</h2>
          <ul className="mt-4 flex flex-col gap-4 text-sm">
            {order.items.map(item => (
              <li key={`${item.product}-${item.size ?? 'any'}-${item.color ?? 'any'}`} className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-xs uppercase text-slate-500">
                    Qty {item.qty}{item.size ? ` · Size ${item.size}` : ''}{item.color ? ` · Color ${item.color}` : ''}
                  </span>
                </div>
                <span>{formatCurrency(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
            <span>Total</span>
            <span className="text-lg font-semibold text-brand-accent">{formatCurrency(order.total)}</span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Shipping address</h2>
            <p className="mt-2 text-sm text-slate-600">
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 && <><br />{order.shippingAddress.line2}</>}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
              <br />
              {order.shippingAddress.phone}
            </p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Billing address</h2>
            {order.billingAddress ? (
              <p className="mt-2 text-sm text-slate-600">
                {order.billingAddress.fullName}
                <br />
                {order.billingAddress.line1}
                {order.billingAddress.line2 && <><br />{order.billingAddress.line2}</>}
                <br />
                {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
                <br />
                {order.billingAddress.country}
                <br />
                {order.billingAddress.phone}
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No billing address provided.</p>
            )}
          </div>
          {order.note && (
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Note</h2>
              <p className="mt-2 text-sm text-slate-600">{order.note}</p>
            </div>
          )}
        </div>
      </section>
      <Link href="/orders" className="text-sm font-semibold text-brand-accent">
        ← Back to orders
      </Link>
    </div>
  )
}
