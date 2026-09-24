import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useFederationDashboard } from '@/hooks/useFederationDashboard'
import { MetricCard } from '@/components/federation/MetricCard'
import { JobDetailFederation } from '@/components/federation/JobDetailFederation'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useJobs } from '@/hooks/useJob'
import type { Job } from '@/types/job'
import {
  getTranslatedCategoryName,
  getTranslatedSubserviceName,
  getTranslatedSocietyName,
  getTranslatedBookingType,
} from '@/lib/serviceTranslation'

const DEFAULT_SOCIETY_LIQUIDITY = [
  {
    id: '00000000-0000-0000-0000-000000000010',
    name: 'Coimbatore City Labour & Artisans Cooperative Society',
    regNo: 'TN-CBE-2023-011',
    liquidity: 142500,
    reserveRatio: '',
    workerCount: 42,
    status: 'ACTIVE',
  },
  {
    id: '00000000-0000-0000-0000-000000000011',
    name: 'RS Puram Cooperative Workers Union',
    regNo: 'TN-CBE-2023-042',
    liquidity: 98200,
    reserveRatio: '',
    workerCount: 28,
    status: 'ACTIVE',
  },
  {
    id: '00000000-0000-0000-0000-000000000012',
    name: 'Peelamedu Cooperative Services Guild',
    regNo: 'TN-CBE-2024-008',
    liquidity: 76400,
    reserveRatio: '',
    workerCount: 21,
    status: 'ACTIVE',
  },
  {
    id: '00000000-0000-0000-0000-000000000013',
    name: 'Saibaba Colony Cooperative Labour Guild',
    regNo: 'TN-CBE-2024-025',
    liquidity: 64000,
    reserveRatio: '',
    workerCount: 16,
    status: 'ACTIVE',
  },
]

