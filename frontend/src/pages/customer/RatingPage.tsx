import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { RatingForm } from '@/components/customer/RatingForm'
import { useJob } from '@/hooks/useJob'
import { jobService } from '@/services/jobService'
import { getTranslatedPersonName } from '@/lib/serviceTranslation'

export function RatingPage() {
  const { t } = useTranslation()
  const { jobId } = useParams<{ jobId: string }>()
  const targetId = jobId || 'job-101'
  const navigate = useNavigate()
  const { job } = useJob(targetId)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (rating: number, feedback: string) => {
    try {
      await jobService.submitRating(targetId, rating as 1 | 2 | 3 | 4 | 5, feedback)
    } catch (err) {
      console.error('Failed to submit rating:', err)
    } finally {
      setSubmitted(true)
      setTimeout(() => {
        navigate('/customer')
      }, 2000)
    }
  }

  const handleSkip = () => {
    navigate('/customer')
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto py-2">
      <PageHeader
        title={t('rating.title', { defaultValue: 'Rate & Review' })}
        subtitle={t('rating.subtitle', {
          defaultValue: 'Rate your service experience to support cooperative quality standards',
        })}
      />

      {submitted ? (
        <div className="p-8 rounded-2xl border border-border bg-card text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-foreground">
            {t('rating.submittedTitle', { defaultValue: 'Review Submitted Successfully' })}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('rating.submittedDesc', {
              defaultValue:
                'Thank you for supporting cooperative gig workers with transparent, community-verified reviews.',
            })}
          </p>
        </div>
      ) : (
        <RatingForm
          jobId={targetId}
          workerName={getTranslatedPersonName(t, job?.workerName || 'Ramesh Kumar')}
          onSubmit={handleSubmit}
          onSkip={handleSkip}
        />
      )}
    </div>
  )
}

