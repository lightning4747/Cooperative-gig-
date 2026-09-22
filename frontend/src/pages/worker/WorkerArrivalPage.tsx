import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { KeyRound, CheckCircle2, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { OTPInput } from '@/components/shared/OTPInput'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { jobService } from '@/services/jobService'
import { useJob } from '@/hooks/useJob'

export function WorkerArrivalPage() {
  const { t } = useTranslation()
  const { jobId } = useParams<{ jobId: string }>()
  const targetId = jobId || ''
  const navigate = useNavigate()
  const { isLoading } = useJob(targetId)

  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      setErrorMsg('Please enter the 6-digit code.')
      return
    }
    setIsVerifying(true)
    setErrorMsg('')
    try {
      const res = await jobService.verifyOtp(targetId, otp)
      if (res.success) {
        // Linearly advance to Job Detail (now showing Step 4: IN_PROGRESS)
        navigate(`/worker/jobs/${targetId}`)
      } else {
        setErrorMsg('Wrong code. Please check the 6-digit code on customer phone.')
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Wrong code. Please check the 6-digit code on customer phone.'
      )
    } finally {
      setIsVerifying(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        backTo={`/worker/jobs/${targetId}`}
        title={t('worker.execution.doorstepOtpVerification', 'Customer Code (OTP)')}
        subtitle={t('worker.execution.doorstepSubtitle', 'Step 3: Ask customer for their 6-digit code')}
      />

      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-5 text-center max-w-md mx-auto">
        <div className="inline-flex p-3.5 rounded-2xl bg-primary/15 text-primary">
          <KeyRound className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-foreground">
            {t('worker.execution.customerHandshake', 'Enter Customer Code')}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t(
              'worker.execution.handshakeDesc',
              'Ask the customer for the 6-digit code on their phone to start work.'
            )}
          </p>
        </div>

        <div className="py-2 flex justify-center">
          <OTPInput value={otp} onChange={setOtp} />
        </div>

        {errorMsg && (
          <p className="text-xs text-destructive font-semibold">{errorMsg}</p>
        )}

        <button
          type="button"
          onClick={handleVerify}
          disabled={isVerifying || otp.length < 6}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary/90 transition-all min-h-[44px] disabled:opacity-60"
        >
          {isVerifying ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('worker.execution.verifyAndStart', '3. Enter Code & Start Work')}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
          <span>{t('worker.execution.safeVerification', 'Verified at customer location')}</span>
        </div>
      </div>
    </div>
  )
}
