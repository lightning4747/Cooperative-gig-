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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-muted-foreground bg-secondary px-2.5 py-0.5 rounded">
                {job.id}
              </span>
              <StatusBadge status={job.status} />
              {job.isEmergency && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
                  {getTranslatedBookingType(t, 'EMERGENCY')}
                </span>
              )}
            </div>
            <h2 className="text-lg font-black text-foreground">
              {getTranslatedSubserviceName(t, job.subserviceId, job.subserviceName)}
            </h2>
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              {getTranslatedCategoryName(t, job.serviceCategoryId, job.serviceCategoryName)} · {getTranslatedBookingType(t, job.bookingType)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-border bg-secondary/80 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label={t('federation.jobDetail.close', { defaultValue: 'Close Audit Inspector' })}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Card */}
          <div className="p-4 rounded-xl border border-border/80 bg-secondary/30 space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              {t('federation.jobDetail.customerRequester', { defaultValue: 'Customer Requester' })}
            </span>
            <div className="space-y-1">
              <div className="font-bold text-foreground text-sm">
                {getTranslatedPersonName(t, job.customerName)}
              </div>
              <div className="text-muted-foreground font-mono flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                +91 {job.customerPhone}
              </div>
              <div className="text-muted-foreground flex items-start gap-1.5 pt-1">
                <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0 mt-0.5" />
                <span>{job.location.formattedAddress}</span>
              </div>
            </div>
          </div>

          {/* Assigned Worker Card */}
          <div className="p-4 rounded-xl border border-border/80 bg-secondary/30 space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              {t('federation.jobDetail.assignedMember', { defaultValue: 'Assigned Cooperative Member' })}
            </span>
            {job.workerName ? (
              <div className="space-y-1">
                <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <User className="w-4 h-4 text-primary" />
                  {getTranslatedPersonName(t, job.workerName)}
                </div>
                <div className="text-muted-foreground font-mono flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  +91 {job.workerPhone || '9876543210'}
                </div>
                {job.otp && (
                  <div className="pt-1.5 flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      {t('federation.jobDetail.doorstepOtp', { defaultValue: 'Doorstep Mutual OTP:' })}
                    </span>
                    <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      {job.otp}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 text-center text-amber-700 dark:text-amber-400 font-medium italic">
                {t('federation.jobDetail.awaitingMatch', { defaultValue: 'Awaiting worker match / broadcast acceptance' })}
              </div>
            )}
          </div>
        </div>

        {/* Allocation Inspector Breakdown */}
        {job.allocationBreakdown ? (
          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {t('federation.jobDetail.allocationAuditTitle', { defaultValue: 'Deterministic Fair Allocation Audit' })}
              </span>
              <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">
                {t('federation.jobDetail.score', { defaultValue: 'Score:' })} {job.allocationBreakdown.totalScore.toFixed(2)}
              </span>
            </div>

            <p className="text-xs text-foreground bg-card p-3 rounded-lg border border-border/80 leading-relaxed font-medium">
              &ldquo;{job.allocationBreakdown.explanation}&rdquo;
            </p>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-card border border-border/60">
                <span className="text-[10px] text-muted-foreground block font-bold">
                  {t('federation.jobDetail.proximityWeight', { defaultValue: 'Proximity Weight' })}
                </span>
                <span className="font-mono font-bold text-foreground">
                  +{job.allocationBreakdown.proximityScore} pts
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-card border border-border/60">
                <span className="text-[10px] text-muted-foreground block font-bold">
                  {t('federation.jobDetail.ratingCredential', { defaultValue: 'Rating Credential' })}
                </span>
                <span className="font-mono font-bold text-foreground">
                  +{job.allocationBreakdown.ratingScore} pts
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-card border border-border/60">
                <span className="text-[10px] text-muted-foreground block font-bold">
                  {t('federation.jobDetail.dailyLoadFair', { defaultValue: 'Daily Load Fair Balance' })}
                </span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                  -{job.allocationBreakdown.dailyLoadPenalty} pts
                </span>
              </div>
            </div>
          </div>
        ) : job.manualDispatchNotes ? (
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2 text-xs">
            <span className="font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {t('federation.jobDetail.manualDispatchLogged', { defaultValue: 'Apex Manual Telephone Dispatch Logged' })}
            </span>
            <p className="text-foreground italic bg-card p-2.5 rounded border border-border/80">
              &ldquo;{job.manualDispatchNotes}&rdquo;
            </p>
          </div>
        ) : null}

        {/* Cooperative Payment Audit Breakdown */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-primary" />
              {t('federation.jobDetail.statutoryAuditTitle', { defaultValue: 'Statutory Cooperative Wage Settlement Audit' })}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {t('federation.jobDetail.floorGuaranteed', { defaultValue: '100% Floor Guaranteed' })}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>{t('federation.jobDetail.customerInvoiced', { defaultValue: 'Customer Invoiced Total' })}</span>
              <span className="font-mono font-bold text-foreground">
                {formatCurrency(payment.customerPrice)}
              </span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>{t('federation.jobDetail.statutoryBaseFloor', { defaultValue: 'Statutory Base Floor (Zero Deductions)' })}</span>
              <span className="font-mono font-bold text-foreground">
                {formatCurrency(payment.basePrice)}
              </span>
            </div>
            {payment.surplus > 0 && (
              <>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>{t('federation.jobDetail.surplusBeyond', { defaultValue: 'Surplus Beyond Floor' })}</span>
                  <span className="font-mono font-bold text-blue-600">
                    +{formatCurrency(payment.surplus)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>{t('federation.jobDetail.welfarePoolShare', { defaultValue: 'Collective Welfare Pool (50% of surplus)' })}</span>
                  <span className="font-mono font-bold text-emerald-600">
                    +{formatCurrency(payment.welfareContribution)}
                  </span>
                </div>
              </>
            )}
            <div className="pt-2 border-t border-border flex justify-between items-center text-sm font-bold">
              <span className="text-foreground">{t('federation.jobDetail.totalDisbursed', { defaultValue: 'Total Disbursed Member Earning' })}</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400 text-base">
                {formatCurrency(payment.workerEarning)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary/90 min-h-[44px] transition-colors"
          >
            {t('federation.jobDetail.close', { defaultValue: 'Close Audit Inspector' })}
          </button>
        </div>
      </div>
    </div>
  )
}
