import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, User, X, CheckCircle2, ShieldCheck } from 'lucide-react'
import type { WorkerProfile, WorkerStatus } from '@/types/worker'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatPhone, formatCurrency } from '@/lib/utils'

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
  const [selectedModalWorker, setSelectedModalWorker] = useState<WorkerProfile | null>(null)

  // Extract unique societies
  const societies = Array.from(new Set(workers.map((w) => w.societyName))).filter(Boolean)

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

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

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const paginatedWorkers = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="space-y-3">
      {/* Search and Filters Bar */}
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
            placeholder={t('federation.workerTable.searchPlaceholder', { defaultValue: 'Search worker name, skill, society...' })}
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-border text-xs bg-background h-8 focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value)
              setCurrentPage(1)
            }}
            className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-background h-8 focus:outline-none focus:ring-1 focus:ring-foreground text-foreground"
          >
            <option value="ALL">{t('federation.workerTable.filterAllStatus', { defaultValue: 'All Statuses' })}</option>
            <option value="ACTIVE">Active / Verified</option>
            <option value="PENDING_VERIFICATION">Pending</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <select
            value={selectedSociety}
            onChange={(e) => {
              setSelectedSociety(e.target.value)
              setCurrentPage(1)
            }}
            className="px-2.5 py-1.5 rounded-md border border-border text-xs bg-background h-8 focus:outline-none focus:ring-1 focus:ring-foreground text-foreground max-w-xs truncate"
          >
            <option value="ALL">{t('federation.workerTable.filterAllSocieties', { defaultValue: 'All Cooperatives' })}</option>
            {societies.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Workers Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={User}
          title={t('federation.workerTable.noWorkersFound', { defaultValue: 'No workers match criteria' })}
          description={t('federation.workerTable.noWorkersDesc', { defaultValue: 'Try altering your search filters or clear society selection.' })}
        />
      ) : (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="sticky top-0 z-10 bg-muted/40 text-muted-foreground text-[11px] font-medium uppercase tracking-wider border-b border-border">
                  <th className="px-4 py-2.5 min-w-[200px]">{t('federation.workerTable.colMember', { defaultValue: 'Worker Member' })}</th>
                  <th className="px-4 py-2.5 min-w-[190px]">{t('federation.workerTable.colSociety', { defaultValue: 'Cooperative' })}</th>
                  <th className="px-4 py-2.5 min-w-[220px]">{t('federation.workerTable.colSkills', { defaultValue: 'Verified Skills' })}</th>
                  <th className="px-4 py-2.5 min-w-[130px]">{t('federation.workerTable.colAvailability', { defaultValue: 'Availability' })}</th>
                  <th className="px-4 py-2.5 min-w-[90px] text-center">{t('federation.workerTable.colRating', { defaultValue: 'Rating' })}</th>
                  <th className="px-4 py-2.5 min-w-[140px]">{t('federation.workerTable.colStatus', { defaultValue: 'Status' })}</th>
                  <th className="px-4 py-2.5 text-right min-w-[130px]">{t('federation.workerTable.colActions', { defaultValue: 'Actions' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {paginatedWorkers.map((worker) => (
                  <tr
                    key={worker.userId}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedModalWorker(worker)
                      onSelectWorker?.(worker)
                    }}
                  >
                    {/* Worker Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-muted text-foreground border border-border flex items-center justify-center font-medium text-xs shrink-0">
                          {worker.name[0]}
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-foreground block truncate">
                            {worker.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
                            {formatPhone(worker.phone)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Society */}
                    <td className="px-4 py-3">
                      <span className="text-foreground block truncate">
                        {worker.societyName}
                      </span>
                    </td>

                    {/* Skills (Compact & Non-Breaking) */}
                    <td className="px-4 py-3 max-w-[240px]">
                      <div className="flex flex-wrap items-center gap-1">
                        {worker.skills.slice(0, 2).map((sk) => (
                          <span
                            key={sk.id}
                            className="px-1.5 py-0.5 rounded text-[11px] font-medium border border-border bg-muted/40 text-foreground truncate max-w-[100px]"
                            title={sk.subserviceName}
                          >
                            {sk.subserviceName}
                          </span>
                        ))}
                        {worker.skills.length > 2 && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold border border-border bg-secondary text-muted-foreground shrink-0 cursor-help"
                            title={worker.skills.map((s) => s.subserviceName).join(', ')}
                          >
                            +{worker.skills.length - 2} more
                          </span>
                        )}
                        {worker.skills.length === 0 && (
                          <span className="text-muted-foreground text-[11px] italic">None</span>
                        )}
                      </div>
                    </td>

                    {/* Availability */}
                    <td className="px-4 py-3">
                      <StatusBadge status={worker.availability} />
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono text-foreground text-xs tabular-nums font-medium">
                        {worker.rating > 0 ? worker.rating.toFixed(1) : '-'}
                      </span>
                    </td>

                    {/* Verification Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={worker.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {worker.status === 'PENDING_VERIFICATION' && onStatusChange && (
                          <button
                            type="button"
                            onClick={() => onStatusChange(worker.userId, 'ACTIVE')}
                            className="h-7 px-2.5 rounded border border-border bg-background hover:bg-muted text-foreground text-xs font-medium transition-colors"
                          >
                            {t('federation.workerTable.verifyAndActivate', { defaultValue: 'Verify' })}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedModalWorker(worker)
                            onSelectWorker?.(worker)
                          }}
                          className="h-7 px-2.5 rounded border border-border bg-background hover:bg-muted text-foreground text-xs font-medium transition-colors"
                        >
                          {t('federation.workerTable.details', { defaultValue: 'Details' })}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {filtered.length > pageSize && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 bg-card border-t border-border text-xs text-muted-foreground">
                <span className="tabular-nums">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} members
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

      {/* Comprehensive Worker Member Details Modal */}
      {selectedModalWorker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedModalWorker(null)}
        >
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xl space-y-5 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-lg bg-secondary text-foreground font-bold text-sm flex items-center justify-center border border-border shrink-0">
                  {selectedModalWorker.name[0]}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-foreground">
                      {selectedModalWorker.name}
                    </h3>
                    <StatusBadge status={selectedModalWorker.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">{formatPhone(selectedModalWorker.phone)}</span>
                    <span>·</span>
                    <span className="truncate">{selectedModalWorker.societyName}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedModalWorker(null)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-lg bg-secondary/30 border border-border/60 space-y-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  Rating
                </span>
                <div className="text-base font-black font-mono text-foreground">
                  {selectedModalWorker.rating > 0 ? `${selectedModalWorker.rating.toFixed(2)} ★` : '-'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-secondary/30 border border-border/60 space-y-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  Completed Tasks
                </span>
                <div className="text-base font-black font-mono text-foreground">
                  {selectedModalWorker.totalJobsCompleted}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-secondary/30 border border-border/60 space-y-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  Welfare Balance
                </span>
                <div className="text-base font-black font-mono text-foreground">
                  {formatCurrency(selectedModalWorker.welfareBalance || 0)}
                </div>
              </div>
            </div>

            {/* Verified Skills & Trades (Beautifully handles 10+ trades gracefully) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>Verified Trades &amp; Qualifications</span>
                </h4>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                  {selectedModalWorker.skills.length} Certified {selectedModalWorker.skills.length === 1 ? 'Trade' : 'Trades'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1.5 rounded-lg border border-border bg-muted/20">
                {selectedModalWorker.skills.map((sk) => (
                  <div
                    key={sk.id}
                    className="p-2.5 rounded-md border border-border bg-card text-xs flex items-center gap-2 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-medium text-foreground truncate" title={sk.subserviceName}>
                      {sk.subserviceName}
                    </span>
                  </div>
                ))}
                {selectedModalWorker.skills.length === 0 && (
                  <div className="col-span-full py-4 text-center text-xs text-muted-foreground italic">
                    No verified skill credentials found.
                  </div>
                )}
              </div>
            </div>

            {/* Statutory Identifiers Strip */}
            <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cooperative Membership:</span>
                <span className="font-mono font-semibold text-foreground">{selectedModalWorker.membershipId || 'MEM-CBE-001'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">National e-Shram UAN:</span>
                <span className="font-mono font-semibold text-foreground">{selectedModalWorker.eShramUAN}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Accidental Cover (PMSBY):</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedModalWorker.insurancePMSBY}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedModalWorker(null)}
                className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
