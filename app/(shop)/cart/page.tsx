'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCartDetails } from '@/lib/cart/hooks'
import { formatCurrency } from '@/lib/utils'

export default function CartPage() {
  const { enriched, subtotalCents, removeItem, updateItem } = useCartDetails()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Your Cart</h1>
        <p className="text-sm text-slate-600">Review items before completing your order.</p>
      </div>
      <div className="flex flex-col gap-6">
        {enriched.map(item => (
          <div key={`${item.id}-${item.size}-${item.color}`} className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
            <div className="relative h-32 w-full overflow-hidden rounded-2xl bg-brand-soft sm:h-28 sm:w-28">
              <Image src={item.product.images?.[0] || '/placeholder.svg'} alt={item.product.name} fill className="object-cover" />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <h3 className="text-lg font-semibold">{item.product.name}</h3>
              <p className="text-sm text-slate-500">{item.product.category}</p>
              <div className="flex flex-wrap gap-3 text-xs uppercase text-slate-500">
                {item.size && <span>Size: {item.size}</span>}
                {item.color && <span>Color: {item.color}</span>}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <select
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={item.qty}
                onChange={event => updateItem(item.id, { qty: Number(event.target.value), size: item.size, color: item.color })}
              >
                {Array.from({ length: 10 }, (_, idx) => idx + 1).map(value => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <span className="text-sm font-semibold text-brand-accent">{formatCurrency(item.qty * item.product.price)}</span>
              <button
                className="text-xs font-medium uppercase text-slate-500"
                onClick={() => removeItem(item.id, { size: item.size, color: item.color })}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        {enriched.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-500">
            Your cart is empty. Explore the <Link href="/products" className="text-brand-accent">collection</Link> to discover new pieces.
          </div>
        )}
      </div>
      <div className="ml-auto w-full max-w-sm rounded-3xl bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between text-sm">
          <span>Subtotal</span>
          <span className="font-semibold text-brand-accent">{formatCurrency(subtotalCents)}</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">Taxes and shipping calculated at checkout.</p>
        <Link
          href="/checkout"
          className={`mt-6 inline-flex w-full justify-center rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-accent/20 ${enriched.length === 0 ? 'cursor-not-allowed bg-slate-300 text-slate-500' : 'bg-brand-accent hover:bg-brand-accent/90'}`}
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  )
}
