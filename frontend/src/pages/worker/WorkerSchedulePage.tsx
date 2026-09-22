import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { useWorkerProfile } from '@/hooks/useWorkerProfile'
import { useJobs, useWorkerOffers } from '@/hooks/useJob'
import { WorkerStatusToggle, JobOfferCard } from '@/components/worker'
import { WorkerScheduleCalendar } from '@/components/worker/WorkerScheduleCalendar'
import { jobService } from '@/services/jobService'
import { workerService } from '@/services/workerService'
import type { Job } from '@/types/job'

export function WorkerSchedulePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const workerId = user?.id || ''
  const { profile, updateAvailability } = useWorkerProfile(workerId)

  // Incoming Opportunities
  const { data: offers = [], refetch: refetchOffers } = useWorkerOffers(workerId)
  const { refetch: refetchJobs } = useJobs({ workerId })

  const [dismissedOfferIds, setDismissedOfferIds] = useState<string[]>([])

  const pendingOffers = offers.filter((o) => !dismissedOfferIds.includes(o.id))

  const handleAcceptOffer = async (job: Job) => {
    try {
      await jobService.updateStatus(job.id, 'ACCEPTED', workerId)
      await refetchOffers()
      await refetchJobs()
      navigate(`/worker/jobs/${job.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not accept offer'
      alert(msg)
    }
  }

  const handleDeclineOffer = async (job: Job) => {
    try {
      if (job.status === 'BROADCAST') {
        setDismissedOfferIds((prev) => [...prev, job.id])
      } else {
        await workerService.declineOffer(job.id)
        await refetchOffers()
      }
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-black tracking-tight text-foreground">
          {t('worker.schedule.pageTitle', 'Job & Schedule Management')}
        </h1>
        <p className="text-xs text-muted-foreground">
          {t('worker.schedule.pageSubtitle', 'Set working hours and days off.')}
        </p>
      </div>

      {/* Online / Offline Availability Switcher */}
      <WorkerStatusToggle
        currentStatus={profile?.availability || 'AVAILABLE'}
        onToggle={updateAvailability}
      />

      {/* Interactive Shift & Days-Off Calendar */}
      <WorkerScheduleCalendar />

      {/* Incoming Job Opportunities */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">
            {t('worker.schedule.incomingTitle', 'Incoming Opportunities & Matches')}
          </h3>
          <span className="text-xs font-mono font-bold text-muted-foreground">
            {pendingOffers.length} {t('worker.schedule.availableJobs', 'available')}
          </span>
        </div>

        {pendingOffers.length > 0 ? (
          <div className="space-y-4">
            {pendingOffers.map((offer) => (
              <JobOfferCard
                key={offer.id}
                job={offer}
                onAccept={handleAcceptOffer}
                onDecline={handleDeclineOffer}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-dashed border-border text-center space-y-1 bg-card/50">
            <h4 className="text-xs font-bold text-foreground">
              {t('worker.schedule.noPendingOffers', 'No Pending Opportunities Right Now')}
            </h4>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              {profile?.availability === 'AVAILABLE'
                ? t('worker.schedule.waitingOnline', 'You are online! New dispatch requests in your society cluster will notify you immediately.')
                : t('worker.schedule.waitingOffline', 'You are currently offline. Turn on your status to receive incoming booking broadcasts.')}
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
