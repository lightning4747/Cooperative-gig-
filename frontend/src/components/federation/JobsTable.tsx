import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Briefcase,
  Search,
  Eye,
  Clock,
  MapPin,
  AlertTriangle,
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

  return (
    <div className="space-y-4">
      {/* Filters Bar with Institutional Focus Rings */}
      <div className="p-4 rounded-2xl border border-border bg-card shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('federation.jobsTable.searchPlaceholder', { defaultValue: 'Search job ID, member, subservice, address...' })}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-input text-xs font-medium bg-background min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-input text-xs font-medium bg-background min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="ALL">{t('federation.jobsTable.allStatuses', { defaultValue: 'All Lifecycle Statuses' })}</option>
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
        </div>

        <div>
          <select
            value={bookingTypeFilter}
            onChange={(e) => setBookingTypeFilter(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-input text-xs font-medium bg-background min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="ALL">{t('federation.jobsTable.allBookingTypes', { defaultValue: 'All Booking Types' })}</option>
            <option value="STANDARD">STANDARD (Scheduled)</option>
            <option value="ON_DEMAND">ON-DEMAND (Immediate)</option>
            <option value="EMERGENCY">EMERGENCY (Priority Broadcast)</option>
          </select>
        </div>
      </div>

      {/* Jobs Table - High Density Desktop Layout */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={t('federation.jobsTable.emptyTitle', { defaultValue: 'No Jobs Match Filter' })}
          description={t('federation.jobsTable.emptyDesc', { defaultValue: 'Try altering your search keywords or resetting filters.' })}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="sticky top-0 z-10 bg-secondary text-muted-foreground text-xs font-bold uppercase tracking-wider border-b border-border/80 shadow-2xs">
                  <th className="p-4 min-w-[140px]">{t('federation.jobsTable.colJobRef', { defaultValue: 'Job Reference' })}</th>
                  <th className="p-4 min-w-[190px]">{t('federation.jobsTable.colService', { defaultValue: 'Service Details' })}</th>
                  <th className="p-4 min-w-[130px]">{t('federation.jobsTable.colType', { defaultValue: 'Booking Type' })}</th>
                  <th className="p-4 min-w-[220px]">{t('federation.jobsTable.colCustomerLocation', { defaultValue: 'Customer & Location' })}</th>
                  <th className="p-4 min-w-[200px]">{t('federation.jobsTable.colAssignedMember', { defaultValue: 'Assigned Member' })}</th>
                  <th className="p-4 min-w-[130px]">{t('federation.jobsTable.colStatus', { defaultValue: 'Status' })}</th>
                  <th className="p-4 font-mono text-right min-w-[120px]">{t('federation.jobsTable.colFloorWage', { defaultValue: 'Floor Wage' })}</th>
                  <th className="p-4 font-mono text-right min-w-[120px]">{t('federation.jobsTable.colCustomerPaid', { defaultValue: 'Customer Paid' })}</th>
                  <th className="p-4 text-right min-w-[100px]">{t('federation.jobsTable.colAction', { defaultValue: 'Action' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-muted/40 transition-colors cursor-pointer"
                    onClick={() => onSelectJob?.(job)}
                  >
                    {/* Job ID & Date */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-foreground block">
                          {job.id}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {formatDate(job.createdAt)}
                        </span>
                      </div>
                    </td>

                    {/* Service & Subservice */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-foreground block">
                          {getTranslatedSubserviceName(t, job.subserviceId, job.subserviceName)}
                        </span>
                        <span className="text-[11px] text-muted-foreground uppercase font-medium">
                          {getTranslatedCategoryName(t, job.serviceCategoryId, job.serviceCategoryName)}
                        </span>
                      </div>
                    </td>

                    {/* Booking Type */}
                    <td className="p-4">
                      {job.isEmergency ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-700 dark:text-red-400 font-bold text-[10px] border border-red-500/20">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{getTranslatedBookingType(t, 'EMERGENCY')}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-semibold text-[10px] border border-border">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span>{getTranslatedBookingType(t, job.bookingType)}</span>
                        </span>
                      )}
                    </td>

                    {/* Customer & Location */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-medium text-foreground block">
                          {getTranslatedPersonName(t, job.customerName)}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>{job.location.formattedAddress || job.location.area}</span>
                        </span>
                      </div>
                    </td>

                    {/* Assigned Worker */}
                    <td className="p-4">
                      {job.workerName ? (
                        <div className="space-y-0.5">
                          <span className="font-bold text-foreground block">
                            {getTranslatedPersonName(t, job.workerName)}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {job.workerPhone ? `+91 ${job.workerPhone}` : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400 italic">
                          {t('federation.jobsTable.awaitingMatch', { defaultValue: 'Awaiting Match...' })}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <StatusBadge status={job.status} />
                    </td>

                    {/* Base Price */}
                    <td className="p-4 text-right font-mono font-bold text-foreground text-sm">
                      {formatCurrency(job.basePrice)}
                    </td>

                    {/* Customer Paid */}
                    <td className="p-4 text-right font-mono">
                      {job.isPaid || job.paidAmount || job.status === 'COMPLETED' ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          {formatCurrency(job.paidAmount || job.grossAmount || job.basePrice)}
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* View Details Action */}
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onSelectJob?.(job)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-secondary/80 hover:bg-secondary text-foreground text-xs font-bold min-h-[36px] transition-colors shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('federation.jobsTable.audit', { defaultValue: 'Audit' })}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
