import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Star, Send, Loader2 } from 'lucide-react'
import { StarRating } from '@/components/shared/StarRating'
import { ratingSchema, type RatingFormData } from '@/lib/schemas'
import { cn } from '@/lib/utils'

interface RatingFormProps {
  jobId: string
  workerName?: string
  onSubmit: (rating: number, feedback: string) => Promise<void> | void
  onSkip?: () => void
  className?: string
}

export function RatingForm({
  workerName = 'Cooperative Partner',
  onSubmit,
  onSkip,
  className,
}: RatingFormProps) {
  const { t } = useTranslation()

  const {
    control,
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      stars: 5,
      feedback: '',
    },
  })

  const feedbackValue = useWatch({ control, name: 'feedback' }) || ''

  const onFormSubmit = async (data: RatingFormData) => {
    await onSubmit(data.stars, (data.feedback || '').trim())
  }

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className={cn('rounded-xl border border-border bg-card p-6 shadow-xs space-y-6', className)}
    >
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-full bg-primary/15 text-primary mb-1">
          <Star className="w-6 h-6 fill-primary" />
        </div>
        <h3 className="text-lg font-black text-foreground">
          {t('rating.title', { defaultValue: 'Rate Your Experience' })}
        </h3>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          {t('rating.subtitle', {
            defaultValue: `How was the service provided by ${workerName}?`,
          })}
        </p>
      </div>

      {/* Interactive Stars */}
      <div className="flex flex-col items-center justify-center py-2 space-y-1">
        <Controller
          name="stars"
          control={control}
          render={({ field }) => (
            <StarRating value={field.value} onChange={field.onChange} size="lg" />
          )}
        />
        {errors.stars && (
          <p className="text-xs text-destructive">{errors.stars.message}</p>
        )}
      </div>

      {/* Feedback Textarea */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-foreground block">
          {t('rating.feedbackLabel', { defaultValue: 'Comments or Notes (Optional)' })}
        </label>
        <textarea
          {...register('feedback')}
          rows={3}
          maxLength={300}
          placeholder={t('rating.placeholder', {
            defaultValue: 'Share details regarding punctuality, craftsmanship, and professionalism...',
          })}
          className="w-full p-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none shadow-xs"
        />
        <div className="flex justify-between items-center text-[11px] text-muted-foreground">
          {errors.feedback ? (
            <span className="text-destructive">{errors.feedback.message}</span>
          ) : (
            <span />
          )}
          <span className="font-mono">{feedbackValue.length} / 300</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xs hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('rating.submitting', { defaultValue: 'Submitting...' })}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{t('rating.submit', { defaultValue: 'Submit Review' })}</span>
            </>
          )}
        </button>

        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-1"
          >
            {t('rating.skip', { defaultValue: 'Skip for now' })}
          </button>
        )}
      </div>
    </form>
  )
}

