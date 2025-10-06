'use client'

import { useEffect, useState } from 'react'

export default function WelcomeGate({ show }: { show: boolean }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!show) return
    if (typeof window === 'undefined') return
    if (window.sessionStorage.getItem('welcomed') === '1') return
    setVisible(true)
    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem('welcomed', '1')
      setVisible(false)
    }, 2000)
    return () => window.clearTimeout(timer)
  }, [show])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-10 py-12 text-center shadow-2xl transition-all">
        <div className="text-4xl font-semibold text-brand-accent">HiruFashion</div>
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Welcome back</p>
      </div>
    </div>
  )
}
