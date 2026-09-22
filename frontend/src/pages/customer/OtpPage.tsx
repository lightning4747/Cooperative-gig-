import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { OTPDisplay } from '@/components/shared/OTPDisplay'
import { useJob } from '@/hooks/useJob'

export function OtpPage() {
  const { t } = useTranslation()
  const { jobId } = useParams<{ jobId: string }>()
  const targetId = jobId || 'job-101'
  const { job } = useJob(targetId)

  const otpValue = job?.otp || '------'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/customer/jobs/${targetId}/tracking`}
          className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black tracking-tight text-foreground">
            {t('job.doorstepOtp', { defaultValue: 'Doorstep Verification OTP' })}
          </h1>
          <p className="text-xs text-muted-foreground">
            Job #{targetId} · Share only when the cooperative worker is present
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <OTPDisplay otp={otpValue} />

        <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <span className="text-foreground/80 font-medium">
            Mutual physical verification guarantees zero ghost dispatches and confirms arrival before service commencement.
          </span>
        </div>
      </div>
    </div>
  )
}
