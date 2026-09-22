import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  label?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  inline?: boolean
}

const SIZE_MAP = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

export function LoadingSpinner({
  label,
  className,
  size = 'md',
  inline = false,
}: LoadingSpinnerProps) {
  if (inline || !label) {
    return (
      <span
        role="status"
        aria-live="polite"
        className={cn('inline-flex items-center justify-center gap-2', className)}
      >
        <Loader2 className={cn('animate-spin shrink-0', SIZE_MAP[size])} />
        {label && <span className="text-xs">{label}</span>}
      </span>
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center p-6 space-y-2', className)}
    >
      <Loader2 className={cn('animate-spin text-primary shrink-0', SIZE_MAP[size])} />
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  )
}
