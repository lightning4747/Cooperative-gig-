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
      <div className="pb-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            {t('federation.dashboard.title', { defaultValue: 'Federation Operations Dashboard' })}
          </h1>
          <p className="text-xs text-slate-500">
            Cooperative workforce overview and real-time operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/federation/verification"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-sm transition-colors h-8"
          >
            <span>Pending Approvals ({metrics?.pendingWorkers ?? 1})</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={t('federation.dashboard.activeWorkers', { defaultValue: 'ACTIVE WORKERS' })}
          value={metrics?.activeWorkers ?? 3}
          subtitle="Registered members"
        />

        <MetricCard
          title={t('federation.dashboard.jobsToday', { defaultValue: 'JOBS TODAY' })}
          value={metrics?.jobsToday ?? 1}
          subtitle="Dispatched today"
        />

        <MetricCard
          title={t('federation.dashboard.availableWorkers', { defaultValue: 'AVAILABLE WORKERS' })}
          value={metrics?.availableWorkers ?? 1}
          subtitle="Ready for assignment"
        />

        <MetricCard
          title={t('federation.dashboard.welfarePool', { defaultValue: 'WELFARE POOL' })}
          value={formatCurrency(metrics?.welfareBalance ?? 150)}
          subtitle="Member reserve balance"
        />
      </div>

      {/* Split View: Operations Table + Society & Emergency Feeds */}
      <div className="grid grid-cols-1 xl:grid-cols-[68%_32%] gap-6 items-start">
        {/* Left: Live Operations Table with Search & Pagination */}
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">
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
                className="px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-white placeholder:text-slate-400 text-slate-800 focus:outline-none focus:border-slate-400 w-44 sm:w-56 h-8"
              />
              <Link
                to="/federation/jobs"
                className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors shrink-0"
              >
                View All
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="px-4 py-3 min-w-[160px]">{t('federation.dashboard.tableService', { defaultValue: 'SERVICE' })}</th>
                  <th className="px-4 py-3 min-w-[110px]">{t('federation.dashboard.tableDate', { defaultValue: 'DATE' })}</th>
                  <th className="px-4 py-3 min-w-[90px]">{t('federation.dashboard.tableType', { defaultValue: 'TYPE' })}</th>
                  <th className="px-4 py-3 min-w-[110px]">{t('federation.dashboard.tableStatus', { defaultValue: 'STATUS' })}</th>
                  <th className="px-4 py-3 min-w-[90px] text-right">{t('federation.dashboard.tableFloorPrice', { defaultValue: 'BASE PRICE' })}</th>
                  <th className="px-4 py-3 min-w-[70px] text-right">{t('federation.dashboard.tableAction', { defaultValue: 'ACTION' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-slate-400">
                      {t('federation.dashboard.noJobs', { defaultValue: 'No operations match criteria.' })}
                    </td>
                  </tr>
                ) : (
                  paginatedJobs.map((j) => (
                    <tr
                      key={j.id}
                      className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedJob(j)}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-900 block truncate">
                          {getTranslatedSubserviceName(t, j.subserviceId, j.subserviceName)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {getTranslatedCategoryName(t, j.serviceCategoryId, j.serviceCategoryName)}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500 tabular-nums">
                        {formatDate(j.createdAt)}
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-[11px] text-slate-500 uppercase">
                          {getTranslatedBookingType(t, j.bookingType)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={j.status} />
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-medium tabular-nums text-slate-900">
                        {formatCurrency(j.basePrice)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedJob(j)
                          }}
                          className="h-7 px-3 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200 text-xs text-slate-500">
                <span className="tabular-nums">
                  Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredJobs.length)} of {filteredJobs.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-7 px-2.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-medium text-slate-700 transition-colors text-xs"
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
                            ? 'bg-slate-900 text-white font-semibold'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
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
                    className="h-7 px-2.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-medium text-slate-700 transition-colors text-xs"
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
          <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t('federation.dashboard.regionalLiquidityFeed', { defaultValue: 'MEMBER COOPERATIVE LIQUIDITY' })}
              </h3>
              <Link
                to="/federation/societies"
                className="text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                View All
              </Link>
            </div>

            <div className="space-y-2">
              {displaySocieties.map((soc) => (
                <div
                  key={soc.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-1"
                >
                  <div className="font-medium text-xs text-slate-900 truncate">
                    {getTranslatedSocietyName(t, soc.name)}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                    <span>{soc.workerCount} members</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(soc.liquidity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Requests */}
          <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t('federation.dashboard.emergencyBroadcastRadar', { defaultValue: 'EMERGENCY REQUEST RADAR' })}
              </h3>
              <Link
                to="/federation/emergencies"
                className="text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                View All
              </Link>
            </div>

            {emergencies.length > 0 ? (
              <div className="space-y-2">
                {emergencies.map((em) => (
                  <div
                    key={em.id}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-900">
                        {getTranslatedSubserviceName(t, undefined, em.subserviceName)}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 tabular-nums">5.0 KM</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate">{em.location.area}</span>
                      <span className="font-mono text-[10px] tabular-nums">{formatDate(em.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 text-center text-xs text-slate-400">
                No active emergency broadcasts.
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
