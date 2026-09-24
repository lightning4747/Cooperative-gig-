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
        'pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3',
        className
      )}
    >
      <div className="space-y-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {badgeText && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground border border-border">
              {BadgeIcon && <BadgeIcon className="w-3 h-3 text-muted-foreground shrink-0" />}
              <span>{badgeText}</span>
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
