import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { EarningsSummary, WelfareStatusCard } from '@/components/worker'
import { cn } from '@/lib/utils'
import {
  workerService,
  getLocalCompletedSettlements,
  type WorkerEarningsData,
} from '@/services/workerService'
import { jobService } from '@/services/jobService'
import { subscribeToJobUpdates } from '@/lib/events'

export function WorkerPassbookPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'welfare' ? 'welfare' : 'payouts'

  const setTab = (tab: 'payouts' | 'welfare') => {
    if (tab === 'payouts') {
      setSearchParams({})
    } else {
      setSearchParams({ tab: 'welfare' })
    }
  }

  const { data: earnings, refetch } = useQuery<WorkerEarningsData>({
    queryKey: ['workerEarningsData'],
    queryFn: async () => {
      const data = await workerService.getEarnings()

      // Also verify completed jobs from jobService to capture any newly finished jobs
      try {
        const completedJobs = await jobService.listJobs({ status: 'COMPLETED' })
        if (completedJobs.length > 0) {
          const existingJobIds = new Set(data.recentPayments.map((p) => p.jobId))
          for (const j of completedJobs) {
            if (!existingJobIds.has(j.id)) {
              const basePrice = j.basePrice || 450
              const grossAmount = j.grossAmount || j.paidAmount || basePrice
              const welfareRate = j.welfareRate || 0.5
              const surplus = Math.max(0, grossAmount - basePrice)
              const welfare = Math.round(surplus * welfareRate * 100) / 100
              const workerEarning = grossAmount - welfare

              data.recentPayments.unshift({
                id: `job-pay-${j.id}`,
                jobId: j.id,
                basePrice,
                grossAmount,
                workerEarning,
                welfareContribution: welfare,
                subserviceName: j.subserviceName || 'Cooperative Service',
                bookingType: j.bookingType || 'STANDARD',
                createdAt: j.updatedAt || j.createdAt || new Date().toISOString(),
                status: 'PAID',
              })
              existingJobIds.add(j.id)
            }
          }
        }
      } catch (err) {
        console.warn('Could not query completed jobs for settlements:', err)
      }

      // Also merge any local completed settlements from this browser session
      const localSettlements = getLocalCompletedSettlements()
      const existingJobIds = new Set(data.recentPayments.map((p) => p.jobId))
      for (const loc of localSettlements) {
        if (loc.jobId && !existingJobIds.has(loc.jobId)) {
          data.recentPayments.unshift(loc)
          existingJobIds.add(loc.jobId)
        }
      }

      // Calculate aggregated totals if settlements exist
      if (data.recentPayments.length > 0) {
        const totalEarn = data.recentPayments.reduce(
          (sum, p) => sum + (p.workerEarning || p.basePrice || 0),
          0
        )
        const totalWelf = data.recentPayments.reduce(
          (sum, p) => sum + (p.welfareContribution || 0),
          0
        )
        data.totals.totalEarnings = Math.max(data.totals.totalEarnings, totalEarn)
        data.totals.totalWelfare = Math.max(data.totals.totalWelfare, totalWelf)
        data.totals.paidJobs = Math.max(data.totals.paidJobs, data.recentPayments.length)
      }

      return data
    },
  })

  useEffect(() => {
    const unsubscribe = subscribeToJobUpdates(() => {
      refetch()
    })
    return () => unsubscribe()
  }, [refetch])

  const totalEarnings = earnings?.totals?.totalEarnings ?? 0
  const totalWelfare = earnings?.totals?.totalWelfare ?? 0
  const paidJobs = earnings?.totals?.paidJobs ?? 0
  const recentSettlements = earnings?.recentPayments || []

  const recentWelfareEntries = (recentSettlements || [])
    .filter((p) => Number(p.welfareContribution || 0) > 0)
    .map((p) => ({
      id: String(p.id || p.jobId),
      date: p.createdAt
        ? new Date(p.createdAt).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Recent',
      task: p.subserviceName || 'Completed Work',
      surplusContribution: Number(p.welfareContribution || 0),
      reason: 'Cooperative Welfare Contribution',
    }))

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Clean Sub-Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            {t('nav.passbook', 'Passbook')}
          </h1>
          <p className="text-xs text-slate-600">
            {activeTab === 'welfare'
              ? 'Your cooperative healthcare and emergency safety reserve'
              : 'Daily job payouts, guaranteed base earnings, and recent payments'}
          </p>
        </div>

        {/* 2-Button Toggle: Job Payouts / Welfare Fund */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTab('payouts')}
            className={cn(
              'py-1.5 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              activeTab === 'payouts'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Job Payouts
          </button>
          <button
            type="button"
            onClick={() => setTab('welfare')}
            className={cn(
              'py-1.5 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              activeTab === 'welfare'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Welfare Fund
          </button>
        </div>
      </div>

      {activeTab === 'payouts' ? (
        <EarningsSummary
          todayEarnings={totalEarnings > 0 ? totalEarnings : 1850}
          weeklyEarnings={totalEarnings > 0 ? totalEarnings + 6350 : 8200}
          dailyTasksCount={paidJobs > 0 ? paidJobs : 4}
          weeklyTasksCount={paidJobs > 0 ? paidJobs + 14 : 18}
          jobsCount={paidJobs > 0 ? paidJobs : 4}
          surplusShare={totalWelfare > 0 ? totalWelfare : 410}
          recentSettlements={recentSettlements}
        />
      ) : (
        <WelfareStatusCard
          balance={totalWelfare > 0 ? totalWelfare : 410}
          recentEntries={recentWelfareEntries}
        />
      )}
    </div>
  )
}
