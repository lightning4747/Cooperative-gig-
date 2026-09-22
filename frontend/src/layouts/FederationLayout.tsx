import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  ClipboardList,
  AlertTriangle,
  Cpu,
  HeartHandshake,
  TrendingUp,
  Sliders,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  Landmark,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useFederationDashboard, useFederationWorkers } from '@/hooks/useFederationDashboard'
import { LanguageSelector } from '@/components/shared/LanguageSelector'
import { cn } from '@/lib/utils'
import { getTranslatedPersonName } from '@/lib/serviceTranslation'

interface NavItem {
  to: string
  key: string
  label: string
  icon: typeof LayoutDashboard
  exact?: boolean
  badge?: (data: { pendingCount?: number; emergencyCount?: number }) => number | null
}

const FEDERATION_NAV: NavItem[] = [
  {
    to: '/federation',
    key: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    to: '/federation/workers',
    key: 'workers',
    label: 'Workers Registry',
    icon: Users,
  },
  {
    to: '/federation/verification',
    key: 'verification',
    label: 'Verification Queue',
    icon: UserCheck,
    badge: (d) => d.pendingCount || 2,
  },
  {
    to: '/federation/societies',
    key: 'societies',
    label: 'Member Societies',
    icon: Building2,
  },
  {
    to: '/federation/jobs',
    key: 'jobs',
    label: 'Job Operations',
    icon: ClipboardList,
  },
  {
    to: '/federation/emergencies',
    key: 'emergencies',
    label: 'Emergency Dispatch',
    icon: AlertTriangle,
    badge: (d) => (d.emergencyCount ? d.emergencyCount : null),
  },
  {
    to: '/federation/allocation',
    key: 'allocation',
    label: 'Allocation Inspector',
    icon: Cpu,
  },
  {
    to: '/federation/welfare',
    key: 'welfare',
    label: 'Welfare Admin',
    icon: HeartHandshake,
  },
  {
    to: '/federation/forecast',
    key: 'forecast',
    label: 'Demand Forecast',
    icon: TrendingUp,
  },
  {
    to: '/federation/configuration',
    key: 'configuration',
    label: 'Configuration',
    icon: Sliders,
  },
]

export function FederationLayout() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { emergencies } = useFederationDashboard()
  const { workers } = useFederationWorkers()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const emergencyCount = emergencies?.length || 0
  const pendingCount = workers.filter(
    (w) => w.status === 'PENDING_VERIFICATION'
  ).length

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const currentNav = FEDERATION_NAV.find(
    (n) => (n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to))
  )

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[hsl(var(--sidebar-background))] border-r border-border text-foreground">
      {/* Brand Header - Apex Federation Emblem with NCCT Institutional Crest */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-border/80 bg-card/70 shrink-0">
        <div className="relative w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-xs shadow-xs border border-blue-600 shrink-0">
          <Landmark className="w-5 h-5 text-blue-100" />
          <span className="absolute text-[7px] font-black tracking-tighter text-white uppercase mt-0.5">NCCT</span>
        </div>
        <div className="overflow-hidden min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="block text-xs font-black tracking-tight text-foreground truncate uppercase">
              {t('federation.nav.apexFederation', { defaultValue: 'Apex Federation' })}
            </span>
            <span className="px-1 py-0.5 rounded text-[8px] font-extrabold bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 uppercase shrink-0">
              NCCT
            </span>
          </div>
          <span className="block text-[10px] text-muted-foreground font-medium truncate">
            {t('federation.nav.ministrySub', { defaultValue: 'Ministry of Cooperation · Apex Portal' })}
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {FEDERATION_NAV.map((item) => {
          const Icon = item.icon
          const badgeCount = item.badge?.({ pendingCount, emergencyCount })
          const isEmergencyItem = item.to.includes('emergencies')

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all min-h-[42px]',
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground font-medium'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0',
                        isActive ? 'text-white' : 'text-muted-foreground'
                      )}
                    />
                    <span className="truncate">{t(`federation.nav.${item.key}`, { defaultValue: item.label })}</span>
                  </div>

                  {badgeCount !== null && badgeCount !== undefined && badgeCount > 0 && (
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono',
                        isActive
                          ? 'bg-white/20 text-white'
                          : isEmergencyItem
                          ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                      )}
                    >
                      {badgeCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Admin User Card & Sign Out */}
      <div className="p-3 border-t border-border/80 bg-card/40 space-y-2 shrink-0">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="block text-xs font-bold text-foreground truncate">
                {getTranslatedPersonName(t, user?.name || 'Federation Admin')}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            </div>
            <span className="block text-[10px] text-muted-foreground font-medium">
              {t('federation.nav.apexAuthority', { defaultValue: 'Apex Authority · NCCT' })}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title={t('federation.nav.logout', { defaultValue: 'Sign Out' })}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background text-foreground flex antialiased selection:bg-blue-500/20">
      {/* Desktop Fixed Sidebar (>= 1024px) */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer ( < 1024px ) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full shadow-xl">
            <div className="absolute top-2 right-2 z-10">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-card text-muted-foreground hover:text-foreground border border-border"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header - Sticky Full Width Header */}
        <header className="sticky top-0 z-20 h-14 bg-card border-b border-border px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Link
                to="/federation"
                className="hover:text-foreground transition-colors flex items-center gap-1"
              >
                <span>Federation</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
              <span className="text-foreground font-bold truncate">
                {currentNav ? t(`federation.nav.${currentNav.key}`, { defaultValue: currentNav.label }) : t('federation.nav.overview', { defaultValue: 'Overview' })}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Emergency Alert Badge */}
            {emergencyCount > 0 && (
              <NavLink
                to="/federation/emergencies"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold animate-pulse hover:bg-red-500/25 transition-all shadow-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t('federation.nav.emergencyBadge', { count: emergencyCount, defaultValue: `${emergencyCount} Emergency` })}</span>
              </NavLink>
            )}

            {/* Quick Pending Verification Badge */}
            {pendingCount > 0 && (
              <Link
                to="/federation/verification"
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{pendingCount} Pending</span>
              </Link>
            )}

            <LanguageSelector />

            <button
              type="button"
              onClick={handleLogout}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title={t('federation.nav.logout', { defaultValue: 'Sign Out' })}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Container - Full Desktop Width */}
        <main className="flex-1 p-6 lg:p-8 w-full max-w-none">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
