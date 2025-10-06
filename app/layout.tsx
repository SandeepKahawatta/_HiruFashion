import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HiruFashion — Elevated Sri Lankan Fashion',
  description: 'Modern Sri Lankan fashion store with curated collections, personalized recommendations, and secure checkout.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-brand-soft text-slate-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
