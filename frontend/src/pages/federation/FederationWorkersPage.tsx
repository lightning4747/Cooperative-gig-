import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2 } from 'lucide-react'
import { FederationPageHeader } from '@/components/federation/FederationPageHeader'
import { WorkerTable } from '@/components/federation/WorkerTable'
import { useFederationWorkers } from '@/hooks/useFederationDashboard'
import { federationService } from '@/services/federationService'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import type { WorkerStatus } from '@/types/worker'

export function FederationWorkersPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const societyId = searchParams.get('societyId') || undefined
  const { workers, isLoading, error, refetch } = useFederationWorkers(societyId)
  const [successToast, setSuccessToast] = useState<string | null>(null)

  const handleStatusChange = async (workerId: string, status: WorkerStatus) => {
    try {
      await federationService.verifyWorker(workerId, status)
      setSuccessToast(t('federation.workersPage.statusUpdated', { status, defaultValue: `Worker verification status updated to ${status}.` }))
      refetch()
      setTimeout(() => setSuccessToast(null), 3500)
    } catch (err: any) {
      console.error(err)
    }
  }

  if (isLoading) return <LoadingSpinner size="lg" className="py-24" />
  if (error) return <ErrorState message={error.message} retry={() => refetch()} />

  return (
    <div className="space-y-6">
      <FederationPageHeader
        title={t('federation.workersPage.title', { defaultValue: 'Worker Directory' })}
        description={t('federation.workersPage.description', { defaultValue: 'Member directory across affiliated cooperative societies.' })}
        badgeText={t('federation.workersPage.badge', { count: workers.length, defaultValue: `${workers.length} Workers` })}
      />

      {successToast && (
        <div className="p-2.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-medium text-xs flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{successToast}</span>
        </div>
      )}

      <WorkerTable
        workers={workers}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
