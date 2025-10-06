import { notFound } from 'next/navigation'
import { dbConnect } from '@/lib/db'
import Order from '@/lib/models/Order'
import { toOrderDTO } from '@/lib/serializers'
import type { OrderDoc } from '@/lib/models/Order'
import OrderEditor from './OrderEditor'

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  await dbConnect().catch(() => null)
  const doc = await Order.findById(params.id).lean<OrderDoc>().catch(() => null)
  if (!doc) return notFound()
  const order = toOrderDTO(doc)
  return <OrderEditor order={order} />
}
