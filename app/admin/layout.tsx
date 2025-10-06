import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserFromCookies } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUserFromCookies()
  if (!user) {
    redirect('/login')
  }
  if (user.role !== 'admin') {
    redirect('/')
  }
  return (
    <div className="min-h-screen bg-brand-soft">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-responsive flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Admin Console</h1>
            <p className="text-sm text-slate-500">Manage products, media, and orders.</p>
          </div>
          <nav className="flex flex-wrap items-center gap-3 text-sm font-medium">
            <Link href="/admin/products" className="rounded-full px-4 py-2 hover:bg-brand-accent/10">
              Products
            </Link>
            <Link href="/admin/orders" className="rounded-full px-4 py-2 hover:bg-brand-accent/10">
              Orders
            </Link>
            <Link href="/" className="rounded-full border border-brand-accent px-4 py-2 text-brand-accent">
              View store
            </Link>
          </nav>
        </div>
      </header>
      <main className="container-responsive py-10">{children}</main>
    </div>
  )
}
