import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LogOut } from 'lucide-react'

interface UserNavFooterProps {
  name: string
  subtitle: string
  onLogout: () => void
  badge?: ReactNode
}

export function UserNavFooter({ name, subtitle, onLogout, badge }: UserNavFooterProps) {
  const { t } = useTranslation()

  return (
    <div className="mt-auto p-3 border-t border-border/80 space-y-2">
      <div className="flex items-center justify-between px-2 py-1">
        <div className="min-w-0 flex-1 mr-2">
          <div className="flex items-center gap-1">
            <span className="block text-xs font-bold text-foreground truncate">{name}</span>
            {badge}
          </div>
          <span className="block text-[11px] text-muted-foreground font-mono truncate">{subtitle}</span>
        </div>
        <button
          type="button"
          onClick={onLogout}
          title={t('nav.logout', { defaultValue: 'Sign Out' })}
          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
