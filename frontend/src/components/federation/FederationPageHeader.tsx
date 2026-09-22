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
  actions,
  className,
}: FederationPageHeaderProps) {
  return (
    <div
      className={cn(
        'p-6 rounded-2xl bg-card border border-border shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4',
        className
      )}
    >
      <div className="space-y-1.5 min-w-0">
        <h1 className="text-2xl font-black tracking-tight text-foreground leading-tight">
          {title}
        </h1>
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  )
}
