import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useWorkerProfile } from '@/hooks/useWorkerProfile'
import { useJobs, useWorkerOffers } from '@/hooks/useJob'
import { WorkerStatusToggle, JobOfferCard } from '@/components/worker'
import { jobService } from '@/services/jobService'
import { workerService } from '@/services/workerService'
import type { Job } from '@/types/job'
import { getTranslatedPersonName, getTranslatedSocietyName } from '@/lib/serviceTranslation'

export function WorkerDashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const workerId = user?.id || ''
  const { profile, updateAvailability } = useWorkerProfile(workerId)

  // Polling for incoming matched offers (standard & emergency broadcasts)
  const { data: offers = [], refetch: refetchOffers } = useWorkerOffers(workerId)

  // Active in-transit or in-progress jobs for this worker
  const { data: allJobs = [], refetch: refetchJobs } = useJobs({ workerId })

  // Real earnings and welfare pool data
  const { data: earnings, refetch: refetchEarnings } = useQuery({
    queryKey: ['workerEarnings', workerId],
    queryFn: () => workerService.getEarnings(),
    staleTime: 0,
    refetchOnMount: 'always',
  })

  // Eagerly refresh jobs on mount to prevent showing stale in-flight state after completion
  useEffect(() => {
    refetchJobs()
    refetchOffers()
    refetchEarnings()
  }, [refetchJobs, refetchOffers, refetchEarnings])

  const activeJob = allJobs.find(
    (j) =>
      (j.status === 'ACCEPTED' ||
        j.status === 'TRAVELLING' ||
        j.status === 'ARRIVED' ||
        j.status === 'IN_PROGRESS') &&
      (!workerId || j.workerId === workerId)
  )

  const [dismissedOfferIds, setDismissedOfferIds] = useState<string[]>([])

  // Filter out any locally dismissed emergency broadcasts
  const pendingOffers = offers.filter((o) => !dismissedOfferIds.includes(o.id))

  const isArun =
    Boolean(user?.phone?.includes('9876543211') || user?.name?.toLowerCase().includes('arun'))

  // For new workers: only show emergency broadcast jobs.
  // Arun Electrician gets all routed jobs (on-demand, scheduled, and emergency).
  const visibleOffers = pendingOffers.filter((o) => {
    if (isArun) return true
    return o.isEmergency || o.bookingType === 'EMERGENCY' || o.status === 'BROADCAST'
  })

  const handleAcceptOffer = async (job: Job) => {
    try {
      await jobService.updateStatus(job.id, 'ACCEPTED', workerId)
      await refetchOffers()
      await refetchJobs()
      // Immediately enter linear progression: Step 1 (ACCEPTED / Travelling)
      navigate(`/worker/jobs/${job.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not accept offer'
      alert(msg)
    }
  }

  const handleDeclineOffer = async (job: Job) => {
    try {
      if (job.status === 'BROADCAST') {
        // Dismiss broadcast locally for this worker
        setDismissedOfferIds((prev) => [...prev, job.id])
      } else {
        await workerService.declineOffer(job.id)
        await refetchOffers()
      }
    } catch {
      // Fallback
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Profile Summary Banner */}
      <section className="p-4 sm:p-5 rounded-2xl bg-card border border-border border-l-4 border-l-amber-500 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {getTranslatedPersonName(t, user?.name || 'Ramesh Kumar')}
            </h1>
            <p className="text-xs text-muted-foreground">
              {getTranslatedSocietyName(t, profile?.societyName || 'Bengaluru South Cooperative Society')}
            </p>
          </div>

        </div>
      </section>

      {/* Worker Availability Toggle */}
      <WorkerStatusToggle
        currentStatus={profile?.availability || 'AVAILABLE'}
        onToggle={updateAvailability}
        disabled={!!activeJob}
      />

      {/* Schedule & Working Hours Quick Access Card */}
      <section className="p-4 rounded-2xl border border-border bg-card shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-foreground">
            {t('worker.dashboard.scheduleTitle', 'Job & Schedule Management')}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t('worker.dashboard.scheduleSubtitle', 'Set working hours and days off.')}
          </p>
        </div>

        <Link
          to="/worker/jobs?tab=schedule"
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs border border-border/80 transition-all shrink-0 cursor-pointer min-h-[40px]"
        >
          <span>{t('worker.dashboard.manageSchedule', 'Manage Schedule')}</span>
        </Link>
      </section>


      {/* PENDING MATCHED OFFERS & EMERGENCY BROADCASTS */}
      {visibleOffers.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              {t('worker.dashboard.incomingOffers', { count: visibleOffers.length, defaultValue: 'Incoming Job Offers & Broadcasts ({{count}})' })}
            </h2>
            <span className="text-[11px] font-mono text-muted-foreground">
              {t('worker.dashboard.instantAction', 'Instant Action Required')}
            </span>
          </div>

          <div className="space-y-4">
            {visibleOffers.map((offer) => (
              <JobOfferCard
                key={offer.id}
                job={offer}
                onAccept={handleAcceptOffer}
                onDecline={handleDeclineOffer}
              />
            ))}
          </div>
        </section>
      )}

      {/* ACTIVE IN-FLIGHT JOB CARD (STRICT LINEAR ACTION) */}
      {activeJob && (
        <section className="p-4 sm:p-5 rounded-2xl border border-border border-l-4 border-l-amber-500 bg-card shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('worker.dashboard.currentAssignedJob', 'Active In-Progress Job')}
            </span>
            <span className="inline-flex items-center text-[11px] font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {activeJob.status}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                {activeJob.serviceCategoryName} · {activeJob.subserviceName}
              </h3>
              <p className="text-xs text-muted-foreground">
                {activeJob.location.area || activeJob.location.formattedAddress} · {t('common.baseWage', 'Pay')}:{' '}
                <strong className="font-mono text-foreground">₹{activeJob.basePrice}</strong>
              </p>
            </div>

            {/* Strict Linear Next Action Shortcut */}
            {activeJob.status === 'ACCEPTED' && (
              <Link
                to={`/worker/jobs/${activeJob.id}`}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all min-h-[44px]"
              >
                <span>1. Start Travelling</span>
              </Link>
            )}

            {activeJob.status === 'TRAVELLING' && (
              <Link
                to={`/worker/jobs/${activeJob.id}/travelling`}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all min-h-[44px]"
              >
                <span>2. Reached Location</span>
              </Link>
            )}

            {activeJob.status === 'ARRIVED' && (
              <Link
                to={`/worker/jobs/${activeJob.id}/arrival`}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all min-h-[44px]"
              >
                <span>3. Enter Customer Code</span>
              </Link>
            )}

            {activeJob.status === 'IN_PROGRESS' && (
              <Link
                to={`/worker/jobs/${activeJob.id}/complete`}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all min-h-[44px]"
              >
                <span>4. Finish Job & Get Paid</span>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Metric Counters Grid: Simple, clean numbers without icon clutter */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3.5 sm:p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
            {t('worker.dashboard.todayEarnings', 'Earnings')}
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-foreground truncate">
            ₹{Number(earnings?.totals?.totalEarnings ?? 0).toFixed(0)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
            {t('worker.dashboard.guaranteedEarnings', 'Fixed earnings')}
          </p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
            {t('worker.dashboard.jobsCompleted', 'Jobs')}
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-foreground truncate">
            {earnings?.totals?.paidJobs ?? profile?.totalJobsCompleted ?? 0}
          </div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
            {t('worker.dashboard.completedToday', 'Completed jobs')}
          </p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
            {t('worker.dashboard.welfarePool', 'Welfare')}
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-foreground truncate">
            ₹{Number(earnings?.totals?.totalWelfare ?? 0).toFixed(0)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
            {t('worker.dashboard.accumulatedPool', 'Your welfare savings')}
          </p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
            {t('worker.dashboard.ratingDoorstep', 'Rating')}
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-foreground truncate">
            {profile?.rating || 4.8} ★
          </div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
            {t('worker.dashboard.doorstepVerified', 'Customer verified')}
          </p>
        </div>
      </section>

    </div>
  )
}
