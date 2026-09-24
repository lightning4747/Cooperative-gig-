import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Calendar,
  Clock,
  Wrench,
  KeyRound,
  FileText,
  Star,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useJobs } from '@/hooks/useJob'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  getTranslatedCategoryName,
  getTranslatedSubserviceName,
  getTranslatedPersonName,
} from '@/lib/serviceTranslation'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Job, JobStatus } from '@/types/job'

type FilterType = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

const ACTIVE_STATUSES: JobStatus[] = [
  'SEARCHING',
  'BROADCAST',
  'OFFERED',
  'ACCEPTED',
  'TRAVELLING',
  'ARRIVED',
  'IN_PROGRESS',
]

export function CustomerBookingsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL')

  const { data: jobs, isLoading, isError, refetch } = useJobs({
    customerId: user?.id,
  })

  // Group and count bookings
  const counts = useMemo(() => {
    const list = jobs || []
    return {
      all: list.length,
      active: list.filter((j) => ACTIVE_STATUSES.includes(j.status)).length,
      completed: list.filter((j) => j.status === 'COMPLETED').length,
      cancelled: list.filter((j) => ['CANCELLED', 'EXPIRED'].includes(j.status)).length,
    }
  }, [jobs])

  // Filtered list
  const filteredBookings = useMemo(() => {
    const list = jobs || []
    if (activeFilter === 'ACTIVE') {
      return list.filter((j) => ACTIVE_STATUSES.includes(j.status))
    }
    if (activeFilter === 'COMPLETED') {
      return list.filter((j) => j.status === 'COMPLETED')
    }
    if (activeFilter === 'CANCELLED') {
      return list.filter((j) => ['CANCELLED', 'EXPIRED'].includes(j.status))
    }
    return list
  }, [jobs, activeFilter])

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            {t('customer.myBookingsTitle', { defaultValue: 'My Bookings' })}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('customer.myBookingsSubtitle', {
              defaultValue: 'Track active requests, review past services, and access verified digital invoices.',
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold inline-flex items-center gap-1.5"
            title="Refresh Bookings"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('common.loading', { defaultValue: 'Refresh' })}</span>
          </button>
          <Link
            to="/customer"
            className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary/90 transition-all"
          >
            {t('customer.exploreServices', { defaultValue: 'Explore Services' })}
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
        <button
          type="button"
          onClick={() => setActiveFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
            activeFilter === 'ALL'
              ? 'bg-primary text-primary-foreground border-primary font-bold shadow-2xs'
              : 'bg-card border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('customer.filterAll', { defaultValue: 'All' })} ({counts.all})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('ACTIVE')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
            activeFilter === 'ACTIVE'
              ? 'bg-primary text-primary-foreground border-primary font-bold shadow-2xs'
              : 'bg-card border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('customer.filterActive', { defaultValue: 'Active' })} ({counts.active})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('COMPLETED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
            activeFilter === 'COMPLETED'
              ? 'bg-primary text-primary-foreground border-primary font-bold shadow-2xs'
              : 'bg-card border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('customer.filterCompleted', { defaultValue: 'Completed' })} ({counts.completed})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('CANCELLED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
            activeFilter === 'CANCELLED'
              ? 'bg-primary text-primary-foreground border-primary font-bold shadow-2xs'
              : 'bg-card border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('customer.filterCancelled', { defaultValue: 'Cancelled' })} ({counts.cancelled})
        </button>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="py-16 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : isError ? (
        <div className="p-8 rounded-2xl border border-destructive/30 bg-destructive/10 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <p className="text-xs text-destructive font-semibold">
            {t('common.error', { defaultValue: 'Failed to load bookings. Please check your connection.' })}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold"
          >
            Retry
          </button>
        </div>
      ) : filteredBookings.length === 0 ? (
        /* Empty State */
        <div className="p-12 rounded-2xl border border-border bg-card text-center space-y-4 max-w-md mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-secondary text-muted-foreground flex items-center justify-center mx-auto border border-border/80">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              {t('customer.noBookingsTitle', { defaultValue: 'No Bookings Found' })}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('customer.noBookingsDesc', { defaultValue: 'You do not have any bookings under this filter.' })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/customer')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all"
          >
            <span>{t('customer.exploreServices', { defaultValue: 'Explore Services' })}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Bookings List */
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  )
}

function BookingCard({ booking }: { booking: Job }) {
  const { t } = useTranslation()
  const isArrived = booking.status === 'ARRIVED'
  const isCompleted = booking.status === 'COMPLETED'
  const categoryTitle = getTranslatedCategoryName(
    t,
    booking.serviceCategoryId,
    booking.serviceCategoryName
  )
  const subserviceTitle = getTranslatedSubserviceName(
    t,
    booking.subserviceId,
    booking.subserviceName
  )

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border bg-card transition-all shadow-xs space-y-4 ${
        isArrived
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-border hover:border-border/90'
      }`}
    >
      {/* Top Row: Service & Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase">
              {categoryTitle}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-black text-foreground truncate">
            {subserviceTitle}
          </h3>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Details Row: Time, Worker, Amount */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/60 text-xs">
        {/* Schedule / Time */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {booking.scheduledAt ? formatDate(booking.scheduledAt) : formatDate(booking.createdAt)}
          </span>
        </div>

        {/* Assigned Worker */}
        <div className="flex items-center gap-2 text-foreground font-medium">
          <Wrench className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {booking.workerName
              ? `${t('customer.technician', { defaultValue: 'Technician' })}: ${getTranslatedPersonName(t, booking.workerName)}`
              : t('job.status.searching', { defaultValue: 'Assigning Worker...' })}
          </span>
        </div>

        {/* Amount */}
        <div className="sm:text-right">
          <span className="font-mono font-black text-sm text-foreground">
            {formatCurrency(booking.grossAmount || booking.basePrice || 450)}
          </span>

        </div>
      </div>

      {/* Arrived State: Doorstep Mutual OTP Alert Card */}
      {isArrived && (
        <div className="p-3.5 rounded-xl border border-primary/40 bg-primary/10 space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs">
            <KeyRound className="w-4 h-4 shrink-0" />
            <span>{t('customer.workerArrivedOtpNotice', { defaultValue: 'Worker Arrived — Doorstep OTP' })}</span>
          </div>
          <p className="text-[11px] text-foreground/80 leading-relaxed">
            {t('customer.doorstepOtpPrompt', {
              defaultValue: 'Share this mutual verification OTP with the cooperative worker to start the job:',
            })}
          </p>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-background border border-primary font-mono text-base font-black tracking-widest text-primary shadow-2xs">
              {booking.otp || '123456'}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              Single-use mutual security code
            </span>
          </div>
        </div>
      )}

      {/* Card Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
        <div className="flex items-center gap-2">
          {isCompleted && (
            <>
              <Link
                to={`/customer/jobs/${booking.id}/invoice`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-foreground transition-colors font-semibold"
              >
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>{t('customer.viewInvoice', { defaultValue: 'Invoice' })}</span>
              </Link>
              <Link
                to={`/customer/jobs/${booking.id}/rating`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-foreground transition-colors font-semibold"
              >
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('customer.rateWorker', { defaultValue: 'Rate Service' })}</span>
              </Link>
            </>
          )}
        </div>

        <Link
          to={`/customer/jobs/${booking.id}/tracking`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-colors font-bold ml-auto"
        >
          <span>{t('customer.trackStatus', { defaultValue: 'Track Booking' })}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
