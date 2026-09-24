import { useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, RefreshCw, ClipboardList, Calendar } from 'lucide-react'
import { useJob, useJobPolling, useJobs } from '@/hooks/useJob'
import { useAuth } from '@/hooks/useAuth'
import { jobService } from '@/services/jobService'
import { JobTrackingCard } from '@/components/customer/JobTrackingCard'
import { EmergencyCountdown } from '@/components/customer/EmergencyCountdown'
import { MapView } from '@/components/shared/MapView'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { getTranslatedPersonName } from '@/lib/serviceTranslation'

export function JobTrackingPage() {
  const { t } = useTranslation()
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Look up customer jobs to automatically locate the active gig
  const { data: customerJobs = [], isLoading: isCustomerJobsLoading } = useJobs({ customerId: user?.id })

  // Find active running job (not completed, cancelled, or expired)
  const activeJob = customerJobs.find(
    (j) => j.status !== 'COMPLETED' && j.status !== 'CANCELLED' && j.status !== 'EXPIRED'
  )
  const isGenericActiveRoute = !jobId || jobId === 'active'
  const resolvedJobId = isGenericActiveRoute ? (activeJob?.id || '') : (jobId || '')
  const targetId = resolvedJobId || ''

  // Poll job every 3 seconds for real-time live updates per spec §7
  const { data: polledJob, isLoading, error, refetch } = useJobPolling(targetId, 3000)
  const { updateStatus } = useJob(targetId)

  const handleCancelJob = async () => {
    if (window.confirm('Are you sure you want to cancel this booking request?')) {
      await jobService.cancelJob(targetId, 'Cancelled by customer')
      navigate('/customer')
    }
  }

  const mapMarkers = useMemo(() => {
    if (!polledJob) return []
    const lat = polledJob.location?.latitude || 11.0183
    const lng = polledJob.location?.longitude || 76.9644

    if (polledJob.status === 'TRAVELLING' || polledJob.status === 'ARRIVED') {
      const offset = polledJob.status === 'ARRIVED' ? 0.0002 : 0.003
      return [
        {
          id: 'assigned-worker',
          latitude: lat + offset,
          longitude: lng + offset,
          title: `${getTranslatedPersonName(t, polledJob.workerName || 'Worker')} (${
            polledJob.status === 'TRAVELLING'
              ? t('job.status.travelling', 'En Route')
              : t('job.status.arrived', 'Arrived')
          })`,
          isWorker: true,
        },
      ]
    }

    // When SEARCHING, BROADCAST, OFFERED, ACCEPTED, IN_PROGRESS
    return [
      {
        id: 'nearby-1',
        latitude: lat + 0.0035,
        longitude: lng + 0.0028,
        title: 'Verified Cooperative Electrician (~600m)',
        isWorker: true,
      },
      {
        id: 'nearby-2',
        latitude: lat - 0.0025,
        longitude: lng + 0.0042,
        title: 'Verified Cooperative Plumber (~900m)',
        isWorker: true,
      },
    ]
  }, [polledJob, t])

  if (!targetId) {
    if (isCustomerJobsLoading) {
      return (
        <div className="py-20 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )
    }

    return (
      <div className="space-y-6 py-4">
        <EmptyState
          icon={ClipboardList}
          title={t('job.noLiveJobsTitle', { defaultValue: 'No Live Jobs' })}
          description={t('job.noLiveJobsDesc', {
            defaultValue:
              'You do not have any live service dispatches in progress right now. Explore services to book a verified cooperative worker.',
          })}
          action={
            <Link
              to="/customer/services"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all"
            >
              {t('common.browseServices', { defaultValue: 'Browse Services & Book' })}
            </Link>
          }
        />

        {/* Recent Bookings History */}
        {customerJobs.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">
                {t('job.pastBookingsTitle', { defaultValue: 'Recent Bookings History' })}
              </h3>
              <span className="text-xs text-muted-foreground">
                {customerJobs.length} {t('common.total', { defaultValue: 'total' })}
              </span>
            </div>
            <div className="space-y-2.5">
              {customerJobs.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground truncate text-sm">
                        {job.subserviceName || 'Cooperative Service'}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">
                        {job.bookingType}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[11px] truncate">
                      {job.location?.formattedAddress || 'Gandhipuram, Coimbatore'} ·{' '}
                      {new Date(job.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                    <span className="font-mono font-bold text-foreground text-sm">
                      ₹{job.paidAmount || job.grossAmount || job.basePrice}
                    </span>
                    {job.isPaid ? (
                      <Link
                        to={`/customer/jobs/${job.id}/invoice`}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-500/20 transition-colors"
                      >
                        {t('job.viewInvoice', { defaultValue: 'Invoice' })}
                      </Link>
                    ) : job.status === 'COMPLETED' ? (
                      <Link
                        to={`/customer/jobs/${job.id}/payment`}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold text-xs hover:bg-amber-500/25 transition-colors"
                      >
                        {t('job.payNow', { defaultValue: 'Pay Now' })}
                      </Link>
                    ) : (
                      <Link
                        to={`/customer/jobs/${job.id}/tracking`}
                        className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-colors"
                      >
                        {t('job.trackBtn', { defaultValue: 'Track' })}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (isLoading && !polledJob) {
    return (
      <div className="py-20 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !polledJob) {
    return (
      <ErrorState
        message="Unable to track service request. Please check your connection or retry."
        retry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header with back and direct My Bookings link */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/customer"
            className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-foreground">
              {t('job.trackingTitle', { defaultValue: 'Live Dispatch Tracking' })}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/customer/bookings"
            className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{t('customer.myBookingsTitle', { defaultValue: 'My Bookings' })}</span>
          </Link>

          <button
            type="button"
            onClick={() => refetch()}
            className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Refresh status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Emergency Broadcast alert if active emergency in searching/broadcast */}
      {polledJob.isEmergency &&
        (polledJob.status === 'SEARCHING' || polledJob.status === 'BROADCAST') && (
          <EmergencyCountdown
            jobId={polledJob.id}
            timeoutSeconds={60}
            onExpandSearch={async () => {
              await updateStatus({ status: 'BROADCAST' })
              await refetch()
            }}
            onConvertToOnDemand={async () => {
              await updateStatus({ status: 'OFFERED' })
              await refetch()
            }}
          />
        )}

      {/* Live Cooperative Dispatch & Tracking Map */}
      <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              {polledJob.status === 'TRAVELLING'
                ? t('job.transitMapTitle', { defaultValue: 'Worker En Route · Live Transit Map' })
                : polledJob.status === 'ARRIVED'
                ? t('job.arrivalMapTitle', { defaultValue: 'Worker Arrived at Doorstep' })
                : t('job.dispatchMapTitle', { defaultValue: 'Cooperative Dispatch Network' })}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground font-semibold truncate max-w-[200px]">
            {polledJob.status === 'TRAVELLING'
              ? '~5-8 mins away'
              : polledJob.status === 'ARRIVED'
              ? 'At location'
              : polledJob.location?.formattedAddress || 'Gandhipuram, Coimbatore'}
          </span>
        </div>

        <div className="h-64 sm:h-80 rounded-xl overflow-hidden border border-border">
          <MapView
            latitude={polledJob.location?.latitude || 11.0183}
            longitude={polledJob.location?.longitude || 76.9644}
            label={polledJob.location?.formattedAddress || 'Gandhipuram, Coimbatore'}
            className="h-full"
            markers={mapMarkers}
          />
        </div>
      </div>

      <JobTrackingCard
        job={polledJob}
        onCancel={handleCancelJob}
      />
    </div>
  )
}
