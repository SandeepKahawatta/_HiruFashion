import { notFound } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { dbConnect } from '@/lib/db'
import Product from '@/lib/models/Product'
import { toProductDTO } from '@/lib/serializers'
import type { ProductDTO } from '@/lib/types'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = params.slug
  return {
    title: `${category} — HiruFashion`,
    description: `Shop the latest ${category} looks curated by HiruFashion.`
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  await dbConnect().catch(() => null)
  const docs = await Product.find({ category: params.slug }).lean().catch(() => [])
  const products: ProductDTO[] = Array.isArray(docs) ? docs.map(doc => toProductDTO(doc)) : []
  if (products.length === 0) {
    return notFound()
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.3em] text-brand-accent">Category</span>
        <h1 className="text-3xl font-semibold">{params.slug.toUpperCase()}</h1>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
