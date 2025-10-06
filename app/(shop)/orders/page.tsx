import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserFromCookies } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import Order from '@/lib/models/Order'
import type { OrderDoc } from '@/lib/models/Order'
import { toOrderDTO } from '@/lib/serializers'
import type { OrderDTO } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

export default async function OrdersPage() {
  const user = await getUserFromCookies()
  if (!user) {
    redirect('/login')
  }
  await dbConnect().catch(() => null)
  const docs = await Order.find({ user: user.id }).sort({ createdAt: -1 }).lean<OrderDoc[]>().catch(() => [])
  const orders: OrderDTO[] = Array.isArray(docs) ? docs.map(doc => toOrderDTO(doc)) : []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">My Orders</h1>
        <p className="text-sm text-slate-600">Track your purchases and delivery status.</p>
      </div>
      <div className="flex flex-col gap-4">
        {orders.map(order => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="flex flex-col gap-2 rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-slate-500">Order</span>
              <span className="text-lg font-semibold">{order.id}</span>
              <span className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex flex-col gap-1 text-sm sm:text-right">
              <span className="font-semibold text-brand-accent">{formatCurrency(order.total)}</span>
              <span className="text-xs uppercase tracking-wide text-slate-500">{order.status}</span>
            </div>
          </Link>
        ))}
        {orders.length === 0 && <p className="text-sm text-slate-500">No orders yet. Start shopping to create your first order.</p>}
      </div>
    </div>
  )
}
