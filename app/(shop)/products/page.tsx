import ProductCard from '@/components/ProductCard'
import { dbConnect } from '@/lib/db'
import Product from '@/lib/models/Product'
import { toProductDTO } from '@/lib/serializers'
import type { ProductDTO } from '@/lib/types'

export default async function ProductsPage() {
  await dbConnect().catch(() => null)
  const docs = await Product.find().sort({ createdAt: -1 }).lean().catch(() => [])
  const products: ProductDTO[] = Array.isArray(docs) ? docs.map(doc => toProductDTO(doc)) : []

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">All Products</h1>
        <p className="text-sm text-slate-600">Browse the entire collection. Filter by category via the navigation.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
        {products.length === 0 && (
          <p className="text-sm text-slate-500">No products yet. Visit the admin dashboard to create your first item.</p>
        )}
      </div>
    </div>
  )
}
