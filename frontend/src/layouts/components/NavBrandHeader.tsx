import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface NavBrandHeaderProps {
  title?: string
  badgeText?: string
  subtitle: string
  badgeClassName?: string
}

export function NavBrandHeader({ title, badgeText, subtitle, badgeClassName }: NavBrandHeaderProps) {
  const { t } = useTranslation()
  return (
    <div className="h-14 px-4 flex items-center gap-2.5 border-b border-border/80 bg-card shrink-0">
      {badgeText && (
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-xs',
            badgeClassName || 'bg-amber-400 text-slate-950 dark:bg-amber-500 dark:text-slate-950'
          )}
        >
          {badgeText}
        </div>
      )}
      <div className="overflow-hidden min-w-0">
        <span className="block text-xs font-bold tracking-tight leading-tight truncate text-foreground">
          {title || t('app.title')}
        </span>
        <span className="block text-[10px] font-medium text-muted-foreground leading-tight truncate mt-0.5">
          {subtitle}
        </span>
      </div>
    </div>
  )
}
