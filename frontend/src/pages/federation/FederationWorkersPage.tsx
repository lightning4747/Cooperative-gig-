import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Users, CheckCircle2 } from 'lucide-react'
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
        title={t('federation.workersPage.title', { defaultValue: 'Federation Worker Directory' })}
        description={t('federation.workersPage.description', { defaultValue: 'Comprehensive member register across affiliated primary cooperative societies with verified skills and statutory credentials.' })}
        badgeIcon={Users}
        badgeText={t('federation.workersPage.badge', { count: workers.length, defaultValue: `${workers.length} Registered Members` })}
      />

      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
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
