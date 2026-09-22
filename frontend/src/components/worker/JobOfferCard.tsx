import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  MapPin,
  Clock,
  Info,
  ChevronDown,
  ChevronUp,
  Navigation,
} from 'lucide-react'
import type { Job } from '@/types/job'
import { cn } from '@/lib/utils'
import { getTranslatedCategoryName, getTranslatedSubserviceName } from '@/lib/serviceTranslation'
import { MapView, generateTransitRoute } from '@/components/shared/MapView'

interface JobOfferCardProps {
  job: Job
  onAccept: (job: Job) => Promise<void> | void
  onDecline: (job: Job) => Promise<void> | void
  isAccepting?: boolean
  isDeclining?: boolean
  countdownSeconds?: number
}

export function JobOfferCard({
  job,
  onAccept,
  onDecline,
  isAccepting = false,
  isDeclining = false,
  countdownSeconds = 75,
}: JobOfferCardProps) {
  const { t } = useTranslation()
  const isEmergency = job.isEmergency || job.bookingType === 'EMERGENCY' || job.status === 'BROADCAST'
  const [timeLeft, setTimeLeft] = useState(countdownSeconds)
  const [showExplanation, setShowExplanation] = useState(false)

  // Emergency countdown timer (60-90s window per BLUEPRINT.md)
  useEffect(() => {
    if (!isEmergency) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isEmergency])

  const isTimedOut = isEmergency && timeLeft === 0

  const custLat = job.location?.latitude || 12.9344
  const custLng = job.location?.longitude || 77.6101
  const workerApproxLat = custLat + 0.0055
  const workerApproxLng = custLng - 0.0045
  const previewRoute = generateTransitRoute([workerApproxLat, workerApproxLng], [custLat, custLng])
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${custLat},${custLng}&travelmode=two_wheeler`

  return (
    <div
      className={cn(
        'rounded-xl border bg-card transition-all shadow-xs overflow-hidden',
        isEmergency
          ? 'border-border border-l-4 border-l-destructive shadow-sm'
          : 'border-border border-l-4 border-l-amber-500'
      )}
    >
      {/* Top Banner */}
      <div
        className={cn(
          'px-4 py-2.5 flex items-center justify-between text-xs font-bold border-b',
          isEmergency
            ? 'bg-destructive/10 text-destructive border-destructive/20'
            : 'bg-secondary/40 text-foreground border-border'
        )}
      >
        <div className="flex items-center gap-1.5">
          {isEmergency ? (
            <>
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span>{t('worker.offer.emergencyTitle', 'EMERGENCY BROADCAST')}</span>
            </>
          ) : (
            <span>{t('worker.offer.incomingTitle', 'JOB OFFER')}</span>
          )}
        </div>

        {isEmergency ? (
          <span className="font-mono bg-destructive/15 text-destructive px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wider border border-destructive/30">
            {t('worker.offer.expiresIn', 'Lock in')}: {timeLeft}s
          </span>
        ) : (
          <span className="font-mono text-[11px] text-muted-foreground font-semibold">
            #{job.id}
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Emergency Dispatch Banner if emergency */}
        {isEmergency && (
          <div className="p-3 rounded-xl text-xs space-y-1 bg-destructive/10 text-destructive border border-destructive/20">
            <div className="font-bold flex items-center gap-1.5 text-foreground">
              <span className="text-destructive">{t('worker.offer.emergencySub', 'Priority Emergency Broadcast · First to accept locks job')}</span>
            </div>
            {isTimedOut && (
              <p className="text-[11px] font-semibold text-destructive">
                {t('worker.offer.timedOut', 'Broadcast window expired.')}
              </p>
            )}
          </div>
        )}

        {/* Skill Details & Customer Location */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                {getTranslatedCategoryName(t, job.serviceCategoryId, job.serviceCategoryName)}
              </span>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-foreground">
                {getTranslatedSubserviceName(t, job.subserviceId, job.subserviceName)}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                {t('worker.offer.baseWageFloor', 'Pay')}
              </span>
              <span className="font-mono font-black text-lg sm:text-xl text-amber-600 dark:text-amber-400 block">
                ₹{job.basePrice}
              </span>
            </div>
          </div>

          {/* Location & Time Grid */}
          <div className="p-3 rounded-xl bg-secondary/50 border border-border/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-bold text-foreground block truncate">
                  {job.location.area || job.location.formattedAddress}
                </span>
                <span className="text-[11px] text-muted-foreground block truncate">
                  {job.location.formattedAddress}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground block">
                  {isEmergency
                    ? t('worker.offer.immediate', 'Reach as soon as possible')
                    : job.scheduledAt
                    ? new Date(job.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : t('worker.offer.immediate', 'Immediate Arrival')}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Location Map View with Route Preview */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-primary" />
                <span>{t('worker.offer.customerLocationMap', 'Customer Location & Route')}</span>
              </span>
              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <span>{t('worker.offer.openInMaps', 'Directions')}</span>
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs relative">
              <MapView
                latitude={custLat}
                longitude={custLng}
                label={job.customerName ? `${job.customerName}'s Location` : (job.location?.area || 'Customer Location')}
                className="h-[180px] min-h-[180px]"
                showCenterMarker={false}
                showCoordinatesBanner={false}
                autoFitBounds={true}
                routeCoordinates={previewRoute}
                markers={[
                  {
                    id: 'worker-origin',
                    latitude: workerApproxLat,
                    longitude: workerApproxLng,
                    title: 'Your Location',
                    isWorker: true,
                  },
                  {
                    id: 'cust-dest',
                    latitude: custLat,
                    longitude: custLng,
                    title: job.location?.area || 'Customer Location',
                    subtitle: job.location?.formattedAddress,
                    isWorker: false,
                  },
                ]}
              />
              <div className="absolute top-2.5 left-2.5 z-[1000] flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/95 border border-slate-200 shadow-xs text-[11px] font-bold text-slate-800 pointer-events-none">
                <Navigation className="w-3 h-3 text-amber-600" />
                <span>~2.4 km · 8 mins away</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deterministic Allocation Reason (Standard Jobs) */}
        {!isEmergency && job.allocationBreakdown && (
          <div className="border border-border/70 rounded-xl overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setShowExplanation((prev) => !prev)}
              className="w-full p-2.5 bg-secondary/40 flex items-center justify-between font-bold text-foreground hover:bg-secondary/70 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-primary">
                <Info className="w-3.5 h-3.5" />
                <span>{t('worker.offer.scoreExplanation', 'Why you got this job')}</span>
              </div>
              {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showExplanation && (
              <div className="p-3 bg-card space-y-2 border-t border-border/60">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {job.allocationBreakdown.explanation}
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/40 text-[10px]">
                  <div className="p-1.5 rounded bg-muted/50 text-center">
                    <span className="block text-muted-foreground">{t('worker.offer.proximityFactor', 'Near you')}</span>
                    <strong className="font-mono text-foreground">
                      {(job.allocationBreakdown.proximityScore * 100).toFixed(0)}%
                    </strong>
                  </div>
                  <div className="p-1.5 rounded bg-muted/50 text-center">
                    <span className="block text-muted-foreground">{t('worker.offer.ratingFactor', 'Good rating')}</span>
                    <strong className="font-mono text-foreground">
                      {(job.allocationBreakdown.ratingScore * 100).toFixed(0)}%
                    </strong>
                  </div>
                  <div className="p-1.5 rounded bg-muted/50 text-center">
                    <span className="block text-muted-foreground">{t('worker.offer.workloadFactor', 'Fair turn')}</span>
                    <strong className="font-mono text-foreground">
                      -{(job.allocationBreakdown.dailyLoadPenalty * 100).toFixed(0)}%
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions (Accept / Decline) with min-height 44px */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => onDecline(job)}
            disabled={isDeclining || isAccepting}
            className="min-h-[44px] py-2.5 px-4 rounded-xl border border-border bg-secondary/80 hover:bg-secondary text-foreground font-bold text-xs flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
          >
            {isDeclining ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>
                {isEmergency
                  ? t('worker.offer.dismiss', 'Dismiss')
                  : t('worker.offer.decline', 'Decline')}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onAccept(job)}
            disabled={isAccepting || isDeclining || isTimedOut}
            className={cn(
              'min-h-[44px] py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center transition-all active:scale-95 text-white shadow-xs',
              isEmergency
                ? 'bg-destructive hover:bg-destructive/90'
                : 'bg-amber-600 hover:bg-amber-700',
              (isAccepting || isTimedOut) && 'opacity-60 cursor-not-allowed'
            )}
          >
            {isAccepting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>
                {isEmergency
                  ? t('worker.offer.acceptEmergency', 'Accept Job')
                  : t('worker.offer.acceptStandard', 'Accept Job')}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
