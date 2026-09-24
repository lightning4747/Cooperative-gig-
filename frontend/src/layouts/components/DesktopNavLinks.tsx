import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface NavItemConfig {
  to: string
  labelKey: string
  defaultLabel: string
  icon: LucideIcon
  exact?: boolean
  badge?: number | string
}

export interface DesktopNavLinksProps {
  items: NavItemConfig[]
  variant?: 'default' | 'blue'
  onItemClick?: () => void
}

export function DesktopNavLinks({ items, variant = 'default', onItemClick }: DesktopNavLinksProps) {
  const { t } = useTranslation()

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            onClick={onItemClick}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all min-h-[42px]',
                isActive
                  ? variant === 'blue'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0',
                      isActive
                        ? variant === 'blue'
                          ? 'text-white'
                          : 'text-amber-400 dark:text-amber-600'
                        : 'text-slate-400 group-hover:text-slate-600'
                    )}
                  />
                  <span className="truncate">{t(item.labelKey, { defaultValue: item.defaultLabel })}</span>
                  {item.badge ? (
                    <span
                      className={cn(
                        'ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-800'
                      )}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <ChevronRight
                  className={cn(
                    'w-3.5 h-3.5 shrink-0 transition-transform',
                    isActive
                      ? 'text-white/80 translate-x-0.5'
                      : 'text-slate-400'
                  )}
                />
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
