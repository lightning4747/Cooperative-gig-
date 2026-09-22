import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface WorkerAvailabilityCardProps {
  isAvailable: boolean
  isToggling: boolean
  onToggle: () => void
}

export function WorkerAvailabilityCard({
  isAvailable,
  isToggling,
  onToggle,
}: WorkerAvailabilityCardProps) {
  const { t } = useTranslation()

  return (
    <div className="px-3 pt-3 pb-1">
      <button
        type="button"
        role="switch"
        aria-checked={isAvailable}
        onClick={onToggle}
        disabled={isToggling}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-colors cursor-pointer select-none text-left',
          'bg-slate-50 hover:bg-slate-100 border-slate-200 dark:bg-zinc-800/60 dark:border-zinc-700 dark:hover:bg-zinc-800',
          isToggling && 'opacity-60 cursor-not-allowed'
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              'w-2 h-2 rounded-full shrink-0 transition-colors',
              isAvailable ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-600'
            )}
          />
          <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
            {isAvailable
              ? t('worker.status.online', 'Online')
              : t('worker.status.offline', 'Offline')}
          </span>
        </div>

        <div
          className={cn(
            'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
            isAvailable ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-600'
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out',
              isAvailable ? 'translate-x-[20px]' : 'translate-x-[2px]'
            )}
          />
        </div>
      </button>
    </div>
  )
}
