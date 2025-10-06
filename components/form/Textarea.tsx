import { forwardRef, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, ...props },
  ref
) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
      {label && <span>{label}</span>}
      <textarea
        ref={ref}
        className={cn(
          'min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/40',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs font-normal text-red-500">{error}</span>}
    </label>
  )
})

export default Textarea
