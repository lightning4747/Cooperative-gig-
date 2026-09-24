import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Home,
  Briefcase,
  Wallet,
  User,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useWorkerProfile } from '@/hooks/useWorkerProfile'
import { NavBrandHeader } from './components/NavBrandHeader'
import { DesktopNavLinks, type NavItemConfig } from './components/DesktopNavLinks'
import { MobileBottomNav } from './components/MobileBottomNav'
import { UserNavFooter } from './components/UserNavFooter'
import { WorkerAvailabilityCard } from './components/WorkerAvailabilityCard'
import { getTranslatedPersonName, getTranslatedSocietyName } from '@/lib/serviceTranslation'

const NAV_ITEMS: NavItemConfig[] = [
  {
    to: '/worker',
    labelKey: 'nav.home',
    defaultLabel: 'Home',
    icon: Home,
    exact: true,
  },
  {
    to: '/worker/jobs',
    labelKey: 'nav.jobs',
    defaultLabel: 'Jobs',
    icon: Briefcase,
  },
  {
    to: '/worker/passbook',
    labelKey: 'nav.passbook',
    defaultLabel: 'Passbook',
    icon: Wallet,
  },
  {
    to: '/worker/profile',
    labelKey: 'nav.profile',
    defaultLabel: 'Profile',
    icon: User,
  },
]

export function WorkerLayout() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { profile, updateAvailability } = useWorkerProfile(user?.id)
  const [isToggling, setIsToggling] = useState(false)

  const isAvailable = profile?.availability === 'AVAILABLE'

  const handleToggleAvailability = async () => {
    if (isToggling) return
    setIsToggling(true)
    try {
      const nextStatus = isAvailable ? 'OFFLINE' : 'AVAILABLE'
      await updateAvailability(nextStatus)
    } finally {
      setIsToggling(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col md:flex-row antialiased selection:bg-amber-500/20 selection:text-amber-900">
      {/* Desktop Left Sidebar (>= 768px) */}
      <aside className="relative z-10 hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 md:z-30 bg-card border-r border-border">
        <NavBrandHeader badgeText="CW" subtitle="Worker Portal" />

        {/* Availability Switcher Card */}
        <WorkerAvailabilityCard
          isAvailable={isAvailable}
          isToggling={isToggling}
          onToggle={handleToggleAvailability}
        />

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto">
          <DesktopNavLinks items={NAV_ITEMS} />
        </div>

        {/* Worker Info & Sign Out */}
        <UserNavFooter
          name={getTranslatedPersonName(t, user?.name || 'Worker')}
          subtitle={getTranslatedSocietyName(t, profile?.societyName || 'Cooperative Member')}
          onLogout={handleLogout}
        />
      </aside>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 md:pl-60">
        {/* Top AppBar */}
        <header className="relative sticky top-0 z-20 h-14 bg-card border-b border-border px-3 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 md:hidden min-w-0 flex-1 mr-1">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-black tracking-tight leading-tight truncate text-foreground">
                {getTranslatedPersonName(t, user?.name || 'Worker')}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {getTranslatedSocietyName(t, profile?.societyName || 'Cooperative Member')}
              </span>
            </div>
          </div>

          {/* Desktop Left Spacer */}
          <div className="hidden md:block" />

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleLogout}
              className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 cursor-pointer"
              title={t('nav.logout', { defaultValue: 'Sign Out' })}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Page Outlet */}
        <main className="relative z-10 flex-1 p-3.5 sm:p-6 max-w-4xl w-full mx-auto pb-24 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation (< 768px) */}
        <MobileBottomNav items={NAV_ITEMS} />
      </div>
    </div>
  )
}

