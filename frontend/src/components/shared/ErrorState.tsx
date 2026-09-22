import { AlertCircle, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  message: string
  retry?: () => void
  className?: string
}

export function ErrorState({
  title = 'An error occurred',
  message,
  retry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center text-center p-6 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive',
        className
      )}
    >
      <AlertCircle className="w-8 h-8 mb-2" />
      <h3 className="text-sm font-bold">{title}</h3>
      <p className="mt-1 text-xs text-destructive/80 max-w-sm">{message}</p>
      {retry && (
        <button
          type="button"
          onClick={retry}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 transition-colors focus:outline-none focus:ring-2 focus:ring-destructive"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  )
}
