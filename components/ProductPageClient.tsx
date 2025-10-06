'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { useCart } from '@/lib/cart/context'

export type ProductPageClientProps = {
  product: {
    id: string
    name: string
    price: number
    description: string
    images: string[]
    sizes?: string[]
    colors?: string[]
    inventory: number
  }
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  const { addItem } = useCart()
  const [activeImage, setActiveImage] = useState(product.images?.[0] || '/placeholder.svg')
  const [size, setSize] = useState(product.sizes?.[0] ?? '')
  const [color, setColor] = useState(product.colors?.[0] ?? '')
  const [qty, setQty] = useState(1)

  function handleAddToCart() {
    addItem({ id: product.id, qty, size: size || undefined, color: color || undefined })
  }

  const maxQty = product.inventory > 0 ? Math.min(product.inventory, 10) : 10

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-white shadow-sm">
          <Image src={activeImage} alt={product.name} fill className="object-cover" />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3">
        {(product.images?.length ? product.images : ['/placeholder.svg']).map(image => (
            <button
              key={image}
              onClick={() => setActiveImage(image)}
              className={`relative aspect-square overflow-hidden rounded-xl border ${activeImage === image ? 'border-brand-accent' : 'border-transparent'} bg-white`}
            >
              <Image src={image} alt={product.name} fill className="object-cover" />
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">{product.name}</h1>
          <p className="mt-2 text-lg font-medium text-brand-accent">{formatCurrency(product.price)}</p>
        </div>
        <p className="leading-relaxed text-slate-600">{product.description}</p>
        {product.sizes?.length ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold uppercase text-slate-500">Size</span>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(s => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${size === s ? 'border-brand-accent bg-brand-accent text-white' : 'border-slate-200 bg-white'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {product.colors?.length ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold uppercase text-slate-500">Color</span>
            <div className="flex flex-wrap gap-2">
              {product.colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${color === c ? 'border-brand-accent bg-brand-accent text-white' : 'border-slate-200 bg-white'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            <span className="text-sm font-semibold uppercase text-slate-500">Qty</span>
            <select
              value={qty}
              onChange={event => setQty(Number(event.target.value))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {Array.from({ length: maxQty }, (_, idx) => idx + 1).map(value => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={handleAddToCart}
            className="rounded-full bg-brand-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-accent/20"
          >
            Add to cart
          </button>
        </div>
        <p className="text-sm text-slate-500">Ships within 2-3 business days. Free returns within 30 days.</p>
      </div>
    </div>
  )
}
