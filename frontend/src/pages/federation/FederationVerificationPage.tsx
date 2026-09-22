import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserCheck, CheckCircle2 } from 'lucide-react'
import { FederationPageHeader } from '@/components/federation/FederationPageHeader'
import { VerificationQueue } from '@/components/federation/VerificationQueue'
import { useFederationWorkers } from '@/hooks/useFederationDashboard'
import { federationService } from '@/services/federationService'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import type { WorkerStatus } from '@/types/worker'

export function FederationVerificationPage() {
  const { t } = useTranslation()
  const { workers, isLoading, error, refetch } = useFederationWorkers()
  const [toast, setToast] = useState<string | null>(null)

  const pendingWorkers = workers.filter((w) => w.status === 'PENDING_VERIFICATION')

  const handleVerify = async (workerId: string, status: WorkerStatus) => {
    try {
      const targetWorker = pendingWorkers.find((w) => w.userId === workerId)
      const declaredCats = targetWorker?.skills.map((s) => s.serviceCategoryId).filter(Boolean) || []
      await federationService.verifyWorker(workerId, status, declaredCats)
      setToast(
        status === 'ACTIVE'
          ? t('federation.verificationPage.statusActive', { defaultValue: 'Worker member credentials approved and status set to ACTIVE.' })
          : t('federation.verificationPage.statusSuspended', { defaultValue: 'Worker application returned / suspended.' })
      )
      refetch()
      setTimeout(() => setToast(null), 3500)
    } catch (err: any) {
      console.error(err)
    }
  }

  if (isLoading) return <LoadingSpinner size="lg" className="py-24" />
  if (error) return <ErrorState message={error.message} retry={() => refetch()} />

  return (
    <div className="space-y-6">
      <FederationPageHeader
        title={t('federation.verificationPage.title', { defaultValue: 'Worker Verification & Credentialing Queue' })}
        description={t('federation.verificationPage.description', { defaultValue: 'Statutory apex verification of newly registered cooperative members, e-Shram UANs, and trade skill certifications.' })}
        badgeIcon={UserCheck}
        badgeText={t('federation.verificationPage.badge', { count: pendingWorkers.length, defaultValue: `${pendingWorkers.length} Pending Actions` })}
      />

      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      <VerificationQueue
        pendingWorkers={pendingWorkers}
        onVerify={handleVerify}
      />
    </div>
  )
}
