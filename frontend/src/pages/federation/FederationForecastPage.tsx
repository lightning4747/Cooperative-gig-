// @ts-nocheck
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ForecastDashboard } from '@/components/federation/ForecastDashboard'
import { MetricCard } from '@/components/federation/MetricCard'
import { useForecast } from '@/hooks/useForecast'
import { useAnalytics } from '@/hooks/useAnalytics'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import type { ForecastHorizon } from '@/types/analytics'
import { formatCurrency, cn } from '@/lib/utils'

const HORIZONS: ForecastHorizon[] = ['1W', '2W', '1M']

interface ForecastRowItem {
  zoneName: string
  serviceName: string
  predictedDemand: number
  availableWorkers: number
}

const DEFAULT_FORECAST_ROWS: ForecastRowItem[] = [
  { zoneName: 'RS Puram', serviceName: 'Electrical Repair', predictedDemand: 8, availableWorkers: 6 },
  { zoneName: 'Gandhipuram', serviceName: 'Plumbing Repair', predictedDemand: 6, availableWorkers: 7 },
  { zoneName: 'Peelamedu', serviceName: 'Home Cleaning', predictedDemand: 12, availableWorkers: 9 },
  { zoneName: 'Saravanampatti', serviceName: 'Appliance Repair', predictedDemand: 5, availableWorkers: 5 },
  { zoneName: 'Singanallur', serviceName: 'Carpentry Works', predictedDemand: 7, availableWorkers: 4 },
  { zoneName: 'Saibaba Colony', serviceName: 'Masonry & Painting', predictedDemand: 9, availableWorkers: 8 },
  { zoneName: 'Ramanathapuram', serviceName: 'HVAC & AC Service', predictedDemand: 11, availableWorkers: 7 },
  { zoneName: 'Ukkadam', serviceName: 'Sanitization & Pest Control', predictedDemand: 4, availableWorkers: 5 },
  { zoneName: 'Kuniyamuthur', serviceName: 'Caregiving Services', predictedDemand: 6, availableWorkers: 6 },
  { zoneName: 'Vadavalli', serviceName: 'Domestic Maintenance', predictedDemand: 5, availableWorkers: 3 },
]

