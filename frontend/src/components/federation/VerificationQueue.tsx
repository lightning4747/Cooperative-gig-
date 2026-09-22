import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, CheckCircle2, XCircle, FileText, Phone, Building2 } from 'lucide-react'
import type { WorkerProfile, WorkerStatus } from '@/types/worker'
import { EmptyState } from '@/components/shared/EmptyState'

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

  const handleAction = async (workerId: string, status: WorkerStatus) => {
    setProcessingId(workerId)
    try {
      await onVerify(workerId, status)
    } finally {
      setProcessingId(null)
    }
  }

  if (pendingWorkers.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title={t('federation.verificationQueue.emptyTitle', { defaultValue: 'Verification Queue Clear' })}
        description={t(
          'federation.verificationQueue.emptyDesc',
          { defaultValue: 'All submitted cooperative worker credentials and ITI trade certificates have been reviewed.' }
        )}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-500" />
          {t('federation.verificationQueue.pendingTitle', { count: pendingWorkers.length, defaultValue: `Pending Apex Verification (${pendingWorkers.length})` })}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingWorkers.map((worker) => {
          const isProcessing = processingId === worker.userId

          return (
            <div
              key={worker.userId}
              className="p-5 rounded-2xl border border-amber-500/30 bg-card shadow-xs space-y-4 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-foreground">
                      {worker.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
                      {t('federation.verificationQueue.pendingBadge', { defaultValue: 'PENDING' })}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    +91 {worker.phone}
                  </span>
                </div>

                <span className="text-xs font-mono font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
                  {worker.membershipId}
                </span>
              </div>

              {/* Society & Credentials Box */}
              <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/80 space-y-2 text-xs">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-foreground block">
                      {worker.societyName}
                    </span>
                    <span className="text-[11px] block font-mono">
                      e-Shram UAN: {worker.eShramUAN || 'UAN-PENDING-SUBMISSION'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    {t('federation.verificationQueue.claimedSkills', { defaultValue: 'Claimed Trade Skills & Certifications' })}
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {worker.skills.map((sk) => (
                      <span
                        key={sk.id}
                        className="px-2 py-1 rounded bg-card border border-border text-[11px] font-medium text-foreground flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3 text-primary" />
                        <span>{sk.subserviceName}</span>
                        {sk.certificationRef && (
                          <span className="text-muted-foreground text-[10px]">
                            ({sk.certificationRef})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleAction(worker.userId, 'SUSPENDED')}
                  disabled={isProcessing}
                  className="min-h-[44px] py-2 px-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{t('federation.verificationQueue.reject', { defaultValue: 'Reject / Return' })}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction(worker.userId, 'ACTIVE')}
                  disabled={isProcessing}
                  className="min-h-[44px] py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('federation.verificationQueue.approve', { defaultValue: 'Approve & Activate' })}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
