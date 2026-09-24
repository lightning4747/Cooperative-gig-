import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Phone,
  MapPin,
  Globe,
  ChevronRight,
  Edit3,
  Bell,
  LogOut,
  FileText,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCustomerProfile } from '@/hooks/useCustomerProfile'
import { cn } from '@/lib/utils'
import { EditProfileModal } from '@/components/customer/EditProfileModal'
import { SavedAddressesModal } from '@/components/customer/SavedAddressesModal'
import { RecentBookingsModal } from '@/components/customer/RecentBookingsModal'
import { getTranslatedPersonName } from '@/lib/serviceTranslation'

interface MenuItem {
  id: string
  title: string
  subtitle: string
  icon: typeof Globe
  isDestructive?: boolean
  badge?: string
  action: () => void
}

export function CustomerProfilePage() {
  const { t } = useTranslation()
  const { user, updateProfile, logout } = useAuth()
  const { profile } = useCustomerProfile()
  const navigate = useNavigate()

  // Modal States
  const [showRecentBookingsModal, setShowRecentBookingsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [userName, setUserName] = useState(user?.name || 'Ravi Kumar')
  const [userPhone, setUserPhone] = useState(user?.phone || '9876543210')

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (updateProfile && user) {
      try {
        await updateProfile(userName, 'en')
      } catch (err) {
        console.error('Failed to update profile on backend', err)
      }
    }
    setShowEditModal(false)
  }

  const menuItems: MenuItem[] = [
    {
      id: 'recent-bookings',
      title: t('customer.profile.menu.recentBookings', { defaultValue: 'Recent Bookings' }),
      subtitle: t('customer.profile.menu.recentBookingsSub', {
        defaultValue: 'Task history and receipts',
      }),
      icon: FileText,
      badge: t('customer.profile.menu.invoices', { defaultValue: 'Invoices' }),
      action: () => setShowRecentBookingsModal(true),
    },
    {
      id: 'addresses',
      title: t('customer.profile.menu.addresses', { defaultValue: 'Saved Addresses' }),
      subtitle: t('customer.profile.menu.addressesSub', { defaultValue: 'Manage home & delivery points' }),
      icon: MapPin,
      badge: t('customer.profile.menu.savedCount', {
        count: profile?.savedAddresses?.length || 2,
        defaultValue: `${profile?.savedAddresses?.length || 2} Saved`,
      }),
      action: () => setShowAddressModal(true),
    },
    {
      id: 'notifications',
      title: t('customer.profile.menu.notifications', { defaultValue: 'Notifications' }),
      subtitle: t('customer.profile.menu.notificationsSub', { defaultValue: 'Service alerts and updates' }),
      icon: Bell,
      badge: t('customer.profile.menu.notificationsEnabled', { defaultValue: 'Enabled' }),
      action: () => {
        alert(
          t('customer.profile.menu.notificationsAlert', {
            defaultValue: 'Doorstep dispatch alerts and mutual OTP notifications are enabled.',
          })
        )
      },
    },

    {
      id: 'logout',
      title: t('customer.profile.menu.logout', { defaultValue: 'Logout' }),
      subtitle: t('customer.profile.menu.logoutSub', { defaultValue: 'Sign out of your session' }),
      icon: LogOut,
      isDestructive: true,
      action: handleLogout,
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-5 max-w-xl mx-auto pb-6">
      {/* Top Header Title */}
      <div className="flex items-center justify-between pb-1 border-b border-border/40">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            {t('nav.profile', { defaultValue: 'Profile & Settings' })}
          </h1>
        </div>
      </div>

      {/* Component 1: User Identification Card */}
      <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-xs relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            {/* 64x64 Avatar Placeholder */}
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black text-xl shrink-0 shadow-2xs">
              {userName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase() || 'PS'}
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground truncate">
                  {getTranslatedPersonName(t, userName)}
                </h2>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>{userPhone}</span>
              </div>
            </div>
          </div>

          {/* Edit Profile Action Button */}
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-secondary/60 hover:bg-muted text-xs font-semibold text-foreground transition-all shrink-0 active:scale-95 shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-primary" />
            <span className="hidden xs:inline">
              {t('customer.profile.editProfile', { defaultValue: 'Edit Profile' })}
            </span>
          </button>
        </div>
      </div>

      {/* Component 2: Cooperative Patronage Widget */}
      <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              {t('customer.profile.patronageTitle', { defaultValue: 'Cooperative Patronage' })}
            </span>
          </div>
        </div>

        {/* Two-Column Impact Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-secondary/40 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              {t('customer.profile.gigsSupported', { defaultValue: 'Gigs Supported' })}
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground">
              14
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-secondary/40 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              {t('customer.profile.fairWages', { defaultValue: 'Fair Wages Transferred' })}
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-primary">
              ₹9,450
            </div>
          </div>
        </div>
      </div>

      {/* Component 3: Navigation Menu List */}
      <div className="rounded-2xl border border-border bg-card shadow-xs divide-y divide-border/60 overflow-hidden">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isDestructive = item.isDestructive

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className={cn(
                'w-full p-3.5 sm:p-4 text-left flex items-center justify-between transition-colors group select-none min-h-[58px]',
                isDestructive
                  ? 'hover:bg-destructive/10 text-destructive'
                  : 'hover:bg-muted/50 text-foreground'
              )}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1 mr-2">
                {/* Leading icon inside rounded container */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105',
                    isDestructive
                      ? 'bg-destructive/10 border-destructive/25 text-destructive'
                      : 'bg-secondary/90 border-border text-foreground'
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                </div>

                <div className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'text-xs sm:text-sm font-bold block truncate leading-tight',
                      isDestructive ? 'text-destructive' : 'text-foreground'
                    )}
                  >
                    {item.title}
                  </span>
                  <span
                    className={cn(
                      'text-xs block mt-0.5 truncate leading-tight',
                      isDestructive ? 'text-destructive/70 font-semibold' : 'text-muted-foreground'
                    )}
                  >
                    {item.subtitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.badge && !isDestructive && (
                  <span className="text-[11px] font-semibold text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-lg border border-border/60 hidden xs:inline">
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  className={cn(
                    'w-4 h-4 transition-transform group-hover:translate-x-0.5',
                    isDestructive ? 'text-destructive/60' : 'text-muted-foreground'
                  )}
                />
              </div>
            </button>
          )
        })}
      </div>

      {/* Component 4: Footer Metadata */}
      <footer className="text-center py-4 text-muted-foreground/80">
        <p className="text-xs font-mono font-bold tracking-tight text-foreground/80">
          {t('customer.profile.clientVersion', { defaultValue: 'Cooperative Gig Services Platform v1.0.4' })}
        </p>
      </footer>

      {/* Modals */}

      <EditProfileModal
        isOpen={showEditModal}
        name={userName}
        phone={userPhone}
        onNameChange={setUserName}
        onPhoneChange={setUserPhone}
        onSave={handleSaveProfile}
        onClose={() => setShowEditModal(false)}
      />

      <SavedAddressesModal
        isOpen={showAddressModal}
        addresses={profile?.savedAddresses}
        onClose={() => setShowAddressModal(false)}
      />

      <RecentBookingsModal
        isOpen={showRecentBookingsModal}
        onClose={() => setShowRecentBookingsModal(false)}
      />
    </div>
  )
}
