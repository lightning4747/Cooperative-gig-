import { useTranslation } from 'react-i18next'

interface NavBrandHeaderProps {
  badgeText?: string
  subtitle: string
}

export function NavBrandHeader({ subtitle }: NavBrandHeaderProps) {
  const { t } = useTranslation()
  return (
    <div className="h-14 px-4 flex items-center gap-2.5 border-b border-border/80">
      <div className="overflow-hidden min-w-0">
        <span className="block text-xs font-black tracking-tight leading-tight truncate text-foreground">
          {t('app.title')}
        </span>
        <span className="block text-[10px] font-medium text-muted-foreground leading-tight truncate mt-0.5">
          {subtitle}
        </span>
      </div>
    </div>
  )
}
