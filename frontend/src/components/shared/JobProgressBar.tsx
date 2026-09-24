import { useTranslation } from 'react-i18next'
import {
  Clock,
  UserCheck,
  Wrench,
  CheckCircle2,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { JobStatus } from '@/types/job'

interface JobProgressBarProps {
  status: JobStatus
  isEmergency?: boolean
  className?: string
}

type TimelineStage = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED'

interface StageConfig {
  key: TimelineStage
  label: string
  icon: typeof Clock
}

const TIMELINE_STAGES: StageConfig[] = [
  { key: 'PENDING', label: 'Pending', icon: Clock },
  { key: 'ACCEPTED', label: 'Accepted', icon: UserCheck },
  { key: 'IN_PROGRESS', label: 'In Progress', icon: Wrench },
  { key: 'COMPLETED', label: 'Completed', icon: CheckCircle2 },
]

function getStageIndex(status: JobStatus): number {
  switch (status) {
    case 'SEARCHING':
    case 'OFFERED':
    case 'BROADCAST':
      return 0
    case 'ACCEPTED':
    case 'TRAVELLING':
      return 1
    case 'ARRIVED':
    case 'IN_PROGRESS':
      return 2
    case 'COMPLETED':
      return 3
    default:
      return 0
  }
}

export function JobProgressBar({
  status,
  className,
}: JobProgressBarProps) {
  const { t } = useTranslation()

  if (status === 'CANCELLED' || status === 'EXPIRED') {
    return (
      <div className={cn('p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-center text-xs font-semibold text-destructive', className)}>
        {status === 'CANCELLED' ? 'Booking Request Cancelled' : 'Booking Expired — No worker assigned'}
      </div>
    )
  }

  const currentStageIndex = getStageIndex(status)

  return (
    <div className={cn('w-full py-1', className)}>
      <div className="flex items-center justify-between w-full">
        {TIMELINE_STAGES.map((stage, idx) => {
          const isDone = currentStageIndex > idx
          const isCurrent = currentStageIndex === idx
          const isLast = idx === TIMELINE_STAGES.length - 1
          const Icon = stage.icon

          return (
            <div key={stage.key} className="flex flex-1 items-center last:flex-none">
              {/* Stage Node */}
              <div className="flex flex-col items-center flex-1 min-w-[64px] px-1 text-center">
                <div
                  className={cn(
                    'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shrink-0',
                    isDone && 'bg-primary text-primary-foreground font-bold shadow-2xs',
                    isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/25 font-bold animate-pulse',
                    !isDone && !isCurrent && 'bg-secondary text-muted-foreground border border-border'
                  )}
                >
                  {isDone ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={cn(
                    'mt-1.5 text-[11px] sm:text-xs font-semibold tracking-tight leading-tight',
                    isCurrent ? 'text-primary font-bold' : isDone ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {t(`job.timeline.${stage.key.toLowerCase()}`, { defaultValue: stage.label })}
                </span>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div
                  className={cn(
                    'h-1 flex-1 -mx-2 mb-4 transition-colors shrink-0 rounded-full',
                    isDone ? 'bg-primary' : 'bg-secondary'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
