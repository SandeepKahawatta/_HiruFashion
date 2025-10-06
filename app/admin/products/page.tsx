'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { CldUploadWidget, CldUploadWidgetResults } from 'next-cloudinary'
import Input from '@/components/form/Input'
import Textarea from '@/components/form/Textarea'
import Select from '@/components/form/Select'
import { formatCurrency, slugify } from '@/lib/utils'
import type { ProductDTO } from '@/lib/types'

type Product = ProductDTO

const emptyProduct: Product = {
  id: '',
  name: '',
  slug: '',
  description: '',
  price: 0,
  images: [],
  category: 'general',
  sizes: [],
  colors: [],
  inventory: 0,
  featured: false,
  createdAt: undefined,
  updatedAt: undefined
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [editing, setEditing] = useState<Product>(emptyProduct)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/products', { credentials: 'include' })
      if (res.ok) {
        const data: Product[] = await res.json()
        setProducts(data)
      }
    })()
  }, [])

  function resetForm() {
    setEditing(emptyProduct)
    setError(null)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    const method = editing.id ? 'PUT' : 'POST'
    const target = editing.id ? `/api/products/${editing.id}` : '/api/products'
    try {
      const res = await fetch(target, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editing.name,
          slug: editing.slug || slugify(editing.name),
          description: editing.description,
          price: editing.price,
          images: editing.images,
          category: editing.category,
          sizes: editing.sizes,
          colors: editing.colors,
          inventory: editing.inventory,
          featured: editing.featured
        })
      })
      if (!res.ok) {
        const message = await res.json().catch(() => ({ error: 'Failed to save product' }))
        throw new Error(message.error || 'Failed to save product')
      }
      const saved: Product = await res.json()
      setProducts(prev => {
        const others = prev.filter(p => p.id !== saved.id)
        return [saved, ...others]
      })
      resetForm()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) throw new Error('Failed to delete product')
      setProducts(prev => prev.filter(p => p.id !== id))
      if (editing.id === id) resetForm()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to delete product')
    } finally {
      setLoading(false)
    }
  }

  function handleUpload(result: CldUploadWidgetResults) {
    const info = result.info as { secure_url?: string }
    if (info?.secure_url) {
      setEditing(prev => ({ ...prev, images: [...prev.images, info.secure_url] }))
    }
  }

  const formattedPrice = useMemo(() => formatCurrency(editing.price || 0), [editing.price])

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr),minmax(0,2fr)]">
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{editing.id ? 'Edit product' : 'Create product'}</h2>
          {editing.id && (
            <button className="text-sm text-brand-accent" onClick={resetForm}>
              New product
            </button>
          )}
        </div>
        <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input label="Name" value={editing.name} onChange={e => setEditing(prev => ({ ...prev, name: e.target.value }))} required />
          <Input label="Slug" value={editing.slug} placeholder="auto-generated" onChange={e => setEditing(prev => ({ ...prev, slug: e.target.value }))} />
          <Input label="Price (cents)" type="number" min={0} value={editing.price} onChange={e => setEditing(prev => ({ ...prev, price: Number(e.target.value) }))} required />
          <p className="text-xs text-slate-500">Preview: {formattedPrice}</p>
          <Textarea label="Description" value={editing.description} onChange={e => setEditing(prev => ({ ...prev, description: e.target.value }))} required />
          <Input label="Category" value={editing.category} onChange={e => setEditing(prev => ({ ...prev, category: e.target.value }))} required />
          <Input label="Sizes (comma separated)" value={editing.sizes.join(', ')} onChange={e => setEditing(prev => ({ ...prev, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
          <Input label="Colors (comma separated)" value={editing.colors.join(', ')} onChange={e => setEditing(prev => ({ ...prev, colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
          <Input label="Inventory" type="number" min={0} value={editing.inventory} onChange={e => setEditing(prev => ({ ...prev, inventory: Number(e.target.value) }))} required />
          <Select
            label="Featured"
            value={editing.featured ? 'yes' : 'no'}
            onChange={e => setEditing(prev => ({ ...prev, featured: e.target.value === 'yes' }))}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </Select>
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-slate-600">Images</span>
            <div className="flex flex-wrap gap-3">
              {editing.images.map(image => (
                <div key={image} className="relative h-24 w-24 overflow-hidden rounded-xl bg-brand-soft">
                  <Image src={image} alt="Product" fill sizes="96px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setEditing(prev => ({ ...prev, images: prev.images.filter(img => img !== image) }))}
                    className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-1 text-[10px] text-white"
                  >
                    remove
                  </button>
                </div>
              ))}
            </div>
            <CldUploadWidget
              signatureEndpoint="/api/cloudinary-sign"
              options={{ multiple: true, folder: 'hirufashion/products' }}
              onSuccess={handleUpload}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="inline-flex items-center justify-center rounded-full border border-brand-accent px-4 py-2 text-sm font-semibold text-brand-accent"
                >
                  Upload images
                </button>
              )}
            </CldUploadWidget>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex justify-center rounded-full bg-brand-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-accent/20 ${loading ? 'opacity-70' : 'hover:bg-brand-accent/90'}`}
          >
            {loading ? 'Saving…' : editing.id ? 'Update product' : 'Create product'}
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-4">
        {products.map(product => (
          <article key={product.id} className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-xs uppercase text-slate-500">{product.category}</p>
              </div>
              <span className="text-sm font-semibold text-brand-accent">{formatCurrency(product.price)}</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span>Inventory: {product.inventory}</span>
              <span>Featured: {product.featured ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.images.map(image => (
                <Image key={image} src={image} width={64} height={64} className="h-16 w-16 rounded-xl object-cover" alt={product.name} />
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <button
                className="rounded-full border border-brand-accent px-4 py-2 text-brand-accent"
                onClick={() => setEditing({ ...product })}
              >
                Edit
              </button>
              <button
                className="rounded-full border border-red-500 px-4 py-2 text-red-500"
                onClick={() => handleDelete(product.id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
        {products.length === 0 && <p className="text-sm text-slate-500">No products yet.</p>}
      </section>
    </div>
  )
}
