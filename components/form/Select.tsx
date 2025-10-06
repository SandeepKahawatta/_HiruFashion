import { forwardRef, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, error, className, children, ...props }, ref) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
      {label && <span>{label}</span>}
      <select
        ref={ref}
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40',
          error && 'border-red-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs font-normal text-red-500">{error}</span>}
    </label>
  )
})

export default Select
