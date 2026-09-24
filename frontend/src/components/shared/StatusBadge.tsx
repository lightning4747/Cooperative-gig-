import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { JOB_STATUS_CONFIG } from '@/lib/jobStatus'

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useTranslation()
  const config = JOB_STATUS_CONFIG[status] || {
    labelKey: status,
    bgClass: 'bg-slate-100',
    dotClass: 'bg-slate-400',
    textClass: 'text-slate-700',
  }

  const label = config.labelKey ? t(config.labelKey, { defaultValue: status }) : status

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border border-border/50',
        config.bgClass,
        config.textClass,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dotClass)} />
      {label}
    </span>
  )
}
