import { NextRequest, NextResponse } from 'next/server'
import { isValidObjectId } from 'mongoose'
import { dbConnect } from '@/lib/db'
import Product from '@/lib/models/Product'
import { requireUser } from '@/lib/auth'
import { slugify } from '@/lib/utils'
import { toProductDTO } from '@/lib/serializers'

type ProductUpdatePayload = {
  name?: string
  slug?: string
  description?: string
  price?: number
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

function buildQuery(idOrSlug: string) {
  return isValidObjectId(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: idOrSlug.toLowerCase() }
}

export async function GET(_request: Request, { params }: { params: { idOrSlug: string } }) {
  await dbConnect().catch(() => null)
  const query = buildQuery(params.idOrSlug)
  const product = await Product.findOne(query).lean().catch(() => null)
  if (!product) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(toProductDTO(product))
}

export async function PUT(request: NextRequest, { params }: { params: { idOrSlug: string } }) {
  const user = await requireUser(request, { admin: true })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await request.json().catch(() => null)) as unknown
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const payload = body as ProductUpdatePayload
  const update: Record<string, unknown> = {}

  if (typeof payload.name === 'string') {
    update.name = payload.name
    if (!payload.slug) {
      update.slug = slugify(payload.name)
    }
  }
  if (typeof payload.slug === 'string' && payload.slug.trim()) {
    update.slug = slugify(payload.slug)
  }
  if (typeof payload.description === 'string') {
    update.description = payload.description
  }
  if (typeof payload.price === 'number') {
    update.price = payload.price
  }
  if (payload.images !== undefined) {
    update.images = ensureStringArray(payload.images)
  }
  if (payload.category !== undefined) {
    if (typeof payload.category === 'string' && payload.category.trim()) {
      update.category = payload.category.toLowerCase()
    }
  }
  if (payload.sizes !== undefined) {
    update.sizes = ensureStringArray(payload.sizes)
  }
  if (payload.colors !== undefined) {
    update.colors = ensureStringArray(payload.colors)
  }
  if (typeof payload.inventory === 'number') {
    update.inventory = payload.inventory
  }
  if (payload.featured !== undefined) {
    update.featured = Boolean(payload.featured)
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No changes' }, { status: 400 })
  }
  await dbConnect()
  const product = await Product.findOneAndUpdate(buildQuery(params.idOrSlug), update, {
    new: true,
    runValidators: true
  })
    .lean()
    .catch(() => null)
  if (!product) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(toProductDTO(product))
}

export async function DELETE(request: NextRequest, { params }: { params: { idOrSlug: string } }) {
  const user = await requireUser(request, { admin: true })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await dbConnect()
  const result = await Product.findOneAndDelete(buildQuery(params.idOrSlug)).lean().catch(() => null)
  if (!result) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
