import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { BookingConfirmation, type BookingSummaryData } from '@/components/customer/BookingConfirmation'
import { useBookingFlow } from '@/hooks/useBookingFlow'
import { useAuth } from '@/hooks/useAuth'

export function ConfirmationPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { booking, confirmBooking, isSubmitting } = useBookingFlow()

  // Guard: if incomplete, provide graceful fallback data or link to services
  const isComplete =
    !!booking.categoryId &&
    !!booking.subserviceId &&
    !!booking.basePrice &&
    !!booking.location

  // Fallback defaults for prototype continuity if visited directly
  const bookingSummary: BookingSummaryData = {
    categoryId: booking.categoryId || 'cat-plumbing',
    categoryName: booking.categoryName || 'Plumbing',
    subserviceId: booking.subserviceId || 'sub-plumb-01',
    subserviceName: booking.subserviceName || 'Pipe leakage repair',
    bookingType: booking.bookingType || 'ON_DEMAND',
    basePrice: booking.basePrice || 500,
    scheduledAt: booking.scheduledAt,
    location: booking.location || {
      latitude: 12.9279,
      longitude: 77.6718,
      formattedAddress: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103',
      area: 'Bellandur',
    },
  }

  const handleFinalConfirm = async () => {
    try {
      const customerId = user?.id || 'cust-priya-sharma'
      await confirmBooking(customerId)
    } catch (err) {
      console.error('Failed to create job:', err)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        backTo="/customer/booking/location"
        title={t('booking.step3Title', { defaultValue: 'Review & Confirm Booking' })}
      />

      {!isComplete && (
        <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            Pre-filling verified prototype defaults. You can proceed directly or{' '}
            <button
              type="button"
              onClick={() => navigate('/customer/services')}
              className="underline font-bold"
            >
              browse services here
            </button>
            .
          </span>
        </div>
      )}

      {/* Booking Confirmation Card */}
      <BookingConfirmation
        booking={bookingSummary}
        onConfirm={handleFinalConfirm}
        isSubmitting={isSubmitting}
        onBack={() => navigate('/customer/booking/location')}
      />
    </div>
  )
}
