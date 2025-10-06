'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import type { OrderDTO } from '@/lib/types'

const STATUS_OPTIONS = ['pending', 'paid', 'fulfilled', 'cancelled']

export default function OrderEditor({ order }: { order: OrderDTO }) {
  const router = useRouter()
  const [status, setStatus] = useState(order.status)
  const [note, setNote] = useState(order.note ?? '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSave() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note })
      })
      if (!res.ok) throw new Error('Failed to update order')
      setMessage('Order updated')
      router.refresh()
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Failed to update order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-[0.3em] text-brand-accent">Order</span>
        <h1 className="text-3xl font-semibold">{order.id}</h1>
        <p className="text-xs text-slate-500">Placed {new Date(order.createdAt).toLocaleString()}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Items</h2>
          <ul className="mt-4 flex flex-col gap-4 text-sm">
            {order.items.map(item => (
              <li key={`${item.product}-${item.size ?? 'any'}-${item.color ?? 'any'}`} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs uppercase text-slate-500">
                    Qty {item.qty}{item.size ? ` · Size ${item.size}` : ''}{item.color ? ` · Color ${item.color}` : ''}
                  </p>
                </div>
                <span>{formatCurrency(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
            <span>Total</span>
            <span className="text-lg font-semibold text-brand-accent">{formatCurrency(order.total)}</span>
          </div>
        </section>
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Order controls</h2>
          <div className="mt-4 flex flex-col gap-4">
            <label className="text-sm font-medium text-slate-600">
              Status
              <select
                value={status}
                onChange={event => setStatus(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2"
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option} value={option}>
                    {option.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-600">
              Internal note
              <textarea
                value={note}
                onChange={event => setNote(event.target.value)}
                className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-200 px-4 py-3"
              />
            </label>
            <button
              onClick={handleSave}
              disabled={loading}
              className={`inline-flex justify-center rounded-full bg-brand-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-accent/20 ${loading ? 'opacity-70' : 'hover:bg-brand-accent/90'}`}
            >
              {loading ? 'Saving…' : 'Save changes'}
            </button>
            {message && <p className="text-sm text-slate-500">{message}</p>}
          </div>
        </section>
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Shipping</h2>
          <p className="mt-2 text-sm text-slate-600">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 && (
              <>
                <br />
                {order.shippingAddress.line2}
              </>
            )}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state ?? ''} {order.shippingAddress.postalCode ?? ''}
            <br />
            {order.shippingAddress.country}
            <br />
            {order.shippingAddress.phone ?? ''}
          </p>
        </section>
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Billing</h2>
          {order.billingAddress ? (
            <p className="mt-2 text-sm text-slate-600">
              {order.billingAddress.fullName}
              <br />
              {order.billingAddress.line1}
              {order.billingAddress.line2 && (
                <>
                  <br />
                  {order.billingAddress.line2}
                </>
              )}
              <br />
              {order.billingAddress.city}, {order.billingAddress.state ?? ''} {order.billingAddress.postalCode ?? ''}
              <br />
              {order.billingAddress.country}
              <br />
              {order.billingAddress.phone ?? ''}
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No billing address provided.</p>
          )}
        </section>
      </div>
    </div>
  )
}
