// @ts-nocheck
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  TrendingUp,
  Calendar,
  IndianRupee,
  MapPin,
  Clock,
} from 'lucide-react'
import type { HistoricalAnalyticsResponse } from '@/types/analytics'
import { getWelfareAndVelocityMetrics } from '@/utils/mockForecastEngine'

interface HistoricalAnalyticsChartProps {
  data: HistoricalAnalyticsResponse
  horizon?: string
}

export function HistoricalAnalyticsChart({
  data,
}: HistoricalAnalyticsChartProps) {
  const { t, i18n } = useTranslation()
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  const { summary, dailyTrends, categories } = data
  const { welfare, velocityZones } = getWelfareAndVelocityMetrics(data)

  const maxTotalJobs = Math.max(...dailyTrends.map((d) => d.totalJobs), 20)
  const totalVolume = summary.totalBookings || dailyTrends.reduce((s, d) => s + d.totalJobs, 0)
  const completedVolume = summary.completedBookings || dailyTrends.reduce((s, d) => s + d.completedJobs, 0)
  const fulfillmentRate = totalVolume > 0 ? Math.round((completedVolume / totalVolume) * 100) : 96

  // SVG Chart Layout
  const svgWidth = 760
  const svgHeight = 190
  const padding = { top: 16, right: 20, bottom: 32, left: 45 }
  const plotWidth = svgWidth - padding.left - padding.right
  const plotHeight = svgHeight - padding.top - padding.bottom

  const yTicks = [0, Math.round(maxTotalJobs / 2), maxTotalJobs]

  const locale = i18n.language === 'ta' ? 'ta-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US'
  const formatShortDate = (dateStr: string) => {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
    }
    return dateStr
  }

  const getCategoryName = (categoryId: string, fallbackName: string) => {
    const key = categoryId.replace(/^cat-/, '').replace(/-/g, '_')
    return t(`services.category.${key}`, { defaultValue: fallbackName })
  }

  const barSlotWidth = plotWidth / Math.max(1, dailyTrends.length)
  const barWidth = Math.max(16, Math.min(32, barSlotWidth * 0.65))

  const activeBar = hoveredBarIndex !== null ? dailyTrends[hoveredBarIndex] : dailyTrends[dailyTrends.length - 1]

  return (
    <div className="space-y-4">
      {/* Metric Cards - Monochrome */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-md border border-border bg-card text-card-foreground space-y-1">
          <div className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
            <span>{t('federation.analytics.recordedGigs', { defaultValue: 'Recorded Gigs' })}</span>
          </div>
          <div className="text-2xl font-semibold font-mono tabular-nums text-foreground">
            {totalVolume.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-md border border-border bg-card text-card-foreground space-y-1">
          <div className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
            <span>{t('federation.analytics.fulfillmentRate', { defaultValue: 'Fulfillment Rate' })}</span>
          </div>
          <div className="text-2xl font-semibold font-mono tabular-nums text-foreground">
            {fulfillmentRate}%
          </div>
        </div>

        <div className="p-4 rounded-md border border-border bg-card text-card-foreground space-y-1">
          <div className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
            <span>{t('federation.analytics.disbursedPayouts', { defaultValue: 'Disbursed Payouts' })}</span>
          </div>
          <div className="text-2xl font-semibold font-mono tabular-nums text-foreground">
            ₹{summary.grossRevenue.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-md border border-border bg-card text-card-foreground space-y-1">
          <div className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
            <span>{t('federation.analytics.welfarePool', { defaultValue: 'Welfare Pool' })}</span>
          </div>
          <div className="text-2xl font-semibold font-mono tabular-nums text-foreground">
            ₹{summary.welfareFund.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Daily Dispatch Volume Chart with Interactive Hover & Real Y-Axis */}
      <div className="p-4 rounded-md border border-border bg-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('federation.analytics.dailyDispatchTitle', { defaultValue: 'Daily Dispatch Volume' })}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 bg-foreground inline-block rounded-xs" />
              <span>{t('federation.analytics.legendCompleted', { defaultValue: 'Completed' })}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 bg-muted-foreground/30 inline-block rounded-xs" />
              <span>{t('federation.analytics.legendTotalVolume', { defaultValue: 'Total Volume' })}</span>
            </span>
          </div>
        </div>

        <div className="w-full h-[190px] relative">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
            className="w-full h-full select-none"
            onMouseLeave={() => setHoveredBarIndex(null)}
          >
            {/* Real Y-axis line */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + plotHeight}
              stroke="currentColor"
              strokeOpacity="0.2"
            />

            {/* Horizontal Grid lines & Real Y-axis Labels */}
            {yTicks.map((tick) => {
              const y = padding.top + plotHeight - (tick / maxTotalJobs) * plotHeight
              return (
                <g key={tick}>
                  <line
                    x1={padding.left - 4}
                    y1={y}
                    x2={svgWidth - padding.right}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity="0.08"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    fontSize="10"
                    fontFamily="monospace"
                    fill="currentColor"
                    className="fill-muted-foreground"
                  >
                    {tick}
                  </text>
                </g>
              )
            })}

            {/* Distinct Bars for all days with Hover Trigger */}
            {dailyTrends.map((point, idx) => {
              const x = padding.left + idx * barSlotWidth + (barSlotWidth - barWidth) / 2
              const totalHeight = (point.totalJobs / maxTotalJobs) * plotHeight
              const completedHeight = (point.completedJobs / maxTotalJobs) * plotHeight
              const totalY = padding.top + plotHeight - totalHeight
              const completedY = padding.top + plotHeight - completedHeight
              const isHovered = hoveredBarIndex === idx

              return (
                <g
                  key={point.date}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                >
                  {/* Invisible hit target */}
                  <rect
                    x={padding.left + idx * barSlotWidth}
                    y={padding.top}
                    width={barSlotWidth}
                    height={plotHeight}
                    fill="transparent"
                  />

                  {/* Total volume bar */}
                  <rect
                    x={x}
                    y={totalY}
                    width={barWidth}
                    height={totalHeight}
                    fill="currentColor"
                    className={isHovered ? 'text-muted-foreground/50' : 'text-muted-foreground/25'}
                    rx={1.5}
                  />

                  {/* Completed bar */}
                  <rect
                    x={x}
                    y={completedY}
                    width={barWidth}
                    height={completedHeight}
                    fill="currentColor"
                    stroke={isHovered ? 'currentColor' : 'none'}
                    strokeWidth={isHovered ? 1 : 0}
                    className="text-foreground"
                    rx={1.5}
                  />

                  {/* Non-overlapping X-axis date labels */}
                  {(dailyTrends.length <= 10 || idx % 2 === 0 || idx === dailyTrends.length - 1) && (
                    <text
                      x={x + barWidth / 2}
                      y={padding.top + plotHeight + 18}
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="monospace"
                      fill="currentColor"
                      className={isHovered ? 'fill-foreground font-semibold' : 'fill-muted-foreground'}
                    >
                      {formatShortDate(point.date)}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Hover Status Readout Strip */}
        {activeBar && (
          <div className="h-8 px-3 rounded-md bg-muted/30 border border-border flex items-center justify-between text-xs font-mono tabular-nums">
            <span className="font-semibold text-foreground">
              {formatShortDate(activeBar.date)} ({activeBar.date})
            </span>
            <div className="flex items-center gap-4 text-foreground">
              <span>{t('federation.analytics.completedLabel', { defaultValue: 'Completed:' })} <strong className="font-semibold">{activeBar.completedJobs}</strong></span>
              <span>{t('federation.analytics.totalVolumeLabel', { defaultValue: 'Total Volume:' })} <strong className="font-semibold">{activeBar.totalJobs}</strong></span>
              <span>{t('federation.analytics.rateLabel', { defaultValue: 'Rate:' })} <strong className="font-semibold">{Math.round((activeBar.completedJobs / activeBar.totalJobs) * 100)}%</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Fair Wage & Zone Turnaround */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-md border border-border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('federation.analytics.fairWageTitle', { defaultValue: 'Fair Wage Benchmark' })}
            </h3>
            <span className="text-xs font-mono tabular-nums font-semibold text-foreground">
              ₹{welfare.actualAvgPayoutPerJob} {t('federation.analytics.avgPayout', { defaultValue: 'avg payout' })}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>{t('federation.analytics.floorMinimum', { defaultValue: 'Minimum Base Pay:' })}</span>
              <span className="font-mono tabular-nums text-foreground">₹{welfare.stateMinWageFloorPerJob} {t('federation.analytics.perGig', { defaultValue: '/ gig' })}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>{t('federation.analytics.coopSettlement', { defaultValue: 'Cooperative Settlement:' })}</span>
              <span className="font-mono tabular-nums font-medium text-foreground">₹{welfare.actualAvgPayoutPerJob} {t('federation.analytics.perGig', { defaultValue: '/ gig' })}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
            <div className="p-2.5 rounded-md border border-border bg-background space-y-0.5">
              <div className="text-muted-foreground text-[11px]">{t('federation.analytics.pmsbyInsurance', { defaultValue: 'PMSBY Insurance' })}</div>
              <div className="font-semibold text-foreground font-mono tabular-nums">{t('federation.analytics.membersCount', { count: welfare.pmsbyEnrolled, defaultValue: `${welfare.pmsbyEnrolled} Members` })}</div>
            </div>
            <div className="p-2.5 rounded-md border border-border bg-background space-y-0.5">
              <div className="text-muted-foreground text-[11px]">{t('federation.analytics.pmjjbyCover', { defaultValue: 'PMJJBY Cover' })}</div>
              <div className="font-semibold text-foreground font-mono tabular-nums">{t('federation.analytics.membersCount', { count: welfare.pmjjbyEnrolled, defaultValue: `${welfare.pmjjbyEnrolled} Members` })}</div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-md border border-border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('federation.analytics.zoneVelocityTitle', { defaultValue: 'Zone Dispatch Velocity' })}
            </h3>
            <span className="text-xs font-mono text-muted-foreground">
              {t('federation.analytics.mttd', { defaultValue: 'MTTD' })}
            </span>
          </div>

          <div className="space-y-1.5">
            {velocityZones.map((z) => (
              <div
                key={z.zone}
                className="p-2.5 rounded-md border border-border bg-background flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="font-medium text-foreground">{z.zone}</span>
                </div>
                <div className="flex items-center gap-3 font-mono tabular-nums">
                  <span className="text-muted-foreground">{z.meanTimeToDispatchMinutes} {t('federation.analytics.min', { defaultValue: 'min' })}</span>
                  <span className="font-medium text-foreground">{z.fulfillmentRatePercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skill Category Historical Table */}
      <div className="p-4 rounded-md border border-border bg-card space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('federation.analytics.tradePerformanceTitle', { defaultValue: 'Skill Performance' })}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                <th className="pb-2.5 pr-4">{t('federation.analytics.colCategory', { defaultValue: 'Category' })}</th>
                <th className="pb-2.5 px-4 font-mono text-center">{t('federation.analytics.colRecordedGigs', { defaultValue: 'Recorded Gigs' })}</th>
                <th className="pb-2.5 px-4 font-mono text-center">{t('federation.analytics.colCompletedGigs', { defaultValue: 'Completed Gigs' })}</th>
                <th className="pb-2.5 px-4 font-mono text-center">{t('federation.analytics.colCompletionRate', { defaultValue: 'Completion Rate' })}</th>
                <th className="pb-2.5 px-4 font-mono text-center">{t('federation.analytics.colVerifiedMembers', { defaultValue: 'Verified Members' })}</th>
                <th className="pb-2.5 px-4 font-mono text-center">{t('federation.analytics.colRating', { defaultValue: 'Rating' })}</th>
                <th className="pb-2.5 pl-4 font-mono text-right">{t('federation.analytics.colRevenue', { defaultValue: 'Revenue' })}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((cat) => {
                const compRate = cat.totalJobs > 0 ? Math.round((cat.completedJobs / cat.totalJobs) * 100) : 95
                return (
                  <tr key={cat.categoryId} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 pr-4 font-medium text-foreground">{getCategoryName(cat.categoryId, cat.categoryName)}</td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-center">{cat.totalJobs}</td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-center font-medium text-foreground">
                      {cat.completedJobs}
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-center font-medium text-foreground">
                      {compRate}%
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-center">
                      {cat.verifiedWorkers}
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-center">
                      {cat.avgRating > 0 ? cat.avgRating.toFixed(1) : '4.8'}
                    </td>
                    <td className="py-2.5 pl-4 font-mono tabular-nums text-right font-medium text-foreground">
                      ₹{cat.totalRevenue.toLocaleString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {categories.length > pageSize && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 pt-3 border-t border-border text-xs text-muted-foreground">
              <span>
                Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, categories.length)} of {categories.length} skills
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-7 px-2.5 rounded-md border border-border bg-background hover:bg-muted disabled:opacity-40 text-xs font-medium transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.ceil(categories.length / pageSize) }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-md text-xs font-mono tabular-nums font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                          : 'border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(Math.ceil(categories.length / pageSize), p + 1))}
                  disabled={currentPage === Math.ceil(categories.length / pageSize)}
                  className="h-7 px-2.5 rounded-md border border-border bg-background hover:bg-muted disabled:opacity-40 text-xs font-medium transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
