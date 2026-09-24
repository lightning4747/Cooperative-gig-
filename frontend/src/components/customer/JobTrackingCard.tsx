import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Star,
  MapPin,
  CreditCard,
  CheckCircle,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { JobProgressBar } from '@/components/shared/JobProgressBar'
import { OTPDisplay } from '@/components/shared/OTPDisplay'
import { MatchedWorkerProfileCard } from '@/components/worker'
import { formatCurrency } from '@/lib/utils'
import { getStatusHeadlineConfig } from '@/lib/jobStatus'
import type { Job } from '@/types/job'

interface JobTrackingCardProps {
  job: Job
  onCancel?: () => void
  className?: string
}

export function JobTrackingCard({ job, onCancel, className }: JobTrackingCardProps) {
  const { t } = useTranslation()
  const headlineConfig = getStatusHeadlineConfig(job.status)
  const headlineTitle = t(headlineConfig.titleKey, { defaultValue: headlineConfig.defaultTitle })

  return (
    <div className={`space-y-5 ${className || ''}`}>
      {/* Stepper Lifecycle Track */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <JobProgressBar status={job.status} isEmergency={job.isEmergency} />
      </div>

      {/* Status Headline Banner */}
      <div className="rounded-xl border border-border border-l-4 border-l-amber-500 bg-card p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-foreground">{headlineTitle}</h2>
        </div>

        {/* Location & Wage Floor & Customer Paid Badges */}
        <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate max-w-[200px]">{job.location?.formattedAddress || 'Gandhipuram, Coimbatore'}</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-muted-foreground">
              {t('common.guaranteedWageFloor', { defaultValue: 'Wage Floor' })}:{' '}
              <strong className="text-foreground">{formatCurrency(job.basePrice || 500)}</strong>
            </span>
            <span className="text-muted-foreground">
              {t('common.customerPaid', { defaultValue: 'Customer Paid' })}:{' '}
              {job.isPaid || job.paidAmount || job.status === 'COMPLETED' ? (
                <strong className="text-emerald-600 font-bold">
                  {formatCurrency(job.paidAmount || job.grossAmount || job.basePrice || 500)}
                </strong>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-bold">Pending</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Advance Payment Action when ACCEPTED and Unpaid */}
      {job.status === 'ACCEPTED' && !job.isPaid && (
        <div className="p-5 rounded-2xl border border-border border-l-4 border-l-amber-500 bg-card space-y-4 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 inline-flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center shrink-0">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                {t('job.paymentRequiredTitle', { defaultValue: 'Advance Payment Required' })}
              </span>
              <h3 className="text-base font-black text-foreground">
                {t('job.payToAuthorize', { defaultValue: 'Pay to Authorize Departure' })}
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-mono text-xs font-bold shrink-0 border border-amber-200/60 dark:border-amber-800/40">
              Payment Pending
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <Link
              to={`/customer/jobs/${job.id}/payment`}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {t('job.payAmountNow', {
                  amount: formatCurrency(job.grossAmount || job.basePrice),
                  defaultValue: `Pay Now · ${formatCurrency(job.grossAmount || job.basePrice)}`,
                })}
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Advance Payment Confirmed banner when ACCEPTED and Paid */}
      {job.status === 'ACCEPTED' && job.isPaid && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{t('job.advancePaymentConfirmed', { defaultValue: 'Advance Payment Confirmed · Departure Authorized' })}</span>
        </div>
      )}

      {/* Mutual OTP Section when ARRIVED */}
      {job.status === 'ARRIVED' && (
        <OTPDisplay
          otp={job.otp || '123456'}
          title={t('job.mutualOtpTitle', { defaultValue: 'Doorstep OTP' })}
          instructions={t('job.mutualOtpDesc', {
            defaultValue: 'Share this OTP with the worker upon arrival.',
          })}
        />
      )}

      {/* Assigned Matched Worker Profile Card */}
      {job.workerId && job.status !== 'SEARCHING' && job.status !== 'BROADCAST' && (
        <MatchedWorkerProfileCard
          workerId={job.workerId}
          name={job.workerName || 'Arun Electrician'}
          phone={job.workerPhone ? (job.workerPhone.startsWith('+91') ? job.workerPhone : `+91 ${job.workerPhone}`) : '+91 98765 43211'}
          societyName={job.societyName || 'Coimbatore City Labour & Artisans Cooperative Society'}
          societyRegistration="TN-CBE-2023-011"
          membershipId="MEM-CBE-001"
          rating={job.workerRating || 4.9}
          totalJobs={48}
          eShramUan="UAN-9011-4432-1102"
          skillCertification={`Skill India Certified · ${job.serviceCategoryName || 'Technician'}`}
          skillLevel="Level 3 Certified"
          showContactAction={true}
        />
      )}

      {/* Completion Action CTA */}
      {job.status === 'COMPLETED' && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3 text-center">
          <div className="inline-flex p-2 rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-foreground">
              {job.isPaid
                ? t('job.serviceSettled', { defaultValue: 'Service Completed' })
                : t('job.serviceCompleted', { defaultValue: 'Service Completed' })}
            </h4>
          </div>
          {job.isPaid ? (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to={`/customer/jobs/${job.id}/invoice`}
                className="h-11 flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary/90 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>{t('job.viewInvoice', { defaultValue: 'Official Invoice' })}</span>
              </Link>
              <Link
                to={`/customer/jobs/${job.id}/rating`}
                className="h-11 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold text-xs shadow-xs transition-all"
              >
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{t('job.rateWorker', { defaultValue: 'Rate Service' })}</span>
              </Link>
            </div>
          ) : (
            <Link
              to={`/customer/jobs/${job.id}/payment`}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xs hover:bg-primary/90 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>{t('job.proceedPayment', { defaultValue: 'Proceed to Payment & Invoice' })}</span>
            </Link>
          )}
        </div>
      )}

      {/* Expired Status Helper & Action */}
      {job.status === 'EXPIRED' && (
        <div className="p-5 rounded-2xl border border-border border-l-4 border-l-amber-500 bg-card space-y-3 text-center shadow-xs">
          <div className="inline-flex p-2.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-foreground">
              {t('job.noWorkerFoundTitle', { defaultValue: 'No Workers Available Nearby' })}
            </h4>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2.5">
            <Link
              to="/customer/services"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all inline-flex items-center justify-center gap-1.5"
            >
              <span>{t('common.browseServices', { defaultValue: 'Browse Services & Re-Book' })}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Active Cancellation Option */}
      {(job.status === 'SEARCHING' || job.status === 'OFFERED' || job.status === 'BROADCAST') && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-destructive text-xs font-bold text-center transition-all cursor-pointer shadow-2xs active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {t('job.cancelBooking', { defaultValue: 'Cancel this booking request' })}
        </button>
      )}
    </div>
  )
}
