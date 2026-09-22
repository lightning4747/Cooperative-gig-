import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, CheckCircle2, Phone, Star, User } from 'lucide-react'
import type { WorkerProfile, WorkerStatus } from '@/types/worker'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils'

interface WorkerTableProps {
  workers: WorkerProfile[]
  onSelectWorker?: (worker: WorkerProfile) => void
  onStatusChange?: (workerId: string, status: WorkerStatus) => void
}

export function WorkerTable({
  workers,
  onSelectWorker,
  onStatusChange,
}: WorkerTableProps) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [selectedSociety, setSelectedSociety] = useState<string>('ALL')

  // Extract unique societies
  const societies = Array.from(new Set(workers.map((w) => w.societyName))).filter(Boolean)

  const filtered = workers.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.phone.includes(searchTerm) ||
      w.membershipId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.skills.some((s) => s.subserviceName.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = selectedStatus === 'ALL' || w.status === selectedStatus
    const matchesSociety = selectedSociety === 'ALL' || w.societyName === selectedSociety

    return matchesSearch && matchesStatus && matchesSociety
  })

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar with Institutional Focus Rings */}
      <div className="p-4 rounded-2xl border border-border bg-card shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('federation.workerTable.searchPlaceholder', { defaultValue: 'Search worker name, skill, UAN, ID...' })}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-input text-xs font-medium bg-background min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-input text-xs font-medium bg-background min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="ALL">{t('federation.workerTable.filterAllStatus', { defaultValue: 'All Verification Statuses' })}</option>
            <option value="ACTIVE">ACTIVE / VERIFIED</option>
            <option value="PENDING_VERIFICATION">PENDING VERIFICATION</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>

        <div>
          <select
            value={selectedSociety}
            onChange={(e) => setSelectedSociety(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-input text-xs font-medium bg-background min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="ALL">{t('federation.workerTable.filterAllSocieties', { defaultValue: 'All Cooperative Societies' })}</option>
            {societies.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Workers Table - Full-Width High Density Desktop Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={User}
          title={t('federation.workerTable.noWorkersFound', { defaultValue: 'No workers match criteria' })}
          description={t('federation.workerTable.noWorkersDesc', { defaultValue: 'Try altering your search filters or clear society selection.' })}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="sticky top-0 z-10 bg-secondary text-muted-foreground text-xs font-bold uppercase tracking-wider border-b border-border/80 shadow-2xs">
                  <th className="p-4 min-w-[200px]">{t('federation.workerTable.colMember', { defaultValue: 'Worker Member' })}</th>
                  <th className="p-4 min-w-[190px]">{t('federation.workerTable.colSociety', { defaultValue: 'Cooperative Society' })}</th>
                  <th className="p-4 min-w-[220px]">{t('federation.workerTable.colSkills', { defaultValue: 'Verified Skills' })}</th>
                  <th className="p-4 min-w-[130px]">{t('federation.workerTable.colAvailability', { defaultValue: 'Availability' })}</th>
                  <th className="p-4 min-w-[100px]">{t('federation.workerTable.colRating', { defaultValue: 'Rating' })}</th>
                  <th className="p-4 min-w-[140px]">{t('federation.workerTable.colStatus', { defaultValue: 'Status' })}</th>
                  <th className="p-4 text-right min-w-[140px]">{t('federation.workerTable.colActions', { defaultValue: 'Actions' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((worker) => (
                  <tr
                    key={worker.userId}
                    className="hover:bg-muted/40 transition-colors cursor-pointer"
                    onClick={() => onSelectWorker?.(worker)}
                  >
                    {/* Worker Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200/60 flex items-center justify-center font-black text-xs shadow-2xs shrink-0">
                          {worker.name[0]}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-foreground block">
                            {worker.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            +91 {worker.phone}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Society & Membership */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <span className="font-medium text-foreground block">
                          {worker.societyName}
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded border border-border/60 inline-block">
                          {worker.membershipId}
                        </span>
                      </div>
                    </td>

                    {/* Skills */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {worker.skills.map((sk) => (
                          <span
                            key={sk.id}
                            className={cn(
                              'px-2.5 py-0.5 rounded-md text-[10px] font-medium border flex items-center gap-1 shadow-2xs',
                              sk.isVerified
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                            )}
                          >
                            {sk.isVerified && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                            <span>{sk.subserviceName}</span>
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Availability */}
                    <td className="p-4">
                      <StatusBadge status={worker.availability} />
                    </td>

                    {/* Rating */}
                    <td className="p-4">
                      <div className="flex items-center gap-1 font-mono font-bold text-foreground">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{worker.rating > 0 ? worker.rating.toFixed(1) : '-'}</span>
                      </div>
                    </td>

                    {/* Verification Status */}
                    <td className="p-4">
                      <StatusBadge status={worker.status} />
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {worker.status === 'PENDING_VERIFICATION' && onStatusChange && (
                          <button
                            type="button"
                            onClick={() => onStatusChange(worker.userId, 'ACTIVE')}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 min-h-[36px] transition-colors"
                          >
                            {t('federation.workerTable.verifyAndActivate', { defaultValue: 'Verify & Activate' })}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onSelectWorker?.(worker)}
                          className="px-3 py-1.5 rounded-xl border border-border bg-secondary/80 hover:bg-secondary text-foreground text-xs font-semibold min-h-[36px] transition-colors shadow-2xs"
                        >
                          {t('federation.workerTable.details', { defaultValue: 'Details' })}
                        </button>
                      </div>
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
