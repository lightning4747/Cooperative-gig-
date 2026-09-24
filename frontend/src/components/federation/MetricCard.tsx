import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type MetricCardVariant = 'governance' | 'institutional' | 'welfare' | 'surplus' | 'compliance' | 'active'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
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
  trend,
  badge,
  className,
  onClick,
}: MetricCardProps) {

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-5 rounded-lg border border-slate-200 bg-white space-y-1 transition-colors',
        onClick && 'cursor-pointer hover:border-slate-300',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
          {title}
        </span>
      </div>

      <div className="space-y-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-3xl font-bold tracking-tight text-slate-900 mt-1">
            {value}
          </span>
          {badge}
        </div>

        {(subtitle || trend) && (
          <div className="flex items-center gap-1.5 pt-0.5 text-xs">
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center text-[11px] font-medium font-mono',
                  trend.isPositive === true
                    ? 'text-emerald-600'
                    : trend.isPositive === false
                    ? 'text-rose-600'
                    : 'text-slate-500'
                )}
              >
                {trend.isPositive === true ? '▲ ' : trend.isPositive === false ? '▼ ' : ''}
                {trend.value}
              </span>
            )}
            {subtitle && (
              <span className="text-slate-400 text-xs truncate">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
