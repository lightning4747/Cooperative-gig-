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
        title={t('federation.allocationPage.title', { defaultValue: 'Deterministic Allocation Inspector' })}
        description={t('federation.allocationPage.description', { defaultValue: '' })}
        badgeIcon={Scale}
        badgeText={t('federation.allocationPage.badge', { defaultValue: '100% Algorithmic Transparency' })}
      />

      <AllocationInspector jobs={jobs} />
    </div>
  )
}
