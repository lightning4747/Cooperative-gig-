import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { NavItemConfig } from './DesktopNavLinks'

export function MobileBottomNav({ items }: { items: NavItemConfig[] }) {
  const { t } = useTranslation()

  return (
    <nav className="fixed bottom-0 inset-x-0 w-full h-16 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 shadow-sm z-30 md:hidden">
      <div className="flex items-center justify-around h-full max-w-lg w-full mx-auto px-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                cn(
                  'flex-1 min-w-0 flex flex-col items-center justify-center h-full py-1 transition-all select-none cursor-pointer group',
                  isActive
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative flex items-center justify-center">
                    <Icon
                      className={cn(
                        'w-5 h-5 transition-transform duration-150',
                        isActive
                          ? 'text-amber-500 dark:text-amber-400 stroke-[2.25px] scale-105'
                          : 'stroke-[1.75px] group-hover:scale-105'
                      )}
                    />
                    {item.badge ? (
                      <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-slate-900 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] truncate max-w-full text-center leading-tight tracking-tight mt-1 transition-colors',
                      isActive
                        ? 'font-bold text-slate-900 dark:text-white'
                        : 'font-medium text-slate-500 dark:text-zinc-400 group-hover:text-slate-800'
                    )}
                  >
                    {t(item.labelKey, { defaultValue: item.defaultLabel })}
                  </span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
