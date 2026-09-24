import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  User,
  Phone,
  MapPin,
  Navigation,
  KeyRound,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Lock,
  RefreshCw,
} from 'lucide-react'
import type { Job } from '@/types/job'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { JobProgressBar } from '@/components/shared/JobProgressBar'
import { jobService } from '@/services/jobService'
import { getTranslatedCategoryName, getTranslatedSubserviceName } from '@/lib/serviceTranslation'
import { cleanAddress, cn } from '@/lib/utils'
import { JobOfferCard } from './JobOfferCard'
import { MapView } from '@/components/shared/MapView'
import { useAuthStore } from '@/store/authStore'

interface JobDetailWorkerProps {
  job: Job
  onStatusUpdated?: (updatedJob: Job) => void
}

export function JobDetailWorker({ job, onStatusUpdated }: JobDetailWorkerProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isUpdating, setIsUpdating] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(60)
  const [isCheckingPayment, setIsCheckingPayment] = useState(false)

  // Countdown timer for 60 seconds when job is ACCEPTED and not paid
  useEffect(() => {
    if (job.status !== 'ACCEPTED' || job.isPaid) return

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [job.status, job.isPaid])

  // Polling check every 2.5s while ACCEPTED and not paid
  useEffect(() => {
    if (job.status !== 'ACCEPTED' || job.isPaid) return

    const pollInterval = setInterval(async () => {
      try {
        const freshJob = await jobService.getJob(job.id)
        if (freshJob.isPaid || freshJob.status !== 'ACCEPTED') {
          onStatusUpdated?.(freshJob)
        }
      } catch {
        // Continue polling silently
      }
    }, 2500)

    return () => clearInterval(pollInterval)
  }, [job.id, job.status, job.isPaid, onStatusUpdated])

  const handleManualCheckPayment = async () => {
    setIsCheckingPayment(true)
    try {
      const freshJob = await jobService.getJob(job.id)
      onStatusUpdated?.(freshJob)
    } finally {
      setIsCheckingPayment(false)
    }
  }

  const handleResetTimer = () => {
    setSecondsRemaining(60)
  }

  const handleStartTravelling = async () => {
    setIsUpdating(true)
    try {
      const updated = await jobService.updateStatus(job.id, 'TRAVELLING')
      onStatusUpdated?.(updated)
      navigate(`/worker/jobs/${job.id}/travelling`)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleProceedToArrival = async () => {
    setIsUpdating(true)
    try {
      const updated = await jobService.updateStatus(job.id, 'ARRIVED')
      onStatusUpdated?.(updated)
      navigate(`/worker/jobs/${job.id}/arrival`)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAcceptOffer = async (targetJob: Job) => {
    setIsUpdating(true)
    try {
      const currentWorkerId = job.workerId || useAuthStore.getState().user?.id || ''
      const updated = await jobService.updateStatus(targetJob.id, 'ACCEPTED', currentWorkerId)
      onStatusUpdated?.(updated)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeclineOffer = async (targetJob: Job) => {
    setIsUpdating(true)
    try {
      await jobService.updateStatus(targetJob.id, 'CANCELLED')
      navigate('/worker/jobs')
    } finally {
      setIsUpdating(false)
    }
  }

  // If job is in OFFERED or BROADCAST state, display JobOfferCard
  if (job.status === 'OFFERED' || job.status === 'BROADCAST') {
    return (
      <div className="space-y-4">
        <JobOfferCard
          job={job}
          onAccept={handleAcceptOffer}
          onDecline={handleDeclineOffer}
          isAccepting={isUpdating}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header status bar */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              {getTranslatedCategoryName(t, job.serviceCategoryId, job.serviceCategoryName)}
            </span>
            <h2 className="text-lg font-black tracking-tight text-foreground">
              {getTranslatedSubserviceName(t, job.subserviceId, job.subserviceName)}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={job.status} />
          </div>
        </div>

        {/* Linear Progress Bar */}
        <JobProgressBar status={job.status} isEmergency={job.isEmergency} />
      </div>

      {/* Customer & Location Card */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('worker.execution.customerLocation', 'Customer Location')}
          </span>

          <div className="p-4 rounded-xl bg-secondary/50 border border-border/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold text-foreground text-sm">
                    {job.customerName || t('common.customer', { defaultValue: 'Customer' })}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    Verified Member
                  </span>
                </div>
              </div>

              {job.customerPhone && (
                <a
                  href={`tel:${job.customerPhone}`}
                  className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              )}
            </div>

            <div className="flex items-start gap-2 pt-2 border-t border-border/60 text-xs text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="block font-semibold text-foreground">
                  {job.location.area || cleanAddress(job.location.formattedAddress) || 'Customer Location'}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {cleanAddress(job.location.formattedAddress)}
                </p>
              </div>
            </div>

            {/* Customer Location Map */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-primary" />
                  <span>{t('worker.execution.doorstepMap', 'Customer Location Map')}</span>
                </span>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${job.location?.latitude || 12.9344},${job.location?.longitude || 77.6101}&travelmode=two_wheeler`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <span>{t('worker.offer.openInMaps', 'Directions')}</span>
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                <MapView
                  latitude={job.location?.latitude || 12.9344}
                  longitude={job.location?.longitude || 77.6101}
                  label={job.customerName ? `${job.customerName}'s Location` : (job.location.area || 'Customer Location')}
                  className="h-[180px] min-h-[180px]"
                  showCoordinatesBanner={false}
                  zoom={14}
                />
              </div>
            </div>
          </div>
        </div>

        {/* LINEAR PROGRESSION STEP CONTROLLER */}
        <div className="pt-3 border-t border-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t('worker.execution.nextAction', 'Next Step')}
            </span>
          </div>

          {/* STEP 1: ACCEPTED BUT PAYMENT PENDING (60s Countdown Waiting Page) */}
          {job.status === 'ACCEPTED' && !job.isPaid && (
            <div className="p-5 rounded-2xl bg-card border-2 border-amber-500/40 shadow-sm space-y-4">
              {/* Header Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      Payment Pending
                    </span>
                  </div>
                  <h3 className="text-base font-black text-foreground">
                    Waiting for Customer Payment
                  </h3>
                </div>

                {/* 60s Countdown Circular/Pill Badge */}
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 shrink-0 text-center min-w-[75px]">
                  <Clock className="w-4 h-4 text-amber-600 mb-0.5 animate-pulse" />
                  <span className="font-mono text-xl font-black text-amber-700 dark:text-amber-300">
                    {secondsRemaining}s
                  </span>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">
                    Wait Window
                  </span>
                </div>
              </div>

              {/* Progress Bar for 60 seconds */}
              <div className="space-y-1.5">
                <div className="w-full bg-secondary/80 h-2 rounded-full overflow-hidden border border-border/60">
                  <div
                    className="bg-amber-500 h-full transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${(secondsRemaining / 60) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                  <span>Payment Window</span>
                  <span>{secondsRemaining > 0 ? `${secondsRemaining} seconds remaining` : 'Checking payment...'}</span>
                </div>
              </div>

              {/* Disabled Start Travel Button */}
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={true}
                  className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-muted text-muted-foreground font-bold text-xs flex items-center justify-center gap-2 border border-border/80 cursor-not-allowed opacity-75"
                >
                  <Lock className="w-4 h-4" />
                  <span>Waiting for customer payment</span>
                </button>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                  <button
                    type="button"
                    onClick={handleManualCheckPayment}
                    disabled={isCheckingPayment}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-semibold transition-colors"
                  >
                    <RefreshCw className={cn('w-3.5 h-3.5', isCheckingPayment && 'animate-spin')} />
                    <span>Check Payment Status</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {job.customerPhone && (
                      <a
                        href={`tel:${job.customerPhone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Customer</span>
                      </a>
                    )}

                    {secondsRemaining === 0 && (
                      <button
                        type="button"
                        onClick={handleResetTimer}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
                      >
                        <span>+60s More</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: ACCEPTED AND PAID -> CAN START TRAVELLING */}
          {job.status === 'ACCEPTED' && job.isPaid && (
            <div className="p-5 rounded-2xl bg-card border-2 border-emerald-500/50 space-y-3 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Payment Received · Ready to Go
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold font-mono text-[11px] border border-emerald-500/20 shrink-0">
                  PAID
                </span>
              </div>

              <button
                type="button"
                onClick={handleStartTravelling}
                disabled={isUpdating}
                className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-xs hover:bg-primary/90 active:scale-[0.99] transition-all cursor-pointer"
              >
                {isUpdating ? (
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Navigation className="w-4 h-4" />
                    <span>1. Start Travelling</span>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: TRAVELLING -> ARRIVE AT DOORSTEP */}
          {job.status === 'TRAVELLING' && (
            <div className="p-4 rounded-xl bg-card border border-primary/30 space-y-3 shadow-xs">
              <div className="space-y-1">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  Step 2: On the way
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Link
                  to={`/worker/jobs/${job.id}/travelling`}
                  className="min-h-[48px] py-2.5 px-4 rounded-xl border border-border bg-secondary/70 hover:bg-secondary text-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Navigation className="w-4 h-4 text-primary" />
                  <span>View Map</span>
                </Link>

                <button
                  type="button"
                  onClick={handleProceedToArrival}
                  disabled={isUpdating}
                  className="min-h-[48px] py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                >
                  {isUpdating ? (
                    <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>2. I Have Reached</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ARRIVED -> ENTER MUTUAL OTP */}
          {job.status === 'ARRIVED' && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 space-y-3 shadow-xs">
              <div className="space-y-1">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-primary" />
                  Step 3: Enter Customer Code
                </span>
              </div>

              <Link
                to={`/worker/jobs/${job.id}/arrival`}
                className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99]"
              >
                <KeyRound className="w-4 h-4" />
                <span>3. Enter Customer Code</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Link>
            </div>
          )}

          {/* STEP 4: IN_PROGRESS -> COMPLETE WORK */}
          {job.status === 'IN_PROGRESS' && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 animate-spin" />
                  Step 4: Work in Progress
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>

              <Link
                to={`/worker/jobs/${job.id}/complete`}
                className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>4. Finish Work & Get Paid</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Link>
            </div>
          )}

          {/* STEP 5: COMPLETED */}
          {job.status === 'COMPLETED' && (
            <div className="p-4 rounded-xl bg-card border border-border space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                <CheckCircle2 className="w-5 h-5" />
                <span>Job Completed</span>
              </div>
              <Link
                to="/worker/passbook"
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-secondary hover:bg-muted text-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>View Passbook</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
