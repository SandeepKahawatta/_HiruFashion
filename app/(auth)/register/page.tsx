'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Input from '@/components/form/Input'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          password: data.get('password')
        })
      })
      if (!res.ok) {
        const message = await res.json().catch(() => ({ error: 'Unable to register' }))
        throw new Error(message.error || 'Unable to register')
      }
      router.push('/')
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-white via-brand-soft to-white px-4 py-16">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="mt-2 text-sm text-slate-600">Join the HiruFashion collective.</p>
        <div className="mt-6 flex flex-col gap-4">
          <Input name="name" label="Full name" required autoComplete="name" />
          <Input name="email" type="email" label="Email" required autoComplete="email" />
          <Input name="password" type="password" label="Password" required autoComplete="new-password" minLength={8} />
        </div>
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className={`mt-6 inline-flex w-full justify-center rounded-full bg-brand-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-accent/20 ${loading ? 'opacity-70' : 'hover:bg-brand-accent/90'}`}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-accent">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
