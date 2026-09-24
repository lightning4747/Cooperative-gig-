import { useState } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
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
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useFederationDashboard, useFederationWorkers } from '@/hooks/useFederationDashboard'
import { LanguageSelector } from '@/components/shared/LanguageSelector'
import { NavBrandHeader } from './components/NavBrandHeader'
import { DesktopNavLinks, type NavItemConfig } from './components/DesktopNavLinks'
import { UserNavFooter } from './components/UserNavFooter'
import { getTranslatedPersonName } from '@/lib/serviceTranslation'

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

  const navItems: NavItemConfig[] = [
    {
      to: '/federation',
      labelKey: 'federation.nav.overview',
      defaultLabel: 'Overview',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      to: '/federation/workers',
      labelKey: 'federation.nav.workers',
      defaultLabel: 'Workers',
      icon: Users,
    },
    {
      to: '/federation/verification',
      labelKey: 'federation.nav.verification',
      defaultLabel: 'Worker Verification',
      icon: UserCheck,
      badge: pendingCount > 0 ? pendingCount : 1,
    },
    {
      to: '/federation/societies',
      labelKey: 'federation.nav.societies',
      defaultLabel: 'Member Cooperatives',
      icon: Building2,
    },
    {
      to: '/federation/jobs',
      labelKey: 'federation.nav.jobs',
      defaultLabel: 'Job Operations',
      icon: ClipboardList,
    },
    {
      to: '/federation/emergencies',
      labelKey: 'federation.nav.emergencies',
      defaultLabel: 'Emergency Dispatch',
      icon: AlertTriangle,
      badge: emergencyCount > 0 ? emergencyCount : undefined,
    },
    {
      to: '/federation/allocation',
      labelKey: 'federation.nav.allocation',
      defaultLabel: 'Job Dispatch Review',
      icon: Cpu,
    },
    {
      to: '/federation/welfare',
      labelKey: 'federation.nav.welfare',
      defaultLabel: 'Welfare Fund',
      icon: HeartHandshake,
    },
    {
      to: '/federation/forecast',
      labelKey: 'federation.nav.forecast',
      defaultLabel: 'Analytics & Forecast',
      icon: TrendingUp,
    },
    {
      to: '/federation/configuration',
      labelKey: 'federation.nav.configuration',
      defaultLabel: 'Settings',
      icon: Sliders,
    },
  ]

  const currentNav = navItems.find(
    (n) => (n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to))
  )

  const sidebarContent = (
    <div className="flex flex-col h-full border-r border-slate-200 bg-white">
      {/* Brand Header */}
      <NavBrandHeader
        title="Cooperative Federation"
        badgeText="CF"
        subtitle="Operations & Management"
        badgeClassName="bg-blue-600 text-white"
      />

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto">
        <DesktopNavLinks
          items={navItems}
          variant="blue"
          onItemClick={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Admin User Card & Sign Out */}
      <UserNavFooter
        name={getTranslatedPersonName(t, user?.name || 'Federation administrator')}
        subtitle={t('federation.nav.apexAuthority', { defaultValue: 'Federation Admin' })}
        onLogout={handleLogout}
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex antialiased selection:bg-blue-500/20">
      {/* Desktop Fixed Sidebar (>= 1024px) */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer ( < 1024px ) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full">
            <div className="absolute top-2 right-2 z-10">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-md bg-white text-slate-500 hover:text-slate-900 border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        {/* Top Header - Sticky Minimal Bar */}
        <header className="sticky top-0 z-20 h-14 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-500">
              <Link
                to="/federation"
                className="hover:text-slate-900 transition-colors font-medium"
              >
                Federation
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-900 font-semibold truncate">
                {currentNav ? t(currentNav.labelKey, { defaultValue: currentNav.defaultLabel }) : 'Overview'}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Pending Verification Badge */}
            <Link
              to="/federation/verification"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{pendingCount || 1} Pending</span>
            </Link>

            <div className="h-4 w-px bg-slate-200" />

            <LanguageSelector />
          </div>
        </header>

        {/* Content Container - Consistent Data-dense Padding */}
        <main className="flex-1 p-6 lg:p-8 w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
