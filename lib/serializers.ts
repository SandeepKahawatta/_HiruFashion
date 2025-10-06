import { Types } from 'mongoose'
import type { AddressDTO, OrderDTO, OrderItemDTO, ProductDTO } from './types'

function normaliseId(value: Types.ObjectId | string | undefined): string {
  if (!value) return ''
  return typeof value === 'string' ? value : value.toString()
}

function normaliseDate(value: Date | string | undefined): string {
  if (!value) return new Date().toISOString()
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

type ProductSource = {
  _id?: Types.ObjectId | string
  id?: string
  name: string
  slug: string
  description?: string
  price: number
  images?: string[]
  category: string
  sizes?: string[]
  colors?: string[]
  inventory?: number
  featured?: boolean
  createdAt?: Date | string
  updatedAt?: Date | string
}

type OrderItemSource = {
  product: Types.ObjectId | string
  name: string
  price: number
  qty: number
  size?: string
  color?: string
  image?: string
}

type OrderSource = {
  _id?: Types.ObjectId | string
  id?: string
  user: Types.ObjectId | string
  items?: OrderItemSource[]
  total: number
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled'
  note?: string
  shippingAddress?: AddressDTO
  billingAddress?: AddressDTO
  createdAt?: Date | string
  updatedAt?: Date | string
}

function normaliseAddress(address?: AddressDTO): AddressDTO {
  if (!address) {
    return {
      fullName: '',
      line1: '',
      city: '',
      country: ''
    }
  }
  return address
}

export function toProductDTO(doc: ProductSource): ProductDTO {
  const id = doc.id ?? doc._id
  return {
    id: normaliseId(id),
    name: doc.name,
    slug: doc.slug,
    description: doc.description ?? '',
    price: Number.isFinite(doc.price) ? Number(doc.price) : 0,
    images: Array.isArray(doc.images) ? doc.images : [],
    category: doc.category,
    sizes: Array.isArray(doc.sizes) ? doc.sizes : [],
    colors: Array.isArray(doc.colors) ? doc.colors : [],
    inventory: Number.isFinite(doc.inventory) ? Number(doc.inventory) : 0,
    featured: Boolean(doc.featured),
    createdAt: doc.createdAt ? normaliseDate(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? normaliseDate(doc.updatedAt) : undefined
  }
}

export function toOrderDTO(doc: OrderSource): OrderDTO {
  const id = doc.id ?? doc._id
  const items: OrderItemDTO[] = Array.isArray(doc.items)
    ? doc.items.map(item => ({
        product: normaliseId(item.product),
        name: item.name,
        price: Number.isFinite(item.price) ? Number(item.price) : 0,
        qty: Number.isFinite(item.qty) ? Number(item.qty) : 0,
        size: item.size ?? undefined,
        color: item.color ?? undefined,
        image: item.image ?? undefined
      }))
    : []

  const shipping = normaliseAddress(doc.shippingAddress)
  const billing = doc.billingAddress ? normaliseAddress(doc.billingAddress) : undefined

  return {
    id: normaliseId(id),
    user: normaliseId(doc.user),
    items,
    total: Number.isFinite(doc.total) ? Number(doc.total) : 0,
    status: doc.status,
    note: doc.note ?? undefined,
    shippingAddress: shipping,
    billingAddress: billing,
    createdAt: normaliseDate(doc.createdAt),
    updatedAt: normaliseDate(doc.updatedAt ?? doc.createdAt)
  }
}
