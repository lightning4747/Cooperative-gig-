import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Home,
  Calendar,
  User,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useJobs } from '@/hooks/useJob'
import { LanguageSelector } from '@/components/shared'
import { NavBrandHeader } from './components/NavBrandHeader'
import { DesktopNavLinks, type NavItemConfig } from './components/DesktopNavLinks'
import { MobileBottomNav } from './components/MobileBottomNav'
import { UserNavFooter } from './components/UserNavFooter'
import { getTranslatedPersonName } from '@/lib/serviceTranslation'

export function CustomerLayout() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const { data: allJobs } = useJobs({ customerId: user?.id })
  const activeBookingsCount = (allJobs || []).filter(
    (j) => !['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(j.status)
  ).length

  // Dynamic context for Top AppBar instead of repeating platform title
  const getHeaderContext = () => {
    const path = location.pathname
    if (path.includes('/tracking') || path.includes('/active')) {
      return {
        title: t('customer.nav.liveTracking', { defaultValue: 'Live Dispatch Tracking' }),
        subtitle: t('customer.nav.liveTrackingSub', { defaultValue: 'Real-time worker routing & doorstep OTP' }),
      }
    }
    if (path.includes('/bookings')) {
      return {
        title: t('nav.bookings', { defaultValue: 'My Bookings' }),
        subtitle: t('customer.nav.bookingsSub', { defaultValue: 'Track dispatch, booking history & download invoices' }),
      }
    }
    if (path.includes('/profile')) {
      return {
        title: t('nav.profile', { defaultValue: 'Account & Preferences' }),
        subtitle: t('customer.nav.profileSub', { defaultValue: 'Language settings & cooperative member preferences' }),
      }
    }
    return {
      title: t('customer.portalSubtitle', { defaultValue: 'Customer Portal' }),
    }
  }

  const headerContext = getHeaderContext()

  const navItems: NavItemConfig[] = [
    {
      to: '/customer',
      labelKey: 'nav.home',
      defaultLabel: 'Home',
      icon: Home,
      exact: true,
    },
    {
      to: '/customer/bookings',
      labelKey: 'nav.bookings',
      defaultLabel: 'My Bookings',
      icon: Calendar,
      badge: activeBookingsCount > 0 ? activeBookingsCount : undefined,
    },
    {
      to: '/customer/profile',
      labelKey: 'nav.profile',
      defaultLabel: 'Profile',
      icon: User,
    },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col md:flex-row antialiased selection:bg-amber-500/20 selection:text-amber-900">
      {/* Desktop Left Sidebar (>= 768px) */}
      <aside className="relative z-10 hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 md:z-30 bg-card border-r border-border">
        <NavBrandHeader
          badgeText="CS"
          subtitle={t('customer.portalSubtitle', { defaultValue: 'Customer Portal' })}
        />

        {/* Desktop Navigation Links */}
        <div className="mt-2 flex-1 overflow-y-auto">
          <DesktopNavLinks items={navItems} />
        </div>

        {/* User Card & Logout */}
        <UserNavFooter
          name={getTranslatedPersonName(t, user?.name || 'Ravi Kumar')}
          subtitle={user?.phone || ''}
          onLogout={handleLogout}
        />
      </aside>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 md:pl-60">
        {/* Top AppBar */}
        <header className="relative sticky top-0 z-20 h-14 bg-card border-b border-border px-3 sm:px-6 flex items-center justify-between">
          {/* Mobile Header (< 768px) */}
          <div className="flex items-center gap-2 md:hidden min-w-0 flex-1 mr-2">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-black tracking-tight leading-tight truncate text-foreground">
                {headerContext.title}
              </span>
              {headerContext.subtitle && (
                <span className="text-[10px] text-muted-foreground leading-tight truncate">
                  {headerContext.subtitle}
                </span>
              )}
            </div>
          </div>

          {/* Desktop Header (>= 768px) */}
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground min-w-0">
            <span className="font-semibold text-foreground text-sm tracking-tight">{headerContext.title}</span>
            {headerContext.subtitle && (
              <>
                <span>·</span>
                <span className="truncate">{headerContext.subtitle}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <LanguageSelector />
            <button
              type="button"
              onClick={handleLogout}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 cursor-pointer"
              title={t('nav.logout', { defaultValue: 'Sign Out' })}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Page Outlet */}
        <main className="relative z-10 flex-1 p-3.5 sm:p-6 max-w-5xl w-full mx-auto pb-24 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation (< 768px) */}
        <MobileBottomNav items={navItems} />
      </div>
    </div>
  )
}

