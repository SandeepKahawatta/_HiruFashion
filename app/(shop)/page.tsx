import WelcomeGate from '@/components/WelcomeGate'
import CategoryCard from '@/components/CategoryCard'
import ProductCard from '@/components/ProductCard'
import { dbConnect } from '@/lib/db'
import Product from '@/lib/models/Product'
import { toProductDTO } from '@/lib/serializers'
import type { ProductDTO } from '@/lib/types'
import { getUserFromCookies } from '@/lib/auth'

const CATEGORY_IMAGES: Record<string, string> = {
  women: 'https://res.cloudinary.com/demo/image/upload/v1693822597/fashion/women.jpg',
  men: 'https://res.cloudinary.com/demo/image/upload/v1693822597/fashion/men.jpg',
  kids: 'https://res.cloudinary.com/demo/image/upload/v1693822597/fashion/kids.jpg'
}

export default async function HomePage() {
  await dbConnect().catch(err => {
    console.error('DB connection error', err)
  })
  const [featuredDocs, categories, user] = await Promise.all([
    Product.find({ featured: true }).limit(6).lean().catch(() => []),
    Product.distinct('category').catch(() => []),
    getUserFromCookies()
  ])

  const featured: ProductDTO[] = Array.isArray(featuredDocs)
    ? featuredDocs.map(doc => toProductDTO(doc))
    : []

  const categoryCards = (Array.isArray(categories) ? categories : []).map((category: string) => ({
    name: category,
    href: `/category/${category}`,
    image: CATEGORY_IMAGES[category] || 'https://res.cloudinary.com/demo/image/upload/v1693822597/fashion/lookbook.jpg'
  }))

  return (
    <>
      <WelcomeGate show={Boolean(user)} />
      <section className="flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-white via-white to-brand-soft p-8 text-center shadow-sm sm:p-12">
        <span className="text-xs uppercase tracking-[0.3em] text-brand-accent">Sri Lanka · Colombo</span>
        <h1 className="text-3xl font-semibold sm:text-4xl">Discover mindful fashion crafted for tropical living.</h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-600 sm:text-base">
          HiruFashion curates sustainable Sri Lankan designers with global aesthetics. Shop elevated essentials, celebrate vibrant heritage, and enjoy carbon-neutral delivery islandwide.
        </p>
      </section>

      <section className="mt-12 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Shop by category</h2>
          <a href="/products" className="text-sm font-semibold text-brand-accent">
            View all
          </a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryCards.map(cat => (
            <CategoryCard key={cat.href} {...cat} name={cat.name.toUpperCase()} />
          ))}
          {categoryCards.length === 0 && (
            <p className="text-sm text-slate-500">No categories yet. Add products in the admin dashboard.</p>
          )}
        </div>
      </section>

      <section className="mt-12 flex flex-col gap-6">
        <h2 className="text-xl font-semibold">Featured drops</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
          {featured.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-500">
              Featured products will appear here once you flag them in the dashboard.
            </div>
          )}
        </div>
      </section>
    </>
  )
}
