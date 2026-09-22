import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react'
import { useServiceCatalog } from '@/hooks/useServiceCatalog'
import { BookingTypeSelector } from '@/components/customer/BookingTypeSelector'
import { useBookingFlow } from '@/hooks/useBookingFlow'
import { getTranslatedCategoryName, getTranslatedSubserviceName } from '@/lib/serviceTranslation'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import type { BookingType } from '@/types/job'

export function BookingPage() {
  const { t } = useTranslation()
  const { categoryId, serviceId } = useParams<{ categoryId: string; serviceId: string }>()
  const navigate = useNavigate()
  const { booking, updateBooking } = useBookingFlow()
  const { categories, getCategoryById, getSubserviceById, isLoading } = useServiceCatalog()

  const [bookingType, setBookingType] = useState<BookingType>(
    booking.bookingType || 'ON_DEMAND'
  )
  const [scheduledDate, setScheduledDate] = useState<string>(() =>
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  )
  const [scheduledTime, setScheduledTime] = useState<string>('10:00')

  if (isLoading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>
    )
  }

  const category = (categoryId ? getCategoryById(categoryId) : undefined) || categories[0]
  const subservice =
    (categoryId && serviceId ? getSubserviceById(categoryId, serviceId) : undefined) ||
    category?.subservices?.[0]

  if (!category || !subservice) {
    return (
      <EmptyState
        title={t('booking.serviceNotFound', { defaultValue: 'Service Not Found' })}
        description={t('booking.serviceNotFoundDesc', {
          defaultValue: 'The requested service could not be located in the cooperative catalog.',
        })}
        action={
          <Link
            to="/customer/services"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
          >
            {t('services.backToServices', { defaultValue: 'Back to Service Categories' })}
          </Link>
        }
      />
    )
  }

  const handleProceed = () => {
    const scheduledAt =
      bookingType === 'STANDARD'
        ? new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString()
        : undefined

    updateBooking({
      categoryId: category.id,
      categoryName: category.name,
      subserviceId: subservice.id,
      subserviceName: subservice.name,
      basePrice: subservice.basePrice,
      bookingType,
      scheduledAt,
    })

    navigate('/customer/booking/location')
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          to={`/customer/services/${category.id}`}
          className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-black tracking-tight text-foreground">
            {t('booking.step1Title', { defaultValue: 'Configure Service Booking' })}
          </h1>
        </div>
      </div>

      {/* Selected Subservice Card */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
            {getTranslatedCategoryName(t, category.id, category.name)}
          </span>
          <h2 className="text-base font-bold text-foreground truncate">
            {getTranslatedSubserviceName(t, subservice.id, subservice.name)}
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              ~{subservice.estimatedDurationMinutes} {t('common.mins', { defaultValue: 'mins' })}
            </span>
            <span>•</span>

          </div>
        </div>

      </div>

      {/* Booking Type Selector Component */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-foreground block uppercase tracking-wider">
          {t('booking.selectType', { defaultValue: 'Select Dispatch Type' })}
        </label>
        <BookingTypeSelector
          value={bookingType}
          onChange={setBookingType}
          basePrice={subservice.basePrice}
          emergencySupported={subservice.emergencySupported ?? true}
        />
      </div>

      {/* Date & Time Picker for Standard Scheduled */}
      {bookingType === 'STANDARD' && (
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>{t('booking.scheduleSlot', { defaultValue: 'Scheduled Appointment Slot' })}</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-muted-foreground block mb-1">
                {t('booking.serviceDate', { defaultValue: 'Service Date' })}
              </span>
              <input
                type="date"
                value={scheduledDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block mb-1">
                {t('booking.timeSlot', { defaultValue: 'Time Slot' })}
              </span>
              <select
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="09:00">{t('booking.slots.morning', { defaultValue: '09:00 AM - 11:00 AM' })}</option>
                <option value="11:30">{t('booking.slots.midday', { defaultValue: '11:30 AM - 01:30 PM' })}</option>
                <option value="14:00">{t('booking.slots.afternoon', { defaultValue: '02:00 PM - 04:00 PM' })}</option>
                <option value="16:30">{t('booking.slots.evening', { defaultValue: '04:30 PM - 06:30 PM' })}</option>
                <option value="18:30">{t('booking.slots.night', { defaultValue: '06:30 PM - 08:30 PM' })}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Proceed CTA */}
      <button
        type="button"
        onClick={handleProceed}
        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
      >
        <span>{t('booking.proceedLocation', { defaultValue: 'Proceed to Location Selection' })}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}
