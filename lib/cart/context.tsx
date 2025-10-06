'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type CartItem = {
  id: string
  qty: number
  size?: string
  color?: string
}

export type CartContextValue = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string, options?: { size?: string; color?: string }) => void
  updateItem: (id: string, update: Partial<CartItem>) => void
  clear: () => void
}

const STORAGE_KEY = 'hirufashion.cart'

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setItems(parsed)
      }
    } catch (err) {
      console.warn('Failed to load cart', err)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (err) {
      console.warn('Failed to persist cart', err)
    }
  }, [items])

  const value = useMemo<CartContextValue>(() => {
    function addItem(item: CartItem) {
      setItems(prev => {
        const existingIndex = prev.findIndex(p => p.id === item.id && p.size === item.size && p.color === item.color)
        if (existingIndex !== -1) {
          const next = [...prev]
          next[existingIndex] = { ...next[existingIndex], qty: next[existingIndex].qty + item.qty }
          return next
        }
        return [...prev, item]
      })
    }

    function removeItem(id: string, options: { size?: string; color?: string } = {}) {
      setItems(prev => prev.filter(p => !(p.id === id && p.size === options.size && p.color === options.color)))
    }

    function updateItem(id: string, update: Partial<CartItem>) {
      setItems(prev =>
        prev.map(p => {
          if (p.id === id && (update.size ? p.size === update.size : true) && (update.color ? p.color === update.color : true)) {
            return { ...p, ...update }
          }
          return p
        })
      )
    }

    function clear() {
      setItems([])
    }

    return {
      items,
      addItem,
      removeItem,
      updateItem,
      clear
    }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used within CartProvider')
  return value
}
