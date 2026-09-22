import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { JobStatus } from '@/types/job'

interface JobProgressBarProps {
  status: JobStatus
  isEmergency?: boolean
  className?: string
}

const STANDARD_STEPS: JobStatus[] = [
  'SEARCHING',
  'OFFERED',
  'ACCEPTED',
  'TRAVELLING',
  'ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
]

const EMERGENCY_STEPS: JobStatus[] = [
  'SEARCHING',
  'BROADCAST',
  'ACCEPTED',
  'TRAVELLING',
  'ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
]

interface StepItemProps {
  step: JobStatus
  index: number
  currentIndex: number
  isLast: boolean
  label: string
}

function StepItem({ step, index, currentIndex, isLast, label }: StepItemProps) {
  const isDone = currentIndex > index
  const isCurrent = currentIndex === index

  return (
    <div key={step} className="flex flex-1 items-start last:flex-none">
      <div className="flex flex-col items-center flex-1 min-w-[72px] px-1">
        <div
          className={cn(
            'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0',
            isDone && 'bg-primary text-primary-foreground',
            isCurrent && 'bg-primary/20 text-primary ring-2 ring-primary ring-offset-2 animate-pulse',
            !isDone && !isCurrent && 'bg-secondary text-muted-foreground border border-border'
          )}
        >
          {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : index + 1}
        </div>
        <span
          className={cn(
            'mt-1.5 text-[10px] sm:text-[11px] font-medium text-center leading-snug whitespace-normal break-words',
            isCurrent ? 'text-primary font-bold' : isDone ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {label}
        </span>
      </div>
      {!isLast && (
        <div
          className={cn(
            'h-[2px] flex-1 mt-3.5 sm:mt-4 -mx-1 transition-colors shrink-0',
            isDone ? 'bg-primary' : 'bg-border'
          )}
        />
      )}
    </div>
  )
}

export function JobProgressBar({
  status,
  isEmergency = false,
  className,
}: JobProgressBarProps) {
  const { t } = useTranslation()
  const steps = isEmergency ? EMERGENCY_STEPS : STANDARD_STEPS
  const currentIndex = steps.indexOf(status)

  if (status === 'CANCELLED' || status === 'EXPIRED') {
    return (
      <div className={cn('p-3 rounded-lg bg-slate-100 border border-slate-200 text-center text-sm font-medium text-slate-700', className)}>
        {t(`job.status.${status.toLowerCase()}`, { defaultValue: status })}
      </div>
    )
  }

  const progressPercent = ((Math.max(0, currentIndex) + 1) / steps.length) * 100

  return (
    <div className={cn('w-full py-2', className)}>
      {/* Mobile condensed bar */}
      <div className="md:hidden space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-muted-foreground">
          <span>{t('common.status')}: <span className="text-foreground">{t(`job.status.${status.toLowerCase()}`, { defaultValue: status })}</span></span>
          <span>{Math.max(1, currentIndex + 1)} / {steps.length}</span>
        </div>
        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Desktop stepper track */}
      <div className="hidden md:flex items-center justify-between w-full">
        {steps.map((step, idx) => (
          <StepItem
            key={step}
            step={step}
            index={idx}
            currentIndex={currentIndex}
            isLast={idx === steps.length - 1}
            label={t(`job.status.${step.toLowerCase()}`, { defaultValue: step })}
          />
        ))}
      </div>
    </div>
  )
}
