import { useTranslation } from 'react-i18next'
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
        description={t('federation.allocationPage.description', { defaultValue: 'Review task allocation based on distance, verified skills, and workload.' })}
      />

      <AllocationInspector jobs={jobs} />
    </div>
  )
}
