import Link from 'next/link'

export default function SuccessPage({ searchParams }: { searchParams: { id?: string } }) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="rounded-full bg-brand-accent/10 p-6">
        <div className="h-12 w-12 rounded-full bg-brand-accent text-2xl font-bold text-white">✓</div>
      </div>
      <h1 className="text-3xl font-semibold">Order confirmed</h1>
      <p className="max-w-md text-sm text-slate-600">
        Thank you for shopping with HiruFashion. We’ll send you updates as soon as your order ships. Your order reference is{' '}
        <span className="font-semibold text-brand-accent">{searchParams.id ?? 'pending'}</span>.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/orders" className="rounded-full bg-brand-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-accent/20">
          Track orders
        </Link>
        <Link href="/products" className="rounded-full border border-brand-accent px-5 py-3 text-sm font-semibold text-brand-accent">
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
