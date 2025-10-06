import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost'
}

export default function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  const variants: Record<typeof variant, string> = {
    primary: 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20 hover:bg-brand-accent/90',
    outline: 'border border-brand-accent text-brand-accent hover:bg-brand-accent/10',
    ghost: 'hover:bg-slate-100'
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
