import { useTranslation } from 'react-i18next'
import {
  X,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  HeartHandshake,
  AlertTriangle,
} from 'lucide-react'
import type { Job } from '@/types/job'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatCurrency } from '@/lib/utils'
import { calculatePayment } from '@/lib/paymentCalc'
import {
  getTranslatedCategoryName,
  getTranslatedSubserviceName,
  getTranslatedBookingType,
  getTranslatedPersonName,
} from '@/lib/serviceTranslation'

interface JobDetailFederationProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
}

export function JobDetailFederation({
  job,
  isOpen,
  onClose,
}: JobDetailFederationProps) {
  const { t } = useTranslation()

  if (!isOpen || !job) return null

  // Calculate payment breakdown based on customer price and statutory base price floor
  const customerPrice = job.paidAmount || job.grossAmount || job.basePrice
  const payment = calculatePayment(customerPrice, job.basePrice, 0.5)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-card p-5 shadow-lg space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <StatusBadge status={job.status} />
              {job.isEmergency && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  {getTranslatedBookingType(t, 'EMERGENCY')}
                </span>
              )}
            </div>
            <h2 className="text-sm font-semibold text-foreground">
              {getTranslatedSubserviceName(t, job.subserviceId, job.subserviceName)}
            </h2>
            <p className="text-[11px] text-muted-foreground uppercase font-mono tracking-wider">
              {getTranslatedCategoryName(t, job.serviceCategoryId, job.serviceCategoryName)} · {getTranslatedBookingType(t, job.bookingType)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md border border-border bg-background hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label={t('federation.jobDetail.close', { defaultValue: 'Close Inspector' })}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Customer Card */}
          <div className="p-3 rounded-md border border-border bg-muted/40 space-y-1.5 text-xs">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
              {t('federation.jobDetail.customerRequester', { defaultValue: 'Customer Requester' })}
            </span>
            <div className="space-y-0.5">
              <div className="font-semibold text-foreground text-xs">
                {getTranslatedPersonName(t, job.customerName)}
              </div>
              <div className="text-muted-foreground font-mono text-[11px] flex items-center gap-1.5">
                <Phone className="w-3 h-3" />
                +91 {job.customerPhone}
              </div>
              <div className="text-muted-foreground flex items-start gap-1.5 pt-0.5 text-[11px]">
                <MapPin className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                <span className="truncate">{job.location.formattedAddress}</span>
              </div>
            </div>
          </div>

          {/* Assigned Worker Card */}
          <div className="p-3 rounded-md border border-border bg-muted/40 space-y-1.5 text-xs">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
              {t('federation.jobDetail.assignedMember', { defaultValue: 'Assigned Worker' })}
            </span>
            {job.workerName ? (
              <div className="space-y-0.5">
                <div className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                  <User className="w-3 h-3 text-muted-foreground" />
                  {getTranslatedPersonName(t, job.workerName)}
                </div>
                <div className="text-muted-foreground font-mono text-[11px] flex items-center gap-1.5">
                  <Phone className="w-3 h-3" />
                  +91 {job.workerPhone || '9876543210'}
                </div>
                {job.otp && (
                  <div className="pt-1 flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-medium text-muted-foreground">
                      OTP:
                    </span>
                    <span className="font-mono font-medium text-[11px] px-1.5 py-0.2 rounded bg-muted text-foreground border border-border">
                      {job.otp}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2 text-center text-muted-foreground text-xs italic">
                {t('federation.jobDetail.awaitingMatch', { defaultValue: 'Awaiting worker match' })}
              </div>
            )}
          </div>
        </div>

        {/* Allocation Inspector Breakdown */}
        {job.allocationBreakdown ? (
          <div className="p-3.5 rounded-md border border-border bg-muted/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {t('federation.jobDetail.allocationAuditTitle', { defaultValue: 'Allocation Reasoning' })}
              </span>
              <span className="text-xs font-mono font-medium text-foreground">
                Score: {job.allocationBreakdown.totalScore.toFixed(2)}
              </span>
            </div>

            <p className="text-xs text-foreground bg-background p-2.5 rounded-md border border-border leading-relaxed font-normal">
              &ldquo;{job.allocationBreakdown.explanation}&rdquo;
            </p>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-md bg-background border border-border">
                <span className="text-[10px] text-muted-foreground block font-medium">
                  Proximity
                </span>
                <span className="font-mono tabular-nums font-semibold text-foreground text-xs">
                  +{job.allocationBreakdown.proximityScore}
                </span>
              </div>
              <div className="p-2 rounded-md bg-background border border-border">
                <span className="text-[10px] text-muted-foreground block font-medium">
                  Rating
                </span>
                <span className="font-mono tabular-nums font-semibold text-foreground text-xs">
                  +{job.allocationBreakdown.ratingScore}
                </span>
              </div>
              <div className="p-2 rounded-md bg-background border border-border">
                <span className="text-[10px] text-muted-foreground block font-medium">
                  Workload Adj.
                </span>
                <span className="font-mono tabular-nums font-semibold text-foreground text-xs">
                  -{job.allocationBreakdown.dailyLoadPenalty}
                </span>
              </div>
            </div>
          </div>
        ) : job.manualDispatchNotes ? (
          <div className="p-3.5 rounded-md border border-border bg-muted/30 space-y-1.5 text-xs">
            <span className="font-medium text-foreground uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
              {t('federation.jobDetail.manualDispatchLogged', { defaultValue: 'Manual Dispatch Log' })}
            </span>
            <p className="text-foreground bg-background p-2 rounded-md border border-border text-xs font-normal">
              &ldquo;{job.manualDispatchNotes}&rdquo;
            </p>
          </div>
        ) : null}

        {/* Cooperative Payment Audit Breakdown */}
        <div className="p-3.5 rounded-md border border-border bg-card space-y-2.5">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-muted-foreground" />
              {t('federation.jobDetail.statutoryAuditTitle', { defaultValue: 'Payment Ledger' })}
            </span>
            <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              {t('federation.jobDetail.floorGuaranteed', { defaultValue: '100% Protected Base' })}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>{t('federation.jobDetail.customerInvoiced', { defaultValue: 'Customer Invoiced' })}</span>
              <span className="font-mono tabular-nums font-medium text-foreground">
                {formatCurrency(payment.customerPrice)}
              </span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>{t('federation.jobDetail.statutoryBaseFloor', { defaultValue: 'Base Pay (Zero Deductions)' })}</span>
              <span className="font-mono tabular-nums font-medium text-foreground">
                {formatCurrency(payment.basePrice)}
              </span>
            </div>
            {payment.surplus > 0 && (
              <>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>{t('federation.jobDetail.surplusBeyond', { defaultValue: 'Surplus Beyond Base' })}</span>
                  <span className="font-mono tabular-nums text-foreground">
                    +{formatCurrency(payment.surplus)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>{t('federation.jobDetail.welfarePoolShare', { defaultValue: 'Welfare Pool (50%)' })}</span>
                  <span className="font-mono tabular-nums text-foreground">
                    +{formatCurrency(payment.welfareContribution)}
                  </span>
                </div>
              </>
            )}
            <div className="pt-2 border-t border-border flex justify-between items-center text-xs font-semibold">
              <span className="text-foreground">{t('federation.jobDetail.totalDisbursed', { defaultValue: 'Worker Disbursed Pay' })}</span>
              <span className="font-mono tabular-nums text-foreground text-sm font-semibold">
                {formatCurrency(payment.workerEarning)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 rounded-md border border-border bg-background hover:bg-muted text-foreground text-xs font-medium transition-colors"
          >
            {t('federation.jobDetail.close', { defaultValue: 'Close' })}
          </button>
        </div>
      </div>
    </div>
  )
}
