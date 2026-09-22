import { useTranslation } from 'react-i18next'
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
} from 'lucide-react'
import type { CapacitySummary, CategoryMetric } from '@/types/analytics'
import { cn } from '@/lib/utils'

interface GapCapacityMatrixProps {
  capacity: CapacitySummary
  categories: CategoryMetric[]
}

export function GapCapacityMatrix({ capacity, categories }: GapCapacityMatrixProps) {
  const { t } = useTranslation()

  // Find categories with gap or zero verified workers
  const deficientCategories = categories.filter((c) => c.verifiedWorkers === 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-foreground">
          {t('federation.capacity.matrixTitle', { defaultValue: 'Workforce Gap & Capacity Analysis' })}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t('federation.capacity.matrixSubtitle', {
            defaultValue: 'Comparing real verified cooperative worker availability against trade category demand.',
          })}
        </p>
      </div>

      {/* Capacity Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="w-4 h-4" />
            <span className="text-[11px] font-medium uppercase tracking-wider">
              {t('federation.capacity.totalWorkers', { defaultValue: 'Registered' })}
            </span>
          </div>
          <div className="text-2xl font-black text-foreground font-mono">
            {capacity.totalRegisteredWorkers}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[11px] font-medium uppercase tracking-wider">
              {t('federation.capacity.verifiedWorkers', { defaultValue: 'Active & Verified' })}
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
            {capacity.verifiedWorkers}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 shadow-xs">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-[11px] font-medium uppercase tracking-wider">
              {t('federation.capacity.pendingWorkers', { defaultValue: 'Pending Verification' })}
            </span>
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono">
            {capacity.pendingWorkers}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 shadow-xs">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-[11px] font-medium uppercase tracking-wider">
              {t('federation.capacity.onlineWorkers', { defaultValue: 'Online / Available' })}
            </span>
          </div>
          <div className="text-2xl font-black text-blue-700 dark:text-blue-300 font-mono">
            {capacity.activeOnlineWorkers}
          </div>
        </div>
      </div>

      {/* Critical Gaps Warning Banner if Any */}
      {deficientCategories.length > 0 && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-destructive">
              {t('federation.capacity.zeroWorkerAlert', {
                count: deficientCategories.length,
                defaultValue: `Deficit Alert: ${deficientCategories.length} Categories have 0 Active Workers`,
              })}
            </h4>
            <p className="text-xs text-destructive/90">
              The following trades have no verified workers and cannot fulfill dispatch requests:{' '}
              <span className="font-bold">
                {deficientCategories.map((c) => c.categoryName).join(', ')}
              </span>
              . Recruitment and onboarding verification should be prioritized immediately.
            </p>
          </div>
        </div>
      )}

      {/* Category Gap Breakdown Grid */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-foreground">
          {t('federation.capacity.tradeDistribution', { defaultValue: 'Trade Capacity Distribution Matrix' })}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const hasWorkers = cat.verifiedWorkers > 0
            const isDeficit = cat.verifiedWorkers === 0
            const isHighDemand = cat.totalJobs > 5

            return (
              <div
                key={cat.categoryId}
                className={cn(
                  'p-4 rounded-xl border transition-all space-y-3',
                  isDeficit
                    ? 'border-destructive/30 bg-destructive/5'
                    : hasWorkers
                    ? 'border-border bg-muted/10'
                    : 'border-border bg-card'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-foreground">{cat.categoryName}</div>
                  {isDeficit ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">
                      <AlertTriangle className="w-3 h-3" />
                      {t('federation.capacity.deficitBadge', { defaultValue: 'CRITICAL SHORTAGE' })}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      {t('federation.capacity.coveredBadge', { defaultValue: 'ACTIVE COVERAGE' })}
                    </span>
                  )}
                </div>

                {/* Progress ratio of jobs to workers */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-muted-foreground">
                    <span>{t('federation.capacity.verifiedCapacity', { defaultValue: 'Verified Workforce' })}</span>
                    <span className="font-bold text-foreground">{cat.verifiedWorkers} workers</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        isDeficit ? 'bg-destructive' : 'bg-primary'
                      )}
                      style={{
                        width: `${Math.min(100, (cat.verifiedWorkers / Math.max(1, capacity.verifiedWorkers)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      {t('federation.capacity.historicalJobs', { defaultValue: 'Historical Jobs' })}
                    </span>
                    <span className="font-bold font-mono text-foreground">{cat.totalJobs}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      {t('federation.capacity.statusAssessment', { defaultValue: 'Status Assessment' })}
                    </span>
                    <span className="font-medium text-foreground">
                      {isDeficit
                        ? 'Recruitment Needed'
                        : isHighDemand
                        ? 'High Demand Trade'
                        : 'Adequate'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
