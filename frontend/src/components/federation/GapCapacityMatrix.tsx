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
            defaultValue: 'Comparing real verified cooperative worker availability against skill demand.',
          })}
        </p>
      </div>

      {/* Capacity Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-md border border-border bg-card space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium uppercase tracking-wider">
              {t('federation.capacity.totalWorkers', { defaultValue: 'Registered' })}
            </span>
          </div>
          <div className="text-2xl font-semibold text-foreground font-mono tabular-nums">
            {capacity.totalRegisteredWorkers}
          </div>
        </div>

        <div className="p-4 rounded-md border border-border bg-card space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] font-medium uppercase tracking-wider">
              {t('federation.capacity.verifiedWorkers', { defaultValue: 'Active & Verified' })}
            </span>
          </div>
          <div className="text-2xl font-semibold text-foreground font-mono tabular-nums">
            {capacity.verifiedWorkers}
          </div>
        </div>

        <div className="p-4 rounded-md border border-border bg-card space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
            <span className="text-[11px] font-medium uppercase tracking-wider">
              {t('federation.capacity.pendingWorkers', { defaultValue: 'Pending Verification' })}
            </span>
          </div>
          <div className="text-2xl font-semibold text-foreground font-mono tabular-nums">
            {capacity.pendingWorkers}
          </div>
        </div>

        <div className="p-4 rounded-md border border-border bg-card space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium uppercase tracking-wider">
              {t('federation.capacity.onlineWorkers', { defaultValue: 'Online Available' })}
            </span>
          </div>
          <div className="text-2xl font-semibold text-foreground font-mono tabular-nums">
            {capacity.activeOnlineWorkers}
          </div>
        </div>
      </div>

      {/* Critical Gaps Warning Banner if Any */}
      {deficientCategories.length > 0 && (
        <div className="p-3.5 rounded-md border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-rose-700 dark:text-rose-300">
              {t('federation.capacity.zeroWorkerAlert', {
                count: deficientCategories.length,
                defaultValue: `Deficit Alert: ${deficientCategories.length} Categories have 0 Active Workers`,
              })}
            </h4>
            <p className="text-xs text-rose-600 dark:text-rose-400/90 leading-relaxed">
              The following skills have no verified workers and cannot fulfill dispatch requests:{' '}
              <span className="font-semibold">
                {deficientCategories.map((c) => c.categoryName).join(', ')}
              </span>
              . Prioritize recruitment and onboarding verification.
            </p>
          </div>
        </div>
      )}

      {/* Category Gap Breakdown Grid */}
      <div className="p-4 rounded-md border border-border bg-card space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('federation.capacity.tradeDistribution', { defaultValue: 'Skill Availability Matrix' })}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map((cat) => {
            const isDeficit = cat.verifiedWorkers === 0
            const isHighDemand = cat.totalJobs > 5

            return (
              <div
                key={cat.categoryId}
                className={cn(
                  'p-3.5 rounded-md border transition-colors space-y-2.5',
                  isDeficit
                    ? 'border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20'
                    : 'border-border bg-background'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-foreground">{cat.categoryName}</div>
                  {isDeficit ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                      <AlertTriangle className="w-3 h-3" />
                      {t('federation.capacity.deficitBadge', { defaultValue: 'CRITICAL SHORTAGE' })}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      {t('federation.capacity.coveredBadge', { defaultValue: 'ACTIVE' })}
                    </span>
                  )}
                </div>

                {/* Progress ratio of jobs to workers */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono tabular-nums text-muted-foreground text-[11px]">
                    <span>{t('federation.capacity.verifiedCapacity', { defaultValue: 'Verified Workforce' })}</span>
                    <span className="font-medium text-foreground">{cat.verifiedWorkers} members</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded transition-all',
                        isDeficit ? 'bg-rose-600' : 'bg-foreground'
                      )}
                      style={{
                        width: `${Math.min(100, (cat.verifiedWorkers / Math.max(1, capacity.verifiedWorkers)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-medium">
                      {t('federation.capacity.historicalJobs', { defaultValue: 'Historical Jobs' })}
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-foreground text-xs">{cat.totalJobs}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-medium">
                      {t('federation.capacity.statusAssessment', { defaultValue: 'Status' })}
                    </span>
                    <span className="font-medium text-foreground text-xs">
                      {isDeficit
                        ? 'Recruitment Needed'
                        : isHighDemand
                        ? 'High Demand'
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
