import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  backTo?: string
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function PageHeader({ backTo, title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <div className="flex items-center gap-3 min-w-0">
        {backTo && (
          <Link
            to={backTo}
            className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-black tracking-tight text-foreground truncate">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  )
}
