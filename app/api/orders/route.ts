import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import Order from '@/lib/models/Order'
import type { OrderDoc, OrderItem } from '@/lib/models/Order'
import Product from '@/lib/models/Product'
import { requireUser } from '@/lib/auth'
import { toOrderDTO } from '@/lib/serializers'
import type { AddressDTO, OrderDTO } from '@/lib/types'

type CreateOrderItemPayload = {
  product: string
  qty: number
  size?: string
  color?: string
}

type CreateOrderPayload = {
  items: CreateOrderItemPayload[]
  shippingAddress: AddressDTO
  billingAddress?: AddressDTO
  note?: string
}

function isValidAddress(value: unknown): value is AddressDTO {
  if (!value || typeof value !== 'object') return false
  const address = value as Partial<AddressDTO>
  return (
    typeof address.fullName === 'string' &&
    typeof address.line1 === 'string' &&
    typeof address.city === 'string' &&
    typeof address.country === 'string'
  )
}

function isValidItem(value: unknown): value is CreateOrderItemPayload {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<CreateOrderItemPayload>
  return typeof item.product === 'string' && typeof item.qty === 'number' && item.qty > 0
}

export async function GET(request: NextRequest) {
  const user = await requireUser(request, { admin: true })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await dbConnect().catch(() => null)
  const docs = await Order.find().sort({ createdAt: -1 }).lean<OrderDoc[]>().catch(() => [])
  const orders: OrderDTO[] = Array.isArray(docs) ? docs.map(doc => toOrderDTO(doc)) : []
  return NextResponse.json(orders)
}

export async function POST(request: NextRequest) {
  const user = await requireUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await request.json().catch(() => null)) as unknown
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const payload = body as Partial<CreateOrderPayload>
  if (!Array.isArray(payload.items) || payload.items.length === 0 || !payload.items.every(isValidItem)) {
    return NextResponse.json({ error: 'No items provided' }, { status: 400 })
  }
  if (!isValidAddress(payload.shippingAddress)) {
    return NextResponse.json({ error: 'Shipping address required' }, { status: 400 })
  }
  await dbConnect()
  const products = await Product.find({ _id: { $in: payload.items.map(item => item.product) } }).lean()
  const productMap = new Map(products.map(product => [String(product._id), product]))
  let total = 0
  const orderItems: OrderItem[] = []
  for (const item of payload.items) {
    const product = productMap.get(String(item.product))
    if (!product) {
      return NextResponse.json({ error: `Product not found: ${item.product}` }, { status: 400 })
    }
    const qty = item.qty
    const price = product.price
    total += price * qty
    orderItems.push({
      product: product._id,
      name: product.name,
      price,
      qty,
      size: item.size,
      color: item.color,
      image: product.images?.[0]
    })
  }

  const order = await Order.create({
    user: user.id,
    items: orderItems,
    total,
    status: 'pending',
    note: payload.note,
    shippingAddress: payload.shippingAddress,
    billingAddress: payload.billingAddress && isValidAddress(payload.billingAddress)
      ? payload.billingAddress
      : payload.shippingAddress
  })

  return NextResponse.json(toOrderDTO(order.toObject()))
}
