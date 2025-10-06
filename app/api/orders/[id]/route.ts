import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import Order from '@/lib/models/Order'
import type { OrderDoc } from '@/lib/models/Order'
import { requireUser } from '@/lib/auth'
import { toOrderDTO } from '@/lib/serializers'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await dbConnect().catch(() => null)
  const order = await Order.findById(params.id).lean<OrderDoc>().catch(() => null)
  if (!order) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (user.role !== 'admin' && String(order.user) !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return NextResponse.json(toOrderDTO(order))
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireUser(request, { admin: true })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const allowedStatuses = ['pending', 'paid', 'fulfilled', 'cancelled']
  if (body.status && !allowedStatuses.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }
  await dbConnect()
  const update: Record<string, unknown> = {}
  if (body.status) update.status = body.status
  if (Object.prototype.hasOwnProperty.call(body, 'note')) update.note = body.note
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No changes' }, { status: 400 })
  }
  const order = await Order.findByIdAndUpdate(
    params.id,
    update,
    { new: true }
  )
    .lean<OrderDoc>()
    .catch(() => null)
  if (!order) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(toOrderDTO(order))
}
