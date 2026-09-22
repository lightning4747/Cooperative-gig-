import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type MetricCardVariant = 'governance' | 'institutional' | 'welfare' | 'surplus' | 'compliance' | 'active'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  variant?: MetricCardVariant
  trend?: {
    value: string
    isPositive?: boolean
    label?: string
  }
  badge?: ReactNode
  className?: string
  onClick?: () => void
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant,
  trend,
  badge,
  className,
  onClick,
}: MetricCardProps) {
  // Infer variant if not explicitly provided
  const resolvedVariant: 'governance' | 'welfare' | 'compliance' = (() => {
    if (variant === 'welfare' || variant === 'surplus') return 'welfare'
    if (variant === 'compliance' || variant === 'active') return 'compliance'
    if (variant === 'governance' || variant === 'institutional') return 'governance'

    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes('welfare') || lowerTitle.includes('pool') || lowerTitle.includes('surplus') || lowerTitle.includes('fund')) {
      return 'welfare'
    }
    if (lowerTitle.includes('compliance') || lowerTitle.includes('active') || lowerTitle.includes('available') || lowerTitle.includes('verified')) {
      return 'compliance'
    }
    return 'governance'
  })()

  // Contextual icon and accent styling
  const variantStyles = {
    governance: {
      icon: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50',
      accent: 'border-l-4 border-l-blue-600',
    },
    welfare: {
      icon: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50',
      accent: 'border-l-4 border-l-amber-500 dark:border-l-amber-400',
    },
    compliance: {
      icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50',
      accent: 'border-l-4 border-l-emerald-600 dark:border-l-emerald-500',
    },
  }[resolvedVariant]

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3 transition-all relative overflow-hidden',
        variantStyles.accent,
        onClick && 'cursor-pointer hover:border-border hover:shadow-md hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
          {title}
        </span>
        <div
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-2xs',
            variantStyles.icon
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground">
            {value}
          </span>
          {badge}
        </div>

        {(subtitle || trend) && (
          <div className="flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-bold font-mono text-[11px]',
                  trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {trend.value}
              </span>
            )}
            {subtitle && (
              <span className="text-muted-foreground truncate text-[11px]">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
