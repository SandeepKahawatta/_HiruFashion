import Navbar from '@/components/Navbar'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear()
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container-responsive py-10 sm:py-12 lg:py-16">{children}</div>
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        © {year} HiruFashion. Crafted in Colombo with love.
      </footer>
    </div>
  )
}
