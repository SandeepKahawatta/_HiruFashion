import { notFound } from 'next/navigation'
import ProductPageClient from '@/components/ProductPageClient'
import ProductCard from '@/components/ProductCard'
import { dbConnect } from '@/lib/db'
import Product from '@/lib/models/Product'
import { toProductDTO } from '@/lib/serializers'
import type { ProductDTO } from '@/lib/types'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  await dbConnect().catch(() => null)
  const doc = await Product.findOne({ slug: params.slug }).lean().catch(() => null)
  if (!doc) {
    return { title: 'Product not found — HiruFashion' }
  }
  return {
    title: `${doc.name} — HiruFashion`,
    description: doc.description
  }
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  await dbConnect().catch(() => null)
  const doc = await Product.findOne({ slug: params.slug }).lean().catch(() => null)
  if (!doc) notFound()
  const product = toProductDTO(doc)
  const relatedDocs = await Product.find({ category: doc.category, _id: { $ne: doc._id } })
    .limit(4)
    .lean()
    .catch(() => [])
  const related: ProductDTO[] = Array.isArray(relatedDocs) ? relatedDocs.map(item => toProductDTO(item)) : []

  return (
    <div className="flex flex-col gap-16">
      <ProductPageClient product={product} />
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold">You may also like</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {related.map(item => (
            <ProductCard key={item.id} product={item} />
          ))}
          {related.length === 0 && (
            <p className="text-sm text-slate-500">No related items yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
