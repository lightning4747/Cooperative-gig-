import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { LocationPicker, type SelectedLocation } from '@/components/customer/LocationPicker'
import { useBookingFlow } from '@/hooks/useBookingFlow'

export function LocationPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { booking, updateBooking } = useBookingFlow()

  const handleLocationConfirmed = (loc: SelectedLocation) => {
    updateBooking({
      location: {
        latitude: loc.latitude,
        longitude: loc.longitude,
        formattedAddress: loc.formattedAddress,
        area: loc.area || 'Coimbatore',
      },
    })
    navigate('/customer/booking/confirmation')
  }

  const backRoute =
    booking.categoryId && booking.subserviceId
      ? `/customer/services/${booking.categoryId}/${booking.subserviceId}`
      : '/customer/services'

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          to={backRoute}
          className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-black tracking-tight text-foreground">
            {t('location.title', { defaultValue: 'Select Service Location' })}
          </h1>
        </div>
      </div>

      {/* Location Picker Component */}
      <LocationPicker
        initialLocation={booking.location}
        onLocationSelected={handleLocationConfirmed}
      />
    </div>
  )
}
