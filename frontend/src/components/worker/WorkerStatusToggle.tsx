import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { WorkerAvailability } from '@/types/worker'
import { cn } from '@/lib/utils'

interface WorkerStatusToggleProps {
  currentStatus: WorkerAvailability
  onToggle: (newStatus: WorkerAvailability) => Promise<unknown> | void
  disabled?: boolean
  className?: string
}

export function WorkerStatusToggle({
  currentStatus,
  onToggle,
  disabled = false,
  className,
}: WorkerStatusToggleProps) {
  const { t } = useTranslation()
  const [isUpdating, setIsUpdating] = useState(false)

  const isAvailable = currentStatus === 'AVAILABLE'
  const isBusy = currentStatus === 'BUSY'

  const handleToggle = async () => {
    if (disabled || isUpdating || isBusy) return
    setIsUpdating(true)
    try {
      const nextStatus: WorkerAvailability = isAvailable ? 'OFFLINE' : 'AVAILABLE'
      await onToggle(nextStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div
      className={cn(
        'p-3.5 sm:p-4 rounded-xl border border-border bg-card shadow-xs flex items-center justify-between gap-4',
        className
      )}
    >
      {/* Status indicator */}
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'w-3 h-3 rounded-full shrink-0',
            isAvailable
              ? 'bg-emerald-500'
              : isBusy
              ? 'bg-amber-500'
              : 'bg-muted-foreground/40'
          )}
        />
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">
            {isAvailable
              ? t('worker.status.online', 'Online')
              : isBusy
              ? t('worker.status.busy', 'Busy')
              : t('worker.status.offline', 'Offline')}
          </span>
          {isBusy && (
            <span className="text-[11px] text-muted-foreground">
              ({t('worker.status.activeJob', 'On active job')})
            </span>
          )}
        </div>
      </div>

      {/* Direct toggle button */}
      {!isBusy && (
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled || isUpdating}
          className={cn(
            'px-4 py-2 rounded-lg font-bold text-xs border transition-colors cursor-pointer min-h-[38px] flex items-center justify-center gap-2',
            isAvailable
              ? 'border-border bg-secondary hover:bg-secondary/80 text-foreground'
              : 'border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white',
            (disabled || isUpdating) && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isUpdating ? (
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isAvailable ? (
            <span>{t('worker.status.goOffline', 'Go Offline')}</span>
          ) : (
            <span>{t('worker.status.goOnline', 'Go Online')}</span>
          )}
        </button>
      )}
    </div>
  )
}

