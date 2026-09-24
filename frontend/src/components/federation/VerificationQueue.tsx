import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, CheckCircle2, XCircle, FileText, Phone, Building2 } from 'lucide-react'
import type { WorkerProfile, WorkerStatus } from '@/types/worker'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatPhone } from '@/lib/utils'

interface VerificationQueueProps {
  pendingWorkers: WorkerProfile[]
  onVerify: (workerId: string, status: WorkerStatus) => Promise<void> | void
}

export function VerificationQueue({
  pendingWorkers,
  onVerify,
}: VerificationQueueProps) {
  const { t } = useTranslation()
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 4

  const handleAction = async (workerId: string, status: WorkerStatus) => {
    setProcessingId(workerId)
    try {
      await onVerify(workerId, status)
    } finally {
      setProcessingId(null)
    }
  }

  const filtered = pendingWorkers.filter((w) => {
    const q = searchTerm.toLowerCase().trim()
    if (!q) return true
    return (
      w.name.toLowerCase().includes(q) ||
      w.societyName.toLowerCase().includes(q) ||
      w.phone.includes(q) ||
      w.skills.some((s) => s.subserviceName.toLowerCase().includes(q))
    )
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginatedWorkers = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  if (pendingWorkers.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title={t('federation.verificationQueue.emptyTitle', { defaultValue: 'Verification Queue Clear' })}
        description={t(
          'federation.verificationQueue.emptyDesc',
          { defaultValue: 'All submitted worker credentials and skill certificates have been reviewed.' }
        )}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
          {t('federation.verificationQueue.pendingTitle', { count: filtered.length, defaultValue: `Pending Verification (${filtered.length})` })}
        </span>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          placeholder="Search worker or skill..."
          className="h-8 px-2.5 rounded-md border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 w-full sm:w-64"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {paginatedWorkers.map((worker) => {
          const isProcessing = processingId === worker.userId

          return (
            <div
              key={worker.userId}
              className="p-4 rounded-md border border-border bg-card space-y-3 relative"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {worker.name}
                    </h3>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800">
                      {t('federation.verificationQueue.pendingBadge', { defaultValue: 'PENDING' })}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
                    <Phone className="w-3 h-3" />
                    {formatPhone(worker.phone)}
                  </span>
                </div>
              </div>

              {/* Society & Credentials Box */}
              <div className="p-3 rounded-md bg-muted/40 border border-border space-y-2 text-xs">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">
                      {worker.societyName}
                    </span>
                    <span className="text-[11px] block text-muted-foreground">
                      Documents submitted for review
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                    {t('federation.verificationQueue.claimedSkills', { defaultValue: 'Skills & Certifications' })}
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {worker.skills.map((sk) => (
                      <span
                        key={sk.id}
                        className="px-1.5 py-0.5 rounded border border-border bg-background text-[11px] font-normal text-foreground flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3 text-muted-foreground" />
                        <span>{sk.subserviceName}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleAction(worker.userId, 'SUSPENDED')}
                  disabled={isProcessing}
                  className="h-8 px-3 rounded-md border border-border bg-background hover:bg-destructive/10 text-destructive text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{t('federation.verificationQueue.reject', { defaultValue: 'Reject' })}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction(worker.userId, 'ACTIVE')}
                  disabled={isProcessing}
                  className="h-8 px-3 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('federation.verificationQueue.approve', { defaultValue: 'Approve' })}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination Controls */}
      {filtered.length > pageSize && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 bg-card border border-border rounded-md text-xs text-muted-foreground">
          <span className="tabular-nums">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} workers
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
  )
}
