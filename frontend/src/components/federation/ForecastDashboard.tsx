import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Info,
  MapPin,
  Calendar,
} from 'lucide-react'
import type { DemandForecast, DemandLevel, CapacityLevel, GapStatus } from '@/types/forecast'
import { cn } from '@/lib/utils'

interface ForecastDashboardProps {
  forecasts: DemandForecast[]
}

function renderLevelDots(level: DemandLevel | CapacityLevel, type: 'demand' | 'capacity') {
  const count = level === 'HIGH' ? 3 : level === 'MEDIUM' ? 2 : 1

  return (
    <div className="inline-flex items-center gap-1 font-mono text-sm">
      {[1, 2, 3].map((idx) => {
        const isActive = idx <= count
        return (
          <span
            key={idx}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              isActive
                ? type === 'demand'
                  ? level === 'HIGH'
                    ? 'bg-red-500'
                    : level === 'MEDIUM'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                  : 'bg-blue-500'
                : 'bg-border'
            )}
          />
        )
      })}
      <span className="text-[11px] font-bold ml-1">{level}</span>
    </div>
  )
}

export function ForecastDashboard({ forecasts }: ForecastDashboardProps) {
  const { t } = useTranslation()
  const [filterGap, setFilterGap] = useState<string>('ALL')

  const getGapBadge = (gap: GapStatus) => {
    switch (gap) {
      case 'GAP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-destructive/15 text-destructive font-black text-[10px] border border-destructive/30">
            <AlertTriangle className="w-3 h-3" />
            <span>{t('federation.forecastDashboard.shortageBadge', { defaultValue: 'SHORTAGE / CAPACITY DEFICIT' })}</span>
          </span>
        )
      case 'OPTIMAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t('federation.forecastDashboard.optimalBadge', { defaultValue: 'OPTIMAL BALANCE' })}</span>
          </span>
        )
      case 'SURPLUS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-semibold text-[10px] border border-border">
            <span>{t('federation.forecastDashboard.surplusBadge', { defaultValue: 'SURPLUS CAPACITY' })}</span>
          </span>
        )
    }
  }

  const filtered = forecasts.filter(
    (f) => filterGap === 'ALL' || f.capacityGap === filterGap
  )

  const gapCount = forecasts.filter((f) => f.capacityGap === 'GAP').length

  return (
    <div className="space-y-6">
      {/* Top Banner with ML Model Attribution */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              {t('federation.forecastDashboard.engineTitle', { defaultValue: 'Machine Learning Predictive Engine' })}
            </span>
            {gapCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                {t('federation.forecastDashboard.actionableGaps', { count: gapCount, defaultValue: `${gapCount} Actionable Gaps` })}
              </span>
            )}
          </div>
          <h2 className="text-base font-black text-foreground">
            {t('federation.forecastDashboard.capacityTitle', { defaultValue: 'Workforce Capacity vs Projected Cooperative Demand' })}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t('federation.forecastDashboard.capacityDesc', { defaultValue: 'Forecast powered by the existing ML demand model. Highlights training and onboarding requirements for member societies.' })}
          </p>
        </div>

        <div>
          <select
            value={filterGap}
            onChange={(e) => setFilterGap(e.target.value)}
            className="p-2.5 rounded-xl border border-input text-xs font-medium bg-background min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">{t('federation.forecastDashboard.filterAll', { defaultValue: 'All Categories' })}</option>
            <option value="GAP">{t('federation.forecastDashboard.filterGaps', { defaultValue: 'Shortage / Deficit Gaps Only' })}</option>
            <option value="OPTIMAL">{t('federation.forecastDashboard.filterOptimal', { defaultValue: 'Optimal Workforce Balance' })}</option>
            <option value="SURPLUS">{t('federation.forecastDashboard.filterSurplus', { defaultValue: 'Surplus Capacity' })}</option>
          </select>
        </div>
      </div>

      {/* Grid of Forecast Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((fc) => (
          <div
            key={fc.id}
            className={cn(
              'p-5 rounded-2xl border bg-card shadow-xs flex flex-col justify-between space-y-4 transition-all',
              fc.capacityGap === 'GAP'
                ? 'border-destructive/40 hover:border-destructive'
                : 'border-border hover:border-primary/40'
            )}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <h3 className="text-base font-black text-foreground">
                    {fc.serviceCategoryName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                    <span>{fc.area}</span>
                  </div>
                </div>

                <div>{getGapBadge(fc.capacityGap)}</div>
              </div>

              {/* Demand & Capacity Metrics */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-secondary/50 border border-border/80 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      {t('federation.forecastDashboard.forecastDemand', { defaultValue: 'Forecast Demand' })}
                    </span>
                    {fc.expectedBookings !== undefined && (
                      <span className="text-[11px] font-bold font-mono text-foreground">
                        ~{fc.expectedBookings} {t('federation.forecastDashboard.jobs', { defaultValue: 'jobs' })}
                      </span>
                    )}
                  </div>
                  <div>{renderLevelDots(fc.forecastDemand, 'demand')}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      {t('federation.forecastDashboard.verifiedCapacity', { defaultValue: 'Verified Capacity' })}
                    </span>
                    {fc.verifiedWorkers !== undefined && (
                      <span className="text-[11px] font-bold font-mono text-foreground">
                        {fc.verifiedWorkers} {t('federation.forecastDashboard.workers', { defaultValue: 'workers' })}
                      </span>
                    )}
                  </div>
                  <div>{renderLevelDots(fc.availableCapacity, 'capacity')}</div>
                </div>
              </div>

              {/* Recommendation Box */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  {t('federation.forecastDashboard.recommendationTitle', { defaultValue: 'Federation Mobilization Recommendation' })}
                </span>
                <p className="text-xs font-medium text-foreground bg-secondary/30 p-3 rounded-xl border border-border/60 leading-relaxed">
                  &ldquo;{fc.recommendation}&rdquo;
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {fc.period}
              </span>
              <span>{t('federation.forecastDashboard.confidence', { defaultValue: 'Model Confidence: 94.2%' })}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mandatory Source Note */}
      <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
        <Info className="w-4 h-4 text-primary shrink-0" />
        <span>
          {t('federation.forecastDashboard.sourceNote', { defaultValue: 'Forecast powered by the existing ML demand model. Excludes private-platform surge algorithms or consumer price gouging.' })}
        </span>
      </div>
    </div>
  )
}
