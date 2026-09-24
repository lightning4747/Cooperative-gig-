import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Search,
  ArrowRight,
  MapPin,
  X,
  Check,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useJobs, useJobPolling } from '@/hooks/useJob'
import { useServiceCatalog } from '@/hooks/useServiceCatalog'
import { useCustomerProfile } from '@/hooks/useCustomerProfile'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ServiceCategoryCard } from '@/components/shared/ServiceCategoryCard'
import {
  getTranslatedCategoryName,
  getTranslatedSubserviceName,
  getCategorySubTasks,
} from '@/lib/serviceTranslation'
import { formatCurrency } from '@/lib/utils'
import type { ServiceCategory } from '@/types/service'

const ORDERED_CATEGORY_CODES = [
  'plumbing',
  'electrical',
  'carpentry',
  'painting',
  'domestic_help',
  'caregiving',
  'driving',
  'gardening',
  'cleaning',
  'technician',
]

interface PopularService {
  id: string
  subKey: string
  categoryId: string
  categoryCode: string
  name: string
  price: number
  categoryName: string
}

const POPULAR_SERVICES: PopularService[] = [
  {
    id: 'sub-elec-01',
    subKey: 'fan_repair',
    categoryId: 'cat-electrical',
    categoryCode: 'electrical',
    name: 'Ceiling Fan Installation & Repair',
    price: 350,
    categoryName: 'Electrical',
  },
  {
    id: 'sub-plumb-01',
    subKey: 'pipe_leakage',
    categoryId: 'cat-plumbing',
    categoryCode: 'plumbing',
    name: 'Tap Leakage & Pipe Repair',
    price: 300,
    categoryName: 'Plumbing',
  },
  {
    id: 'sub-elec-02',
    subKey: 'switchboard_repair',
    categoryId: 'cat-electrical',
    categoryCode: 'electrical',
    name: 'Switchboard & Fuse Repair',
    price: 300,
    categoryName: 'Electrical',
  },
  {
    id: 'sub-clean-01',
    subKey: 'deep_cleaning',
    categoryId: 'cat-cleaning',
    categoryCode: 'cleaning',
    name: 'Full House Deep Cleaning',
    price: 1200,
    categoryName: 'Cleaning',
  },
  {
    id: 'sub-plumb-02',
    subKey: 'drain_blockage',
    categoryId: 'cat-plumbing',
    categoryCode: 'plumbing',
    name: 'Drainage & Sink Clog Removal',
    price: 450,
    categoryName: 'Plumbing',
  },
]

const DEFAULT_LOCATIONS = [
  'Gandhipuram, Coimbatore',
  'RS Puram, Coimbatore',
  'Peelamedu, Coimbatore',
  'Saibaba Colony, Coimbatore',
  'Ramanathapuram, Coimbatore',
]

