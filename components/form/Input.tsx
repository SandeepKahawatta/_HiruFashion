import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, className, ...props }, ref) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
      {label && <span>{label}</span>}
      <input
        ref={ref}
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs font-normal text-red-500">{error}</span>}
    </label>
  )
})

export default Input