export function FederationDashboard() {
  const { t } = useTranslation()
  const { metrics, societies, emergencies, isLoading } = useFederationDashboard()
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const { data: allJobs = [] } = useJobs()

  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  const filteredJobs = allJobs.filter((job) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      job.subserviceName.toLowerCase().includes(q) ||
      job.serviceCategoryName.toLowerCase().includes(q) ||
      job.customerName.toLowerCase().includes(q) ||
      (job.workerName && job.workerName.toLowerCase().includes(q)) ||
      job.status.toLowerCase().includes(q)
    )
  })

  const totalPages = Math.ceil(filteredJobs.length / pageSize) || 1
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Map societies data or fall back to default institutional societies
  const displaySocieties = societies.length > 0
    ? societies.map((s, idx) => ({
        id: s.id || `soc-${idx}`,
        name: s.name,
        regNo: s.registrationNumber || `REG-SOC-00${idx + 1}`,
        liquidity: 85000 + idx * 24000,
        reserveRatio: '',
        workerCount: s.workerCount || 20 + idx * 8,
        status: ('status' in s && typeof s.status === 'string') ? s.status : 'ACTIVE',
      }))
    : DEFAULT_SOCIETY_LIQUIDITY

  if (isLoading) {
    return <LoadingSpinner size="lg" className="py-24" />
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {t('federation.dashboard.title', { defaultValue: 'Federation Operations' })}
          </h1>
          <p className="text-xs text-muted-foreground">
            Cooperative workforce overview and real-time operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/federation/verification"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors h-8"
          >
            <span>Pending Approvals ({metrics?.pendingWorkers ?? 1})</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          title={t('federation.dashboard.activeWorkers', { defaultValue: 'Active Workers' })}
          value={metrics?.activeWorkers ?? 3}
          subtitle="Registered members"
        />

        <MetricCard
          title={t('federation.dashboard.jobsToday', { defaultValue: 'Jobs Today' })}
          value={metrics?.jobsToday ?? 1}
          subtitle="Dispatched today"
        />

        <MetricCard
          title={t('federation.dashboard.availableWorkers', { defaultValue: 'Available Workers' })}
          value={metrics?.availableWorkers ?? 1}
          subtitle="Ready for assignment"
        />

        <MetricCard
          title={t('federation.dashboard.welfarePool', { defaultValue: 'Welfare Pool' })}
          value={formatCurrency(metrics?.welfareBalance ?? 150)}
          subtitle="Member reserve balance"
        />
      </div>

      {/* Split View: Operations Table + Society & Emergency Feeds */}
      <div className="grid grid-cols-1 xl:grid-cols-[68%_32%] gap-4 items-start">
        {/* Left: Live Operations Table with Search & Pagination */}
        <div className="rounded-md border border-border bg-card overflow-hidden shadow-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              {t('federation.dashboard.liveOperations', { defaultValue: 'Live Job Operations' })}
            </h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Filter operations..."
                className="px-2.5 py-1 text-xs rounded-md border border-border bg-background placeholder:text-muted-foreground text-foreground focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 w-44 sm:w-56 h-8"
              />
              <Link
                to="/federation/jobs"
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                View All
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/40 text-muted-foreground font-medium uppercase tracking-wider text-[11px] border-b border-border">
                  <th className="px-4 py-2.5 min-w-[160px]">{t('federation.dashboard.tableService', { defaultValue: 'Service' })}</th>
                  <th className="px-4 py-2.5 min-w-[110px]">{t('federation.dashboard.tableDate', { defaultValue: 'Date' })}</th>
                  <th className="px-4 py-2.5 min-w-[90px]">{t('federation.dashboard.tableType', { defaultValue: 'Type' })}</th>
                  <th className="px-4 py-2.5 min-w-[110px]">{t('federation.dashboard.tableStatus', { defaultValue: 'Status' })}</th>
                  <th className="px-4 py-2.5 min-w-[90px] text-right">{t('federation.dashboard.tableFloorPrice', { defaultValue: 'Base Price' })}</th>
                  <th className="px-4 py-2.5 min-w-[70px] text-right">{t('federation.dashboard.tableAction', { defaultValue: 'Action' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground">
                      {t('federation.dashboard.noJobs', { defaultValue: 'No operations match criteria.' })}
                    </td>
                  </tr>
                ) : (
                  paginatedJobs.map((j) => (
                    <tr
                      key={j.id}
                      className="hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => setSelectedJob(j)}
                    >
                      <td className="px-4 py-2.5">
                        <span className="font-medium text-foreground block truncate">
                          {getTranslatedSubserviceName(t, j.subserviceId, j.subserviceName)}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {getTranslatedCategoryName(t, j.serviceCategoryId, j.serviceCategoryName)}
                        </span>
                      </td>

                      <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground tabular-nums">
                        {formatDate(j.createdAt)}
                      </td>

                      <td className="px-4 py-2.5">
                        <span className="text-[11px] text-muted-foreground uppercase">
                          {getTranslatedBookingType(t, j.bookingType)}
                        </span>
                      </td>

                      <td className="px-4 py-2.5">
                        <StatusBadge status={j.status} />
                      </td>

                      <td className="px-4 py-2.5 text-right font-mono font-medium tabular-nums text-foreground">
                        {formatCurrency(j.basePrice)}
                      </td>

                      <td className="px-4 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedJob(j)
                          }}
                          className="h-7 px-2.5 rounded border border-border bg-background hover:bg-muted text-foreground text-xs font-medium transition-colors"
                        >
                          Audit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {filteredJobs.length > pageSize && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 bg-card border-t border-border text-xs text-muted-foreground">
                <span className="tabular-nums">
                  Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredJobs.length)} of {filteredJobs.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-7 px-2.5 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 font-medium text-foreground transition-colors text-xs"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-7 w-7 rounded text-xs font-mono font-medium transition-colors ${
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
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-7 px-2.5 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 font-medium text-foreground transition-colors text-xs"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Feeds */}
        <div className="space-y-4">
          {/* Member Cooperatives Feed */}
          <div className="p-4 rounded-md border border-border bg-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('federation.dashboard.regionalLiquidityFeed', { defaultValue: 'Member Cooperatives' })}
              </h3>
              <Link
                to="/federation/societies"
                className="text-xs text-muted-foreground hover:text-foreground font-medium"
              >
                View All
              </Link>
            </div>

            <div className="space-y-2">
              {displaySocieties.map((soc) => (
                <div
                  key={soc.id}
                  className="p-3 rounded-md border border-border bg-muted/30 hover:bg-muted/50 transition-colors space-y-1"
                >
                  <div className="font-medium text-xs text-foreground truncate">
                    {getTranslatedSocietyName(t, soc.name)}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono tabular-nums">
                    <span>{soc.workerCount} members</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(soc.liquidity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Requests */}
          <div className="p-4 rounded-md border border-border bg-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('federation.dashboard.emergencyBroadcastRadar', { defaultValue: 'Emergency Requests' })}
              </h3>
              <Link
                to="/federation/emergencies"
                className="text-xs text-muted-foreground hover:text-foreground font-medium"
              >
                View All
              </Link>
            </div>

            {emergencies.length > 0 ? (
              <div className="space-y-2">
                {emergencies.map((em) => (
                  <div
                    key={em.id}
                    className="p-3 rounded-md border border-border bg-muted/30 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">
                        {getTranslatedSubserviceName(t, undefined, em.subserviceName)}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground tabular-nums">5.0 KM</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="truncate">{em.location.area}</span>
                      <span className="font-mono text-[10px] tabular-nums">{formatDate(em.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-md border border-border bg-muted/30 text-center text-xs text-muted-foreground">
                No active emergency requests.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deep-dive Audit Drawer Modal */}
      <JobDetailFederation
        job={selectedJob}
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  )
}
