'use client'

import { CartProvider } from '@/lib/cart/context'
import { SWRConfig } from 'swr'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ fetcher: (resource: string) => fetch(resource, { credentials: 'include' }).then(res => res.json()) }}>
      <CartProvider>{children}</CartProvider>
    </SWRConfig>
  )
}