export function CustomerHome() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { categories } = useServiceCatalog()
  const { profile } = useCustomerProfile()

  const [searchQuery, setSearchQuery] = useState('')
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<string>(() => {
    return (
      localStorage.getItem('cooperative_selected_location') ||
      profile?.savedAddresses?.[0]?.formattedAddress ||
      'Gandhipuram, Coimbatore'
    )
  })

  // Fetch customer jobs
  const { data: allJobs } = useJobs({ customerId: user?.id })

  // Active non-completed job (most recent)
  const activeJobSummary = allJobs?.find(
    (j) => j.status !== 'COMPLETED' && j.status !== 'CANCELLED' && j.status !== 'EXPIRED'
  )

  // Poll the active job every 5 seconds for real-time tracking
  const { data: activeJob } = useJobPolling(activeJobSummary?.id, 5000)
  const currentActiveJob = activeJob || activeJobSummary

  // Sort and filter the categories
  const sortedCategories = useMemo(() => {
    const sorted = [...categories].sort((a, b) => {
      const codeA = (a.code || a.name || '').toLowerCase().replace(/[\s-]/g, '_')
      const codeB = (b.code || b.name || '').toLowerCase().replace(/[\s-]/g, '_')
      const idxA = ORDERED_CATEGORY_CODES.indexOf(codeA)
      const idxB = ORDERED_CATEGORY_CODES.indexOf(codeB)
      return (idxA >= 0 ? idxA : 99) - (idxB >= 0 ? idxB : 99)
    })

    if (!searchQuery.trim()) {
      return sorted.slice(0, 10)
    }

    const q = searchQuery.toLowerCase().trim()
    return sorted.filter((cat) => {
      const name = getTranslatedCategoryName(t, cat.id, cat.name).toLowerCase()
      const subTasks = getCategorySubTasks(cat.id || cat.code).toLowerCase()
      const matchesSubservices = cat.subservices?.some((s) =>
        s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
      )
      return name.includes(q) || subTasks.includes(q) || matchesSubservices
    })
  }, [categories, searchQuery, t])

  // Matching subservices for search dropdown
  const matchingSubservices = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase().trim()
    const matches: { subId: string; subName: string; catId: string; catName: string; price: number }[] = []

    categories.forEach((cat) => {
      cat.subservices?.forEach((sub) => {
        if (
          sub.name.toLowerCase().includes(q) ||
          sub.description?.toLowerCase().includes(q) ||
          cat.name.toLowerCase().includes(q)
        ) {
          matches.push({
            subId: sub.id,
            subName: sub.name,
            catId: cat.id,
            catName: cat.name,
            price: sub.basePrice,
          })
        }
      })
    })
    return matches.slice(0, 6)
  }, [categories, searchQuery])

  const handleSelectCategory = (cat: ServiceCategory) => {
    navigate(`/customer/services/${cat.id}`)
  }

  const handleSelectLocation = (loc: string) => {
    setSelectedLocation(loc)
    localStorage.setItem('cooperative_selected_location', loc)
    setIsLocationModalOpen(false)
  }

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* 1. Location Bar Header (From old app) */}
      <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              {t('customer.serviceLocation', { defaultValue: 'Service Location' })}
            </span>
            <span className="block text-xs sm:text-sm font-bold text-foreground truncate">
              {selectedLocation}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsLocationModalOpen(true)}
          className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-primary transition-colors shrink-0"
        >
          {t('customer.changeLocation', { defaultValue: 'Change' })}
        </button>
      </div>

      {/* 2. Hero Header */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
          {t('customer.needServiceTitle', { defaultValue: 'Need a Service?' })}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
          {t('customer.heroSubtitle', {
            defaultValue:
              'Book verified cooperative workers for household and institutional services at fair prices.',
          })}
        </p>
      </div>

      {/* 3. Full-Width Search Input */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('services.searchPlaceholder', {
            defaultValue: 'Search for services (e.g. pipe leak, fan repair, deep cleaning)...',
          })}
          className="w-full pl-10 pr-10 py-3 rounded-2xl border border-input bg-card text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Live Search Results Dropdown */}
        {searchQuery.trim().length > 0 && matchingSubservices.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 p-2 rounded-2xl bg-card border border-border shadow-lg z-30 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-1 block">
              Matching Services ({matchingSubservices.length})
            </span>
            {matchingSubservices.map((item) => (
              <button
                key={item.subId}
                type="button"
                onClick={() => navigate(`/customer/services/${item.catId}/${item.subId}`)}
                className="w-full p-2.5 rounded-xl hover:bg-muted/70 flex items-center justify-between text-left transition-colors text-xs"
              >
                <div>
                  <span className="font-bold text-foreground block">{item.subName}</span>
                  <span className="text-[11px] text-muted-foreground">{item.catName}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-foreground block">{formatCurrency(item.price)}</span>
                  <span className="text-[10px] text-primary font-semibold">Book Now →</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Active In-Flight Booking Alert (Clean Minimal Card) */}
      {currentActiveJob && (
        <section className="rounded-xl border border-border bg-card p-3.5 sm:p-4 shadow-2xs space-y-2.5 transition-colors">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                {getTranslatedCategoryName(
                  t,
                  currentActiveJob.serviceCategoryId,
                  currentActiveJob.serviceCategoryName
                )}{' '}
                ·{' '}
                {getTranslatedSubserviceName(
                  t,
                  currentActiveJob.subserviceId,
                  currentActiveJob.subserviceName
                )}
              </h3>
            </div>
            <StatusBadge status={currentActiveJob.status} />
          </div>

          {/* Arrived OTP Reminder */}
          {currentActiveJob.status === 'ARRIVED' && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2 text-xs">
              <span className="text-amber-900 dark:text-amber-200 font-medium">
                {t('customer.doorstepOtpPrompt', { defaultValue: 'Worker at doorstep. Share OTP:' })}
              </span>
              <span className="px-2 py-0.5 rounded bg-background border border-border font-mono font-bold text-xs">
                {currentActiveJob.otp || '123456'}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
            <span className="truncate">
              {currentActiveJob.isEmergency
                ? t('customer.emergencyPriority', { defaultValue: 'Emergency Priority' })
                : t('customer.standardDelivery', { defaultValue: 'Standard Delivery' })}
            </span>
            <Link
              to={`/customer/jobs/${currentActiveJob.id}/tracking`}
              className="font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1 shrink-0 ml-2"
            >
              {t('customer.trackStatus', { defaultValue: 'Track Status' })} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </section>
      )}

      {/* 5. Urgent Emergency Assistance Banner (Clean, Minimal, Professional) */}
      <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-0.5 min-w-0">
            <h3 className="text-sm font-bold text-foreground">
              {t('customer.urgentHelpTitle', { defaultValue: 'Emergency Assistance' })}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('customer.urgentHelpSubtitle', {
                defaultValue:
                  '24x7 priority broadcast dispatch for water leaks, electrical short circuits & emergency repairs.',
              })}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/customer/services/cat-plumbing')}
            className="px-4 py-2 rounded-lg bg-foreground text-background hover:bg-foreground/90 font-semibold text-xs transition-colors inline-flex items-center justify-center shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <span>{t('customer.urgentHelpBtn', { defaultValue: 'Request Emergency Help' })}</span>
          </button>
        </div>
      </section>

      {/* 6. Popular Services (With 100% Subservice Translation) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
              {t('customer.popularServicesTitle', { defaultValue: 'Popular Services' })}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t('customer.popularServicesSubtitle', {
                defaultValue: 'Frequently requested household services with transparent cooperative pricing',
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {POPULAR_SERVICES.map((item) => {
            const localizedCategory = t(`services.category.${item.categoryCode}`, {
              defaultValue: item.categoryName,
            })
            const localizedName = t(`services.sub.${item.subKey}`, {
              defaultValue: item.name,
            })

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(`/customer/services/${item.categoryId}/${item.id}`)}
                className="p-3 rounded-xl border border-border bg-card hover:border-border/80 text-left transition-all shadow-2xs flex flex-col justify-between group cursor-pointer"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block truncate">
                    {localizedCategory}
                  </span>
                  <h4 className="text-xs font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {localizedName}
                  </h4>
                </div>
                <div className="pt-2 mt-2 border-t border-border/50 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-foreground">{formatCurrency(item.price)}</span>
                  <span className="text-[11px] font-semibold text-primary">Book →</span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* 7. Cooperative Service Categories Grid (With Rich Visual Images) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
            {searchQuery
              ? `${sortedCategories.length} Results`
              : t('customer.serviceCategoriesTitle', { defaultValue: 'Service Categories' })}
          </h2>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-primary hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* Responsive Grid of Visual Touch-Friendly Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {sortedCategories.map((category) => (
            <ServiceCategoryCard
              key={category.id}
              category={category}
              onClick={() => handleSelectCategory(category)}
            />
          ))}
        </div>
      </section>

      {/* Location Picker Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">
                  {t('customer.selectLocation', { defaultValue: 'Select Service Location' })}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {DEFAULT_LOCATIONS.map((loc) => {
                const isSelected = selectedLocation === loc
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleSelectLocation(loc)}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <span>{loc}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
