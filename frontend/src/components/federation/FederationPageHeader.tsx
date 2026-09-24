import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FederationPageHeaderProps {
  title: string
  description?: string
  badgeIcon?: LucideIcon
  badgeText?: string
  actions?: ReactNode
  className?: string
}

export function FederationPageHeader({
  title,
  description,
  badgeIcon: BadgeIcon,
  badgeText,
  actions,
  className,
}: FederationPageHeaderProps) {
  return (
    <div
      className={cn(
        'pb-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
        className
      )}
    >
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {badgeText && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
              {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
              <span>{badgeText}</span>
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
