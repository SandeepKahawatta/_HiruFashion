'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartDetails } from '@/lib/cart/hooks'
import Input from '@/components/form/Input'
import Textarea from '@/components/form/Textarea'
import { formatCurrency } from '@/lib/utils'

export default function CheckoutPage() {
  const router = useRouter()
  const { enriched, subtotalCents, clear } = useCartDetails()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (enriched.length === 0) return
    const data = new FormData(event.currentTarget)
    const payload = {
      shippingAddress: {
        fullName: data.get('fullName') as string,
        line1: data.get('line1') as string,
        line2: data.get('line2') as string,
        city: data.get('city') as string,
        state: data.get('state') as string,
        postalCode: data.get('postalCode') as string,
        country: data.get('country') as string,
        phone: data.get('phone') as string
      },
      billingAddress: {
        fullName: data.get('billingFullName') as string,
        line1: data.get('billingLine1') as string,
        line2: data.get('billingLine2') as string,
        city: data.get('billingCity') as string,
        state: data.get('billingState') as string,
        postalCode: data.get('billingPostalCode') as string,
        country: data.get('billingCountry') as string,
        phone: data.get('billingPhone') as string
      },
      note,
      items: enriched.map(item => ({
        product: item.id,
        name: item.product.name,
        price: item.product.price,
        qty: item.qty,
        size: item.size,
        color: item.color,
        image: item.product.images?.[0]
      })),
      total: subtotalCents
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const message = await res.json().catch(() => ({ error: 'Failed to place order' }))
        throw new Error(message.error || 'Failed to place order')
      }
      const order = await res.json()
      clear()
      router.push(`/success?id=${order.id}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (enriched.length === 0) {
    return <p className="text-sm text-slate-500">Add items to your cart before checking out.</p>
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Shipping details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input name="fullName" label="Full name" required />
            <Input name="phone" label="Phone" required />
            <Input name="line1" label="Address line 1" required className="sm:col-span-2" />
            <Input name="line2" label="Address line 2" className="sm:col-span-2" />
            <Input name="city" label="City" required />
            <Input name="state" label="Province" />
            <Input name="postalCode" label="Postal code" />
            <Input name="country" label="Country" defaultValue="Sri Lanka" required className="sm:col-span-2" />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Billing details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input name="billingFullName" label="Full name" required />
            <Input name="billingPhone" label="Phone" required />
            <Input name="billingLine1" label="Address line 1" required className="sm:col-span-2" />
            <Input name="billingLine2" label="Address line 2" className="sm:col-span-2" />
            <Input name="billingCity" label="City" required />
            <Input name="billingState" label="Province" />
            <Input name="billingPostalCode" label="Postal code" />
            <Input name="billingCountry" label="Country" defaultValue="Sri Lanka" required className="sm:col-span-2" />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Order note</h2>
          <Textarea label="Message for the stylist" value={note} onChange={event => setNote(event.target.value)} placeholder="Let us know about gift wrapping, delivery instructions, or styling preferences." />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className={`inline-flex items-center justify-center rounded-full bg-brand-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-accent/20 ${loading ? 'opacity-70' : 'hover:bg-brand-accent/90'}`}
        >
          {loading ? 'Processing...' : `Place order — ${formatCurrency(subtotalCents)}`}
        </button>
      </form>

      <aside className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <ul className="flex flex-col gap-3 text-sm">
          {enriched.map(item => (
            <li key={`${item.id}-${item.size}-${item.color}`} className="flex items-center justify-between">
              <span>
                {item.product.name}{' '}
                <span className="text-xs uppercase text-slate-500">
                  × {item.qty}
                </span>
              </span>
              <span className="font-medium">{formatCurrency(item.qty * item.product.price)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
          <span>Total</span>
          <span className="text-lg font-semibold text-brand-accent">{formatCurrency(subtotalCents)}</span>
        </div>
        <p className="text-xs text-slate-500">We’ll email you a confirmation and send SMS updates once your order ships.</p>
      </aside>
    </div>
  )
}
