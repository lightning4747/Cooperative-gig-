import { useTranslation } from 'react-i18next'
import { Scale } from 'lucide-react'
import { FederationPageHeader } from '@/components/federation/FederationPageHeader'
import { AllocationInspector } from '@/components/federation/AllocationInspector'
import { useJobs } from '@/hooks/useJob'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export function FederationAllocationPage() {
  const { t } = useTranslation()
  const { data: jobs = [], isLoading } = useJobs()

  if (isLoading) return <LoadingSpinner size="lg" className="py-24" />

  return (
    <div className="space-y-6">
      <FederationPageHeader
        title={t('federation.allocationPage.title', { defaultValue: 'Job Dispatch Review' })}
        description={t('federation.allocationPage.description', { defaultValue: 'Review how service requests are matched fairly based on distance, worker skills, and daily workload.' })}
        badgeIcon={Scale}
        badgeText={t('federation.allocationPage.badge', { defaultValue: 'Fair Work Allocation' })}
      />

      <AllocationInspector jobs={jobs} />
    </div>
  )
}
