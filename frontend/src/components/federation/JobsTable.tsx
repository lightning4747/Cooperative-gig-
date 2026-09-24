import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Briefcase,
  Search,
} from 'lucide-react'
import type { Job } from '@/types/job'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  getTranslatedCategoryName,
  getTranslatedSubserviceName,
  getTranslatedBookingType,
  getTranslatedPersonName,
} from '@/lib/serviceTranslation'

interface JobsTableProps {
  jobs: Job[]
  onSelectJob?: (job: Job) => void
}

export function JobsTable({ jobs, onSelectJob }: JobsTableProps) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [bookingTypeFilter, setBookingTypeFilter] = useState<string>('ALL')

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.workerName && job.workerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      job.subserviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.location.formattedAddress && job.location.formattedAddress.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter
    const matchesBookingType =
      bookingTypeFilter === 'ALL' || job.bookingType === bookingTypeFilter

    return matchesSearch && matchesStatus && matchesBookingType
  })

  const totalPages = Math.ceil(filteredJobs.length / pageSize) || 1
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="space-y-3">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            placeholder={t('federation.jobsTable.searchPlaceholder', { defaultValue: 'Search member, subservice, address...' })}
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-border text-xs bg-background h-8 focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-background h-8 focus:outline-none focus:ring-1 focus:ring-foreground text-foreground"
          >
            <option value="ALL">{t('federation.jobsTable.allStatuses', { defaultValue: 'All Statuses' })}</option>
            <option value="SEARCHING">SEARCHING</option>
            <option value="OFFERED">OFFERED</option>
            <option value="BROADCAST">BROADCAST (EMERGENCY)</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="TRAVELLING">TRAVELLING</option>
            <option value="ARRIVED">ARRIVED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <select
            value={bookingTypeFilter}
            onChange={(e) => {
              setBookingTypeFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-background h-8 focus:outline-none focus:ring-1 focus:ring-foreground text-foreground"
          >
            <option value="ALL">{t('federation.jobsTable.allBookingTypes', { defaultValue: 'All Types' })}</option>
            <option value="STANDARD">STANDARD (Scheduled)</option>
            <option value="ON_DEMAND">ON-DEMAND (Immediate)</option>
            <option value="EMERGENCY">EMERGENCY (Priority)</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={t('federation.jobsTable.emptyTitle', { defaultValue: 'No Jobs Match Filter' })}
          description={t('federation.jobsTable.emptyDesc', { defaultValue: 'Try altering your search keywords or resetting filters.' })}
        />
      ) : (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-20 bg-muted border-b border-border shadow-xs">
                <tr className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
                  <th className="px-4 py-2.5 min-w-[190px] bg-muted whitespace-nowrap">{t('federation.jobsTable.colService', { defaultValue: 'Service & Category' })}</th>
                  <th className="px-4 py-2.5 min-w-[120px] bg-muted whitespace-nowrap">{t('federation.jobsTable.colType', { defaultValue: 'Booking Type' })}</th>
                  <th className="px-4 py-2.5 min-w-[200px] bg-muted whitespace-nowrap">{t('federation.jobsTable.colCustomerLocation', { defaultValue: 'Customer & Location' })}</th>
                  <th className="px-4 py-2.5 min-w-[180px] bg-muted whitespace-nowrap">{t('federation.jobsTable.colAssignedMember', { defaultValue: 'Assigned Member' })}</th>
                  <th className="px-4 py-2.5 min-w-[120px] bg-muted whitespace-nowrap">{t('federation.jobsTable.colStatus', { defaultValue: 'Status' })}</th>
                  <th className="px-4 py-2.5 font-mono text-right min-w-[110px] bg-muted whitespace-nowrap">{t('federation.jobsTable.colFloorWage', { defaultValue: 'Base Pay' })}</th>
                  <th className="px-4 py-2.5 font-mono text-right min-w-[110px] bg-muted whitespace-nowrap">{t('federation.jobsTable.colCustomerPaid', { defaultValue: 'Customer Paid' })}</th>
                  <th className="px-4 py-2.5 text-right min-w-[80px] bg-muted whitespace-nowrap">{t('federation.jobsTable.colAction', { defaultValue: 'Action' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {paginatedJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => onSelectJob?.(job)}
                  >
                    {/* Service & Subservice & Date */}
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <span className="font-medium text-foreground block truncate">
                          {getTranslatedSubserviceName(t, job.subserviceId, job.subserviceName)}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span className="uppercase font-medium">
                            {getTranslatedCategoryName(t, job.serviceCategoryId, job.serviceCategoryName)}
                          </span>
                          <span>•</span>
                          <span className="font-mono tabular-nums">{formatDate(job.createdAt)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Booking Type */}
                    <td className="px-4 py-3">
                      <span className="inline-flex px-1.5 py-0.5 rounded text-[11px] font-mono border border-border bg-muted/40 text-foreground">
                        {getTranslatedBookingType(t, job.bookingType)}
                      </span>
                    </td>

                    {/* Customer & Location */}
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <span className="font-medium text-foreground block truncate">
                          {getTranslatedPersonName(t, job.customerName)}
                        </span>
                        <span className="text-[11px] text-muted-foreground block truncate">
                          {job.location.formattedAddress || job.location.area}
                        </span>
                      </div>
                    </td>

                    {/* Assigned Worker */}
                    <td className="px-4 py-3">
                      {job.workerName ? (
                        <div className="space-y-0.5">
                          <span className="font-medium text-foreground block truncate">
                            {getTranslatedPersonName(t, job.workerName)}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
                            {job.workerPhone ? `+91 ${job.workerPhone}` : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">
                          {t('federation.jobsTable.awaitingMatch', { defaultValue: 'Awaiting Match...' })}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={job.status} />
                    </td>

                    {/* Base Price */}
                    <td className="px-4 py-3 text-right font-mono font-medium text-foreground tabular-nums">
                      {formatCurrency(job.basePrice)}
                    </td>

                    {/* Customer Paid */}
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {job.isPaid || job.paidAmount || job.status === 'COMPLETED' ? (
                        <span className="font-medium text-foreground">
                          {formatCurrency(job.paidAmount || job.grossAmount || job.basePrice)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* View Details Action */}
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onSelectJob?.(job)}
                        className="h-7 px-2.5 rounded border border-border bg-background hover:bg-muted text-foreground text-xs font-medium transition-colors"
                      >
                        {t('federation.jobsTable.audit', { defaultValue: 'Audit' })}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {filteredJobs.length > pageSize && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 bg-card border-t border-border text-xs text-muted-foreground">
                <span className="tabular-nums">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredJobs.length)} of {filteredJobs.length} operations
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-7 px-2.5 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 text-xs font-medium transition-colors"
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
                            ? 'bg-foreground text-background font-semibold'
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
                    className="h-7 px-2.5 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 text-xs font-medium transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
