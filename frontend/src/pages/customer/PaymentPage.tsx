import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/shared/PageHeader'
import { PaymentScreen } from '@/components/customer/PaymentScreen'
import { useJob } from '@/hooks/useJob'

export function PaymentPage() {
  const { t } = useTranslation()
  const { jobId } = useParams<{ jobId: string }>()
  const targetId = jobId || 'job-101'
  const navigate = useNavigate()
  const { job } = useJob(targetId)

  const customerPrice = job?.grossAmount || job?.basePrice || 500
  const basePrice = job?.basePrice || 500

  const handlePaymentSuccess = () => {
    if (job?.status === 'ACCEPTED') {
      navigate(`/customer/jobs/${targetId}/tracking`)
    } else {
      navigate(`/customer/jobs/${targetId}/invoice`)
    }
  }

  const rawId = job?.id || targetId || ''
  const formattedJobId = rawId.replace(/^job-/, '').slice(0, 8).toUpperCase()

  return (
    <div className="space-y-6">
      <PageHeader
        backTo={`/customer/jobs/${targetId}/tracking`}
        title={t('payment.settlementTitle', { defaultValue: 'Service Settlement' })}
        subtitle={t('payment.settlementSubtitle', {
          id: formattedJobId,
          defaultValue: `Job #${formattedJobId} · Ethical wage floor with cooperative protection`,
        })}
      />

      <PaymentScreen
        jobId={targetId}
        customerPrice={customerPrice}
        basePrice={basePrice}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}

