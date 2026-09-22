import { useTranslation } from 'react-i18next'
import {
  TrendingUp,
  Calendar,
  CheckCircle2,
  AlertOctagon,
  IndianRupee,
  Star,
  Award,
} from 'lucide-react'
import type { HistoricalAnalyticsResponse } from '@/types/analytics'
import { cn } from '@/lib/utils'

interface HistoricalAnalyticsChartProps {
  data: HistoricalAnalyticsResponse
  selectedDays: number
  onSelectDays: (days: number) => void
}

export function HistoricalAnalyticsChart({
  data,
  selectedDays,
  onSelectDays,
}: HistoricalAnalyticsChartProps) {
  const { t } = useTranslation()
  const { summary, dailyTrends, categories } = data

  const maxTotalJobs = Math.max(...dailyTrends.map((d) => d.totalJobs), 1)

  return (
    <div className="space-y-6">
      {/* Time-range Selector & KPI Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-foreground">
            {t('federation.analytics.historicalOverview', { defaultValue: 'Historical Service Records & Trends' })}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t('federation.analytics.historicalSubtitle', {
              defaultValue: 'Audited factual activity logs aggregated from actual cooperative dispatches.',
            })}
          </p>
        </div>

        <div className="inline-flex items-center p-1 rounded-xl border border-border bg-muted/30">
          {[7, 14, 30, 60].map((d) => (
            <button
              key={d}
              onClick={() => onSelectDays(d)}
              className={cn(
                'px-3 py-1.5 text-xs font-bold rounded-lg transition-all',
                selectedDays === d
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {d} {t('common.days', { defaultValue: 'Days' })}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium uppercase tracking-wider">
              {t('federation.analytics.totalBookings', { defaultValue: 'Total Jobs' })}
            </span>
          </div>
          <div className="text-xl font-black text-foreground font-mono">{summary.totalBookings}</div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium uppercase tracking-wider">
              {t('federation.analytics.completed', { defaultValue: 'Completed' })}
            </span>
          </div>
          <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
            {summary.completedBookings}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 shadow-xs">
          <div className="flex items-center gap-2 text-destructive mb-1">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium uppercase tracking-wider">
              {t('federation.analytics.emergency', { defaultValue: 'Emergency' })}
            </span>
          </div>
          <div className="text-xl font-black text-destructive font-mono">
            {summary.emergencyBookings}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <IndianRupee className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium uppercase tracking-wider">
              {t('federation.analytics.grossRevenue', { defaultValue: 'Gross Revenue' })}
            </span>
          </div>
          <div className="text-xl font-black text-foreground font-mono">
            ₹{summary.grossRevenue.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Award className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium uppercase tracking-wider">
              {t('federation.analytics.welfareFund', { defaultValue: 'Welfare Fund' })}
            </span>
          </div>
          <div className="text-xl font-black text-primary font-mono">
            ₹{summary.welfareFund.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-[11px] font-medium uppercase tracking-wider">
              {t('federation.analytics.avgRating', { defaultValue: 'Avg Rating' })}
            </span>
          </div>
          <div className="text-xl font-black text-foreground font-mono">
            {summary.averageRating > 0 ? summary.averageRating.toFixed(1) : '—'}
          </div>
        </div>
      </div>

      {/* Daily Volume Trend Chart */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              {t('federation.analytics.dailyVolumeTrend', { defaultValue: 'Daily Dispatch Volume' })}
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
              {t('federation.analytics.total', { defaultValue: 'Total' })}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              {t('federation.analytics.completed', { defaultValue: 'Completed' })}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              {t('federation.analytics.emergency', { defaultValue: 'Emergency' })}
            </span>
          </div>
        </div>

        {/* CSS Flex Bar Chart */}
        <div className="h-44 flex items-end gap-1.5 pt-6 pb-2 px-1 border-b border-border overflow-x-auto">
          {dailyTrends.map((point) => {
            const heightPercent = Math.max(8, (point.totalJobs / maxTotalJobs) * 100)
            const dateLabel = point.date.slice(5) // MM-DD
            return (
              <div
                key={point.date}
                className="flex-1 min-w-[20px] flex flex-col items-center gap-1.5 group relative"
              >
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-popover text-popover-foreground text-[10px] font-mono p-1.5 rounded-md shadow-md border border-border whitespace-nowrap">
                  <div>{point.date}</div>
                  <div className="text-primary font-bold">{point.totalJobs} jobs</div>
                </div>

                <div
                  className="w-full rounded-t-sm transition-all bg-primary/20 group-hover:bg-primary/40 relative flex items-end justify-center"
                  style={{ height: `${heightPercent}%` }}
                >
                  {point.emergencyJobs > 0 && (
                    <div
                      className="w-full bg-destructive rounded-t-xs"
                      style={{ height: `${(point.emergencyJobs / point.totalJobs) * 100}%` }}
                    />
                  )}
                  {point.completedJobs > 0 && (
                    <div
                      className="w-full bg-emerald-500 rounded-t-xs"
                      style={{ height: `${(point.completedJobs / point.totalJobs) * 100}%` }}
                    />
                  )}
                </div>
                <span className="text-[9px] font-mono text-muted-foreground rotate-45 origin-left truncate w-4">
                  {dateLabel}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Trade Category Historical Breakdown Table */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-foreground">
          {t('federation.analytics.categoryPerformance', { defaultValue: 'Trade Category Historical Performance' })}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-semibold">
                <th className="pb-3 pr-4">{t('federation.analytics.category', { defaultValue: 'Category' })}</th>
                <th className="pb-3 px-4 font-mono text-center">{t('federation.analytics.jobsCount', { defaultValue: 'Recorded Jobs' })}</th>
                <th className="pb-3 px-4 font-mono text-center">{t('federation.analytics.completedCount', { defaultValue: 'Completed' })}</th>
                <th className="pb-3 px-4 font-mono text-center">{t('federation.analytics.activeWorkforce', { defaultValue: 'Verified Workers' })}</th>
                <th className="pb-3 px-4 font-mono text-center">{t('federation.analytics.rating', { defaultValue: 'Avg Rating' })}</th>
                <th className="pb-3 pl-4 font-mono text-right">{t('federation.analytics.revenue', { defaultValue: 'Revenue' })}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat) => (
                <tr key={cat.categoryId} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 pr-4 font-semibold text-foreground">{cat.categoryName}</td>
                  <td className="py-3 px-4 font-mono text-center">{cat.totalJobs}</td>
                  <td className="py-3 px-4 font-mono text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      {cat.completedJobs}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-center">
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-foreground font-bold">
                      {cat.verifiedWorkers}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-center">
                    {cat.avgRating > 0 ? (
                      <span className="inline-flex items-center gap-1 font-bold">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {cat.avgRating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 pl-4 font-mono text-right font-bold text-foreground">
                    ₹{cat.totalRevenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
