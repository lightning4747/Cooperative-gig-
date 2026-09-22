import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { WelfareStatusCard } from '@/components/worker'
import { useAuth } from '@/hooks/useAuth'
import { workerService } from '@/services/workerService'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export function WorkerWelfarePage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const { data: earnings, isLoading } = useQuery({
    queryKey: ['workerEarnings', user?.id],
    queryFn: () => workerService.getEarnings(),
    staleTime: 0,
    refetchOnMount: 'always',
  })

  const balance = Number(earnings?.totals?.totalWelfare ?? 0)

  const recentEntries = (earnings?.recentPayments || [])
    .filter((p: any) => Number(p.welfareContribution || p.welfare_contribution || 0) > 0)
    .map((p: any) => ({
      id: String(p.id),
      date: p.createdAt || p.created_at
        ? new Date(p.createdAt || p.created_at).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Recent',
      task: p.subserviceName || p.subservice_name || 'Completed Service',
      surplusContribution: Number(p.welfareContribution || p.welfare_contribution || 0),
      reason: `${p.bookingType || p.booking_type || 'Cooperative'} Surplus Share`,
    }))

  return (
    <div className="space-y-5">
      <div className="space-y-0.5">
        <h1 className="text-xl font-black tracking-tight text-foreground">
          {t('worker.welfare.title', 'Cooperative Welfare Pool')}
        </h1>
      </div>

      {isLoading && !earnings ? (
        <div className="py-12 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <WelfareStatusCard
          balance={balance}
          recentEntries={recentEntries}
        />
      )}
    </div>
  )
}
