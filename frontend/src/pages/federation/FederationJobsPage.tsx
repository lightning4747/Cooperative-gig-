import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ClipboardList } from 'lucide-react'
import { FederationPageHeader } from '@/components/federation/FederationPageHeader'
import { JobsTable } from '@/components/federation/JobsTable'
import { JobDetailFederation } from '@/components/federation/JobDetailFederation'
import { useJobs } from '@/hooks/useJob'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { Job } from '@/types/job'

export function FederationJobsPage() {
  const { t } = useTranslation()
  const { data: jobs = [], isLoading } = useJobs()
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  if (isLoading) return <LoadingSpinner size="lg" className="py-24" />

  return (
    <div className="space-y-6">
      <FederationPageHeader
        title={t('federation.jobsPage.title', { defaultValue: 'Job Operations' })}
        description={t('federation.jobsPage.description', { defaultValue: 'All service bookings across scheduled, on-demand, and emergency channels.' })}
        badgeIcon={ClipboardList}
        badgeText={t('federation.jobsPage.badge', { count: jobs.length, defaultValue: `${jobs.length} Jobs Logged` })}
      />

      <JobsTable
        jobs={jobs}
        onSelectJob={(job) => setSelectedJob(job)}
      />

      <JobDetailFederation
        job={selectedJob}
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  )
}