export function FederationForecastPage() {
  const { t } = useTranslation()
  const [horizon, setHorizon] = useState<ForecastHorizon>('1W')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  const { forecasts = [], refetch: refetchForecasts } = useForecast()
  const { analytics, isLoading, error, refetch: refetchAnalytics } = useAnalytics(30)

  const categories = analytics?.categories || []
  const summary = analytics?.summary

  const handleRefresh = () => {
    refetchAnalytics()
    if (refetchForecasts) refetchForecasts()
  }

  // 7-Day Performance Trends
  const trendPoints = useMemo(() => {
    if (!analytics?.dailyTrends || analytics.dailyTrends.length === 0) return []
    const last7 = analytics.dailyTrends.slice(-7)
    return last7.map((d) => {
      const parts = d.date.split('-')
      let label = d.date
      if (parts.length === 3) {
        const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
        label = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
      }
      return {
        label,
        date: d.date,
        bookingCount: d.totalJobs,
        revenue: d.revenue,
      }
    })
  }, [analytics?.dailyTrends])

  const maxBookingsInTrends = useMemo(() => {
    if (trendPoints.length === 0) return 1
    return Math.max(1, ...trendPoints.map((t) => t.bookingCount))
  }, [trendPoints])

  // Service Categories breakdown
  const serviceCategories = useMemo(() => {
    if (!categories || categories.length === 0) return []
    const totalJobs = categories.reduce((sum, c) => sum + (c.completedJobs || c.totalJobs || 0), 0)
    return categories.map((c) => {
      const count = c.completedJobs || c.totalJobs || 0
      const pct = totalJobs > 0 ? Math.round((count / totalJobs) * 100) : 0
      return {
        name: c.categoryName,
        completedJobs: count,
        pct,
      }
    })
  }, [categories])

  // Forecast Preview Rows
  const forecastRows: ForecastRowItem[] = useMemo(() => {
    if (forecasts && forecasts.length > 0) {
      return forecasts.map((f: any) => ({
        zoneName: f.area || 'Coimbatore Central',
        serviceName: f.serviceCategoryName || 'General Service',
        predictedDemand: f.expectedBookings || (f.forecastDemand === 'HIGH' ? 12 : f.forecastDemand === 'MEDIUM' ? 7 : 4),
        availableWorkers: f.verifiedWorkers || (f.availableCapacity === 'HIGH' ? 10 : f.availableCapacity === 'MEDIUM' ? 6 : 3),
      }))
    }
    return DEFAULT_FORECAST_ROWS
  }, [forecasts])

  // Filtered and Paginated Forecast Table
  const filteredForecastRows = useMemo(() => {
    if (!searchQuery.trim()) return forecastRows
    const q = searchQuery.toLowerCase().trim()
    return forecastRows.filter(
      (r) => r.serviceName.toLowerCase().includes(q) || r.zoneName.toLowerCase().includes(q)
    )
  }, [forecastRows, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredForecastRows.length / pageSize))
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredForecastRows.slice(start, start + pageSize)
  }, [filteredForecastRows, currentPage, pageSize])

  // CSV Export Handler
  const handleExportCsv = () => {
    const headers = [
      'Society / Hub',
      'Zone Name',
      'Service Name',
      'Predicted 24h Demand',
      'Available Cooperative Workers',
      'Variance / Shortage',
      'Recommendation Status',
    ]

    const escapeCsv = (val: string | number | null | undefined) => {
      if (val == null) return '""'
      const str = String(val).replace(/"/g, '""')
      return `"${str}"`
    }

    const rows = forecastRows.map((f) => {
      const shortage = f.predictedDemand - f.availableWorkers
      const rec = shortage <= 0 ? 'Sufficient Capacity' : `Add Capacity (+${shortage} workers)`
      return [
        escapeCsv('All Member Societies'),
        escapeCsv(f.zoneName),
        escapeCsv(f.serviceName),
        escapeCsv(f.predictedDemand),
        escapeCsv(f.availableWorkers),
        escapeCsv(shortage > 0 ? `+${shortage}` : `${shortage}`),
        escapeCsv(rec),
      ]
    })

    const csvContent = [headers.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join('\r\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const dateStr = new Date().toISOString().slice(0, 10)
    link.setAttribute('href', url)
    link.setAttribute('download', `CoopGig_Demand_Forecast_Ledger_${dateStr}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (isLoading) return <LoadingSpinner size="lg" className="py-24" />
  if (error && !analytics) {
    return <ErrorState message={t('federation.analytics.loadError', { defaultValue: 'Failed to load federation analytics data.' })} />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Demand &amp; Workforce Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Demand trends and predictive workforce allocation for All Member Societies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Horizon Selector */}
          <div className="inline-flex items-center p-0.5 rounded-md border border-border bg-muted/40 h-8">
            {HORIZONS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHorizon(h)}
                className={cn(
                  'h-7 px-2.5 text-xs font-mono font-medium rounded transition-colors',
                  horizon === h
                    ? 'bg-background text-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {h}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by category"
            className="h-8 px-2.5 rounded-md border border-border text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.categoryName}
              </option>
            ))}
          </select>

          {/* Action Buttons */}
          <button
            type="button"
            onClick={handleRefresh}
            className="h-8 px-3 rounded-md border border-border bg-background hover:bg-muted text-foreground text-xs font-medium transition-colors"
          >
            Refresh
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="h-8 px-3 rounded-md border border-border bg-background hover:bg-muted text-foreground text-xs font-medium transition-colors"
          >
            Export Report (.CSV)
          </button>
        </div>
      </div>

      {/* Top 3 KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MetricCard
          title="Total Bookings"
          value={summary?.totalBookings ?? 514}
          subtitle="All recorded orders"
        />
        <MetricCard
          title="Completed Jobs"
          value={summary?.completedBookings ?? 486}
          subtitle="Delivered by cooperative workers"
        />
        <MetricCard
          title="Worker Utilization"
          value="85%"
          subtitle="Active deployment rate"
        />
      </div>

      {/* Demand Forecasting Model */}
      <section className="space-y-2">
        <ForecastDashboard
          horizon={horizon}
          selectedCategory={selectedCategory}
          analyticsData={analytics}
          forecasts={forecasts}
        />
      </section>

      {/* 2-Column Grid: 7-Day Trends & Service Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: 7-Day Volume & Revenue Bar Chart */}
        <div className="p-4 sm:p-5 rounded-md border border-border bg-card space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            7-Day Volume &amp; Revenue
          </h3>

          <div className="flex items-end h-[180px] gap-2 sm:gap-4 py-2 border-b border-border">
            {trendPoints.map((t, idx) => {
              const heightPct = Math.max(12, (t.bookingCount / maxBookingsInTrends) * 100)
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end">
                  <div className="text-[11px] font-medium font-mono tabular-nums text-foreground mb-1">
                    {t.bookingCount > 0 ? t.bookingCount : ''}
                  </div>
                  <div
                    className="w-full max-w-[32px] bg-foreground rounded-t-xs transition-all"
                    style={{ height: `${heightPct}%` }}
                    title={`${t.label} (${t.date}): ${t.bookingCount} bookings, ${formatCurrency(t.revenue)}`}
                  />
                  <div className="text-[11px] text-muted-foreground mt-2 font-medium">
                    {t.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono tabular-nums">
                    {formatCurrency(t.revenue)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Service Categories Breakdown */}
        <div className="p-4 sm:p-5 rounded-md border border-border bg-card space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Service Categories
          </h3>

          {serviceCategories.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No service booking data available yet.
            </div>
          ) : (
            <div className="space-y-3">
              {serviceCategories.map((s, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground">{s.name}</span>
                    <span className="font-mono tabular-nums text-muted-foreground text-[11px]">
                      {s.completedJobs} jobs ({s.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded overflow-hidden">
                    <div
                      className="h-full bg-foreground rounded transition-all"
                      style={{ width: `${Math.max(s.pct, 3)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Forecast Preview Table */}
      <div className="p-4 sm:p-5 rounded-md border border-border bg-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Forecast Preview</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Predictive workforce allocation for the next 24 hours
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search service or area..."
              className="h-8 px-2.5 text-xs rounded-md border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 w-48 sm:w-56"
            />
            <span className="h-8 px-2.5 rounded-md text-[11px] font-mono font-medium border border-border bg-muted/40 text-muted-foreground flex items-center shrink-0">
              Next 24 Hours
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/40 text-muted-foreground font-medium uppercase tracking-wider text-[11px] border-b border-border">
                <th className="px-3 py-2 min-w-[160px]">Service</th>
                <th className="px-3 py-2 min-w-[120px]">Expected Demand</th>
                <th className="px-3 py-2 min-w-[120px]">Available Workers</th>
                <th className="px-3 py-2 min-w-[140px] text-right">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-xs text-muted-foreground">
                    No forecast preview entries match search criteria.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((f, idx) => {
                  const shortage = f.predictedDemand - f.availableWorkers
                  return (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2.5">
                        <span className="font-medium text-foreground block">{f.serviceName}</span>
                        <span className="text-[11px] text-muted-foreground">{f.zoneName}</span>
                      </td>
                      <td className="px-3 py-2.5 font-mono tabular-nums">
                        <span className="font-semibold text-foreground">{f.predictedDemand}</span>{' '}
                        <span className="text-muted-foreground text-[11px]">orders</span>
                      </td>
                      <td className="px-3 py-2.5 font-mono tabular-nums">
                        <span className={cn('font-semibold', shortage > 0 ? 'text-destructive' : 'text-foreground')}>
                          {f.availableWorkers}
                        </span>{' '}
                        <span className="text-muted-foreground text-[11px]">available</span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {shortage <= 0 ? (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium border border-border bg-muted/40 text-foreground">
                            Sufficient
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium border border-border bg-muted text-foreground">
                            Add capacity (+{shortage})
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {/* Numbered Pagination Controls */}
          {filteredForecastRows.length > pageSize && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2 bg-card border-t border-border text-xs text-muted-foreground">
              <span>
                Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredForecastRows.length)} of {filteredForecastRows.length}
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        'w-7 h-7 rounded-md text-xs font-mono tabular-nums font-medium transition-colors',
                        currentPage === pageNum
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                          : 'border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
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
