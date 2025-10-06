import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'

export type ProductCardProps = {
  product: {
    id: string
    slug: string
    name: string
    price: number
    images: string[]
    category: string
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const image = product.images?.[0] || '/placeholder.svg'
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-brand-soft">
        <Image src={image} alt={product.name} fill className="object-cover transition-transform group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs uppercase tracking-wide text-slate-500">{product.category}</span>
        <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
        <p className="mt-auto text-sm font-medium text-brand-accent">{formatCurrency(product.price)}</p>
      </div>
    </Link>
  )
}
