import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import Product from '@/lib/models/Product'
import { requireUser } from '@/lib/auth'
import { slugify } from '@/lib/utils'
import { toProductDTO } from '@/lib/serializers'

type ProductPayload = {
  name: string
  slug?: string
  description?: string
  price: number
  images?: unknown
  category?: string
  sizes?: unknown
  colors?: unknown
  inventory?: number
  featured?: boolean
}

function ensureStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

export async function GET() {
  await dbConnect().catch(() => null)
  const docs = await Product.find().sort({ createdAt: -1 }).lean().catch(() => [])
  const products = Array.isArray(docs) ? docs.map(doc => toProductDTO(doc)) : []
  return NextResponse.json(products)
}

export async function POST(request: NextRequest) {
  const user = await requireUser(request, { admin: true })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await request.json().catch(() => null)) as unknown
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const payload = body as Partial<ProductPayload>
  if (typeof payload.name !== 'string' || typeof payload.price !== 'number') {
    return NextResponse.json({ error: 'Missing name or price' }, { status: 400 })
  }
  await dbConnect()
  const product = await Product.create({
    name: payload.name,
    description: typeof payload.description === 'string' ? payload.description : '',
    price: payload.price,
    images: ensureStringArray(payload.images),
    category: payload.category?.toLowerCase() || 'general',
    sizes: ensureStringArray(payload.sizes),
    colors: ensureStringArray(payload.colors),
    inventory: typeof payload.inventory === 'number' ? payload.inventory : 0,
    featured: Boolean(payload.featured),
    slug: slugify(payload.slug && typeof payload.slug === 'string' ? payload.slug : payload.name)
  })
  return NextResponse.json(toProductDTO(product.toObject()))
}
