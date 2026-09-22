import { useTranslation } from 'react-i18next'
import {
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  ArrowRight,
  Loader2,
  Wrench,
} from 'lucide-react'
import type { BookingType } from '@/types/job'
import { formatCurrency } from '@/lib/utils'
import { getTranslatedCategoryName, getTranslatedSubserviceName } from '@/lib/serviceTranslation'

export interface BookingSummaryData {
  categoryId: string
  categoryName: string
  subserviceId: string
  subserviceName: string
  bookingType: BookingType
  basePrice: number
  scheduledAt?: string
  location: {
    latitude: number
    longitude: number
    formattedAddress: string
    area?: string
  }
}

interface BookingConfirmationProps {
  booking: BookingSummaryData
  onConfirm: () => void
  isSubmitting?: boolean
  onBack?: () => void
  className?: string
}

export function BookingConfirmation({
  booking,
  onConfirm,
  isSubmitting = false,
  className,
}: BookingConfirmationProps) {
  const { t } = useTranslation()

  const surplus =
    booking.bookingType === 'EMERGENCY'
      ? 250
      : booking.bookingType === 'ON_DEMAND'
      ? 150
      : 100
  const totalPayable = booking.basePrice + surplus

  const getBookingTypeBadge = (type: BookingType) => {
    switch (type) {
      case 'EMERGENCY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-destructive/15 text-destructive text-xs font-bold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{t('booking.emergencyTitle', { defaultValue: 'Emergency Priority' })}</span>
          </span>
        )
      case 'ON_DEMAND':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary-foreground text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{t('booking.onDemandTitle', { defaultValue: 'On-Demand' })}</span>
          </span>
        )
      case 'STANDARD':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-foreground text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>{t('booking.standardTitle', { defaultValue: 'Standard Scheduled' })}</span>
          </span>
        )
    }
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Booking Details Card */}
      <div className="rounded-xl border border-border border-l-4 border-l-amber-500 bg-card p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                {getTranslatedCategoryName(t, booking.categoryId, booking.categoryName)}
              </span>
              <h3 className="text-base font-black text-foreground">
                {getTranslatedSubserviceName(t, booking.subserviceId, booking.subserviceName)}
              </h3>
            </div>
          </div>
          {getBookingTypeBadge(booking.bookingType)}
        </div>

        <dl className="grid grid-cols-1 gap-2.5 text-xs">
          {/* Schedule Date & Time if standard */}
          {booking.bookingType === 'STANDARD' && (
            <div className="flex items-start justify-between py-1.5 border-b border-border/40">
              <dt className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{t('booking.dateTimeLabel', { defaultValue: 'Scheduled Slot' })}</span>
              </dt>
              <dd className="font-semibold text-foreground text-right">
                {booking.scheduledAt
                  ? new Date(booking.scheduledAt).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : 'Earliest Available (Today, 4:00 PM)'}
              </dd>
            </div>
          )}

          {/* Location */}
          <div className="flex items-start justify-between py-1.5 border-b border-border/40">
            <dt className="text-muted-foreground flex items-center gap-1.5 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{t('booking.locationLabel', { defaultValue: 'Service Location' })}</span>
            </dt>
            <dd className="font-medium text-foreground text-right pl-4 max-w-[220px] break-words">
              Ravi kumar 44/1 Bharat Apartment, 4C5th Main, Jayanagar Bengaluru
            </dd>
          </div>


          {/* Total Customer Payable */}
          <div className="flex items-center justify-between py-2 border-t border-border font-bold">
            <dt className="text-foreground text-sm">
              {t('booking.totalPayableLabel', { defaultValue: 'Total Amount' })}
            </dt>
            <dd className="font-mono font-black text-amber-600 dark:text-amber-400 text-base">
              {formatCurrency(totalPayable)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Ethical Cooperative Guarantee Banner */}


      {/* Confirm CTA */}
      <button
        type="button"
        onClick={onConfirm}
        disabled={isSubmitting}
        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-xs transition-all disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{t('booking.submitting', { defaultValue: 'Confirming Cooperative Dispatch...' })}</span>
          </>
        ) : (
          <>
            <span>{t('booking.confirmCTA', { defaultValue: 'Confirm Booking' })}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  )
}
