import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { jobService } from '@/services/jobService'
import { saveLocalCompletedSettlement } from '@/services/workerService'
import { useJob } from '@/hooks/useJob'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { calculatePayment } from '@/lib/paymentCalc'

export function WorkerCompletePage() {
  const { t } = useTranslation()
  const { jobId } = useParams<{ jobId: string }>()
  const targetId = jobId || ''
  const navigate = useNavigate()
  const { job, isLoading } = useJob(targetId)
  const [isFinishing, setIsFinishing] = useState(false)

  const handleComplete = async () => {
    setIsFinishing(true)
    try {
      const bPrice = job?.basePrice || 450
      const cPrice = job?.paidAmount || job?.grossAmount || bPrice
      const paymentCalc = calculatePayment(cPrice, bPrice, job?.welfareRate ?? 0.5)

      saveLocalCompletedSettlement({
        id: `settle-${targetId}-${Date.now()}`,
        jobId: targetId,
        basePrice: paymentCalc.basePrice,
        grossAmount: cPrice,
        workerEarning: paymentCalc.workerEarning,
        welfareContribution: paymentCalc.welfareContribution,
        subserviceName: job?.subserviceName || 'Cooperative Service',
        bookingType: job?.bookingType || 'STANDARD',
        createdAt: new Date().toISOString(),
        status: 'PAID',
      })

      await jobService.updateStatus(targetId, 'COMPLETED')
    } catch {
      // fallback
    } finally {
      setIsFinishing(false)
    }
    navigate('/worker/passbook')
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  const basePrice = job?.basePrice || 0
  const customerPrice = job?.paidAmount || job?.grossAmount || basePrice
  const breakdown = calculatePayment(customerPrice, basePrice, job?.welfareRate ?? 0.5)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/worker/jobs/${targetId}`}
          className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground min-h-[48px] min-w-[48px] flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black tracking-tight text-foreground">
            {t('worker.execution.completeWork', 'Finish Work & Get Paid')}
          </h1>
          <p className="text-xs text-muted-foreground">
            {job?.subserviceName || 'Pipe leakage repair'}
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-5 max-w-lg mx-auto">
        {/* Cooperative Wage Breakdown */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            {t('worker.execution.paymentSummary', 'Payment Summary')}
          </span>

          <div className="p-4 rounded-xl bg-secondary/50 border border-border/80 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('worker.execution.guaranteedBase', 'Base Pay')}:
              </span>
              <span className="font-mono font-bold text-foreground">
                ₹{breakdown.basePrice}.00
              </span>
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span className="flex items-center gap-1">
                <span>{t('worker.execution.welfareSurplus', 'Welfare Contribution')}:</span>
              </span>
              <span className="font-mono font-bold text-primary">
                +₹{breakdown.welfareContribution}.00
              </span>
            </div>

            <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
              <span>{t('worker.execution.netWorkerCredit', 'Worker Receives')}:</span>
              <span className="font-mono text-primary text-base">
                ₹{breakdown.workerEarning}.00
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleComplete}
          disabled={isFinishing}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xs hover:bg-primary/90 transition-all min-h-[48px] cursor-pointer"
        >
          {isFinishing ? (
            <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('worker.execution.markCompletedBtn', '4. Mark Work Done & Get Paid')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
