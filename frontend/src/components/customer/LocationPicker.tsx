import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Navigation, MapPin, CheckCircle2, Building2, Home } from 'lucide-react'
import { MapView } from '@/components/shared/MapView'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

export interface SelectedLocation {
  latitude: number
  longitude: number
  formattedAddress: string
  area?: string
}

interface LocationPickerProps {
  initialLocation?: SelectedLocation
  onLocationSelected: (loc: SelectedLocation) => void
  className?: string
}

// Preset verified Bengaluru cooperative service hubs & mock customer locations
const PRESET_LOCATIONS: SelectedLocation[] = [
  {
    latitude: 12.9279,
    longitude: 77.6718,
    formattedAddress: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103',
    area: 'Bellandur',
  },
  {
    latitude: 12.9258,
    longitude: 77.6834,
    formattedAddress: 'EcoSpace Business Park, Outer Ring Road, Bengaluru 560103',
    area: 'Outer Ring Road',
  },
  {
    latitude: 12.9719,
    longitude: 77.6412,
    formattedAddress: '12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
    area: 'Indiranagar',
  },
  {
    latitude: 12.9352,
    longitude: 77.6245,
    formattedAddress: '80 Feet Road, 4th Block, Koramangala, Bengaluru 560034',
    area: 'Koramangala',
  },
  {
    latitude: 12.9141,
    longitude: 77.6109,
    formattedAddress: '15th Cross, 3rd Phase, JP Nagar, Bengaluru 560078',
    area: 'JP Nagar',
  },
]

export function LocationPicker({
  initialLocation,
  onLocationSelected,
  className,
}: LocationPickerProps) {
  const { t } = useTranslation()
  const defaultLoc = initialLocation || PRESET_LOCATIONS[0]

  const [currentLocation, setCurrentLocation] = useState<SelectedLocation>(defaultLoc)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [showPresets, setShowPresets] = useState(false)

  // Filtered recommendations
  const filteredPresets = PRESET_LOCATIONS.filter((item) =>
    item.formattedAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.area?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert(t('location.noGeolocation', { defaultValue: 'Geolocation is not supported by your browser.' }))
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false)
        const gpsLoc: SelectedLocation = {
          latitude: Number(pos.coords.latitude.toFixed(4)),
          longitude: Number(pos.coords.longitude.toFixed(4)),
          formattedAddress: `Current GPS Location (${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E)`,
          area: 'Current Area',
        }
        setCurrentLocation(gpsLoc)
        setSearchQuery('')
        setShowPresets(false)
      },
      (err) => {
        setIsLocating(false)
        console.warn('Geolocation error:', err.message)
        // Gracefully fallback to default preset
        setCurrentLocation(PRESET_LOCATIONS[0])
      },
      { timeout: 8000 }
    )
  }

  const handleSelectPreset = (loc: SelectedLocation) => {
    setCurrentLocation(loc)
    setSearchQuery(loc.formattedAddress)
    setShowPresets(false)
  }

  const handleMapLocationChange = (lat: number, lng: number) => {
    const formatted = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`
    setCurrentLocation((prev) => ({
      ...prev,
      latitude: Number(lat.toFixed(4)),
      longitude: Number(lng.toFixed(4)),
      formattedAddress: `Custom Pinned Location (${formatted})`,
      area: prev.area || 'Selected Doorstep',
    }))
  }

  const handleConfirm = () => {
    onLocationSelected(currentLocation)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar & GPS Button */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowPresets(true)
            }}
            onFocus={() => setShowPresets(true)}
            placeholder={t('location.searchPlaceholder', {
              defaultValue: 'Search area, society or street address...',
            })}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-xs"
          />
        </div>

        {/* GPS Quick Action */}
        <button
          type="button"
          onClick={handleUseGPS}
          disabled={isLocating}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted/40 text-xs font-semibold text-foreground transition-colors min-h-[40px]"
        >
          <Navigation className={cn('w-3.5 h-3.5 text-primary', isLocating && 'animate-spin')} />
          <span>
            {isLocating
              ? t('location.locating', { defaultValue: 'Detecting precise coordinates...' })
              : t('location.useCurrent', { defaultValue: 'Use My Current GPS Location' })}
          </span>
        </button>

        {/* Search Results Dropdown */}
        {showPresets && filteredPresets.length > 0 && (
          <div className="rounded-xl border border-border bg-card shadow-md divide-y divide-border overflow-hidden">
            {filteredPresets.map((loc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(loc)}
                className="w-full text-left p-3 hover:bg-muted/50 transition-colors flex items-start gap-2.5"
              >
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-foreground truncate">{loc.area}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{loc.formattedAddress}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Map View */}
      <div className="space-y-1.5">
        <div className="overflow-hidden rounded-xl border border-border shadow-xs">
          <MapView
            latitude={currentLocation.latitude}
            longitude={currentLocation.longitude}
            label={currentLocation.area || 'Service Destination'}
            className="h-[280px]"
            zoom={15}
            interactive
            onLocationChange={handleMapLocationChange}
          />
        </div>
        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 px-1">
          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Click on the map or drag the pin to set your exact doorstep</span>
        </p>
      </div>

      {/* Saved Address Shortcuts */}
      {(() => {
        const user = useAuthStore.getState().user
        const key = user?.id ? `customer_addresses_${user.id}` : 'customer_addresses'
        let savedAddrs: Array<{ id: string; label: string; formattedAddress: string; latitude: number; longitude: number }> = []
        try {
          const raw = localStorage.getItem(key)
          if (raw) savedAddrs = JSON.parse(raw)
        } catch {}

        if (savedAddrs.length === 0) return null

        return (
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-foreground">
              {t('location.savedShortcuts', { defaultValue: 'Saved Addresses' })}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {savedAddrs.map((addr) => {
                const isSelected = currentLocation.formattedAddress === addr.formattedAddress
                return (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() =>
                      handleSelectPreset({
                        latitude: addr.latitude,
                        longitude: addr.longitude,
                        formattedAddress: addr.formattedAddress,
                        area: addr.label,
                      })
                    }
                    className={cn(
                      'p-2.5 rounded-xl border text-left transition-all flex items-center gap-2',
                      isSelected
                        ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                        : 'border-border bg-card hover:bg-muted/40'
                    )}
                  >
                    <div className="p-1.5 rounded-lg bg-muted text-muted-foreground shrink-0">
                      {addr.label === 'Home' ? (
                        <Home className="w-3.5 h-3.5" />
                      ) : (
                        <Building2 className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-foreground block truncate">
                        {addr.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground block truncate">
                        {addr.formattedAddress}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* Selected Address Confirmation Banner & CTA */}
      <div className="p-4 rounded-xl border border-primary/40 bg-primary/5 space-y-3">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-0.5 min-w-0 flex-1">
            <span className="text-xs font-bold text-foreground block">
              {t('location.confirmedHeader', { defaultValue: 'Confirmed Service Location' })}
            </span>
            <p className="text-xs text-foreground/80 leading-relaxed break-words font-medium">
              {currentLocation.formattedAddress}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
        >
          <span>{t('location.confirmCTA', { defaultValue: 'Confirm Location & Continue' })}</span>
        </button>
      </div>
    </div>
  )
}
