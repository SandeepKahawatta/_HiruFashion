'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { useCart } from '@/lib/cart/context'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/category/women', label: 'Women' },
  { href: '/category/men', label: 'Men' }
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { items } = useCart()
  const { data: user } = useSWR('/api/auth/me', url =>
    fetch(url, { credentials: 'include' }).then(res => (res.ok ? res.json() : null))
  )

  const cartCount = items.reduce((sum, item) => sum + item.qty, 0)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm">
      <div className="container-responsive flex items-center justify-between py-4">
        <Link href="/" className="text-xl font-semibold">
          Hiru<span className="text-brand-accent">Fashion</span>
        </Link>
        <button
          className="md:hidden rounded-md border border-slate-200 p-2"
          onClick={() => setOpen(prev => !prev)}
          aria-label="Toggle navigation"
        >
          <span className="block h-0.5 w-5 bg-slate-900" />
          <span className="mt-1 block h-0.5 w-5 bg-slate-900" />
          <span className="mt-1 block h-0.5 w-5 bg-slate-900" />
        </button>
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn('text-sm font-medium', pathname === link.href && 'text-brand-accent')}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/cart" className="text-sm font-semibold">
            Cart ({cartCount})
          </Link>
          {user ? (
            <div className="flex items-center gap-3 text-sm">
              <Link href="/orders" className="font-medium">
                Orders
              </Link>
              {user.role === 'admin' && (
                <Link href="/admin/products" className="font-medium">
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="rounded-full border px-3 py-1 font-medium">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm">
              <Link href="/login">Login</Link>
              <Link href="/register" className="rounded-full bg-brand-accent px-3 py-1 font-semibold text-white">
                Join
              </Link>
            </div>
          )}
        </nav>
      </div>
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="container-responsive flex flex-col gap-3 py-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/cart" className="text-base font-semibold" onClick={() => setOpen(false)}>
              Cart ({cartCount})
            </Link>
            {user ? (
              <>
                <Link href="/orders" onClick={() => setOpen(false)}>
                  Orders
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin/products" onClick={() => setOpen(false)}>
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    setOpen(false)
                    handleLogout()
                  }}
                  className="rounded-md border px-3 py-2 text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>
                  Login
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="rounded-md bg-brand-accent px-3 py-2 text-white">
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
