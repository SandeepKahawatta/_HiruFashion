import Link from 'next/link'
import { dbConnect } from '@/lib/db'
import Order from '@/lib/models/Order'
import type { OrderDoc } from '@/lib/models/Order'
import { toOrderDTO } from '@/lib/serializers'
import { formatCurrency } from '@/lib/utils'

export default async function AdminOrdersPage() {
  await dbConnect().catch(() => null)
  const docs = await Order.find().sort({ createdAt: -1 }).lean<OrderDoc[]>().catch(() => [])
  const orders = Array.isArray(docs) ? docs.map(doc => toOrderDTO(doc)) : []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">Orders</h2>
        <p className="text-sm text-slate-600">Manage customer orders and fulfillment.</p>
      </div>
      <div className="flex flex-col gap-4">
        {orders.map(order => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="flex flex-col gap-2 rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold">{order.shippingAddress.fullName || 'Unknown'}</h3>
              <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex flex-col gap-1 text-sm sm:text-right">
              <span className="font-semibold text-brand-accent">{formatCurrency(order.total)}</span>
              <span className="text-xs uppercase tracking-wide text-slate-500">{order.status}</span>
            </div>
          </Link>
        ))}
        {orders.length === 0 && <p className="text-sm text-slate-500">No orders yet.</p>}
      </div>
    </div>
  )
}
