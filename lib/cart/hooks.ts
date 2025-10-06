'use client'

import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '@/lib/api'
import type { ProductDTO } from '@/lib/types'
import { useCart, type CartItem } from './context'

export function useCartDetails() {
  const { items, ...mutators } = useCart()
  const [products, setProducts] = useState<Record<string, ProductDTO>>({})

  useEffect(() => {
    let ignore = false
    ;(async () => {
      const map: Record<string, ProductDTO> = {}
      for (const item of items) {
        if (!map[item.id]) {
          const res = await apiFetch(`/api/products/${item.id}`)
          if (res.ok) {
            const data: ProductDTO = await res.json()
            map[item.id] = data
          }
        }
      }
      if (!ignore) setProducts(map)
    })()
    return () => {
      ignore = true
    }
  }, [items])

  const enriched = useMemo(() => {
    return items
      .map(item => {
        const product = products[item.id]
        if (!product) return null
        return { ...item, product }
      })
      .filter((entry): entry is CartItem & { product: ProductDTO } => entry !== null)
  }, [items, products])

  const subtotalCents = enriched.reduce((total, item) => total + item.qty * item.product.price, 0)
  return { enriched, subtotalCents, items, ...mutators }
}
