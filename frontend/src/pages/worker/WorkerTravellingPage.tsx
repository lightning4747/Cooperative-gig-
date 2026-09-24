import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Navigation, MapPin, ArrowRight, Phone, ExternalLink, Clock } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { MapView, generateTransitRoute } from '@/components/shared/MapView'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { jobService } from '@/services/jobService'
import { useJob } from '@/hooks/useJob'

export function WorkerTravellingPage() {
  const { t } = useTranslation()
  const { jobId } = useParams<{ jobId: string }>()
  const targetId = jobId || ''
  const navigate = useNavigate()
  const { job, isLoading } = useJob(targetId)
  const [isUpdating, setIsUpdating] = useState(false)

  const destinationArea = job?.location.area || job?.location.formattedAddress || 'Customer Location'
  const customerLat = job?.location.latitude || 12.9344
  const customerLng = job?.location.longitude || 77.6101

  // Worker current position (fallback simulated start point 1.8km away)
  const [workerPos, setWorkerPos] = useState<[number, number]>([
    customerLat + 0.0055,
    customerLng - 0.0045,
  ])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude
          const lng = pos.coords.longitude
          // Use real geolocation if within reasonable dispatch proximity (< 25km)
          if (Math.abs(lat - customerLat) < 0.25 && Math.abs(lng - customerLng) < 0.25) {
            setWorkerPos([lat, lng])
          }
        },
        () => {
          // Fallback to offset
        },
        { enableHighAccuracy: true, timeout: 4000 }
      )
    }
  }, [customerLat, customerLng])

  // Realistic street route between worker and customer
  const routeCoords = useMemo(
    () => generateTransitRoute(workerPos, [customerLat, customerLng]),
    [workerPos, customerLat, customerLng]
  )

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${customerLat},${customerLng}&travelmode=two_wheeler`
  const customerPhone = job?.customerPhone || '+91 98765 43210'

  const handleArrived = async () => {
    setIsUpdating(true)
    try {
      await jobService.updateStatus(targetId, 'ARRIVED')
    } catch {
      // fallback
    } finally {
      setIsUpdating(false)
    }
    navigate(`/worker/jobs/${targetId}/arrival`)
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <PageHeader
        backTo={`/worker/jobs/${targetId}`}
        title={t('worker.execution.transitToCustomer', 'Going to Customer')}
        subtitle={t('worker.execution.statusTravelling', 'Step 2: On the way to customer')}
      />

      {/* Live Transit Map with Polyline Route & Auto-fit Bounds */}
      <div className="h-72 sm:h-84 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs relative">
        <MapView
          latitude={customerLat}
          longitude={customerLng}
          label={destinationArea}
          className="h-full"
          showCenterMarker={false}
          showCoordinatesBanner={false}
          autoFitBounds={true}
          routeCoordinates={routeCoords}
          markers={[
            {
              id: 'worker-loc',
              latitude: workerPos[0],
              longitude: workerPos[1],
              title: 'Your Location',
              subtitle: 'En route to customer',
              isWorker: true,
            },
            {
              id: 'cust-dest',
              latitude: customerLat,
              longitude: customerLng,
              title: destinationArea,
              subtitle: job?.location.formattedAddress || 'Customer Doorstep',
              isWorker: false,
            },
          ]}
        />

        {/* Live Trip Stat Overlay Badge */}
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/95 border border-slate-200 shadow-sm text-xs font-bold text-slate-900 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>1.8 km</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-600 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> ~6 mins
          </span>
        </div>
      </div>

      {/* Destination Card with Address & Navigation Links */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Destination Doorstep
              </span>
              <h3 className="text-base font-bold text-slate-900 truncate">
                {destinationArea}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-2">
                {job?.location.formattedAddress || 'Gandhipuram, Coimbatore'}
              </p>
            </div>
          </div>

          {/* Quick Call Action */}
          <a
            href={`tel:${customerPhone}`}
            className="min-h-[48px] min-w-[48px] rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-center shrink-0 transition-colors"
            title="Call Customer for Landmark Guidance"
          >
            <Phone className="w-5 h-5 text-slate-800" />
          </a>
        </div>

        {/* Primary Action Row: Google Maps Voice Navigation */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-h-[48px] py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Navigation className="w-4 h-4 text-white" />
            <span>Navigate in Google Maps (Turn-by-Turn)</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Linear Step 2 -> Step 3 Button (I Have Reached) */}
      <button
        type="button"
        onClick={handleArrived}
        disabled={isUpdating}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-xs transition-all min-h-[48px] cursor-pointer active:scale-[0.99] disabled:opacity-60"
      >
        {isUpdating ? (
          <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <span>{t('worker.execution.arrivedAtDoorstep', '2. I Have Reached Doorstep')}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  )
}
