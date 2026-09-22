import { useTranslation } from 'react-i18next'
import type { BookingType } from '@/types/job'
import { cn, formatCurrency } from '@/lib/utils'

interface BookingTypeSelectorProps {
  value: BookingType
  onChange: (type: BookingType) => void
  basePrice?: number
  emergencySupported?: boolean
  className?: string
}

export function BookingTypeSelector({
  value,
  onChange,
  basePrice,
  emergencySupported = true,
  className,
}: BookingTypeSelectorProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('space-y-2.5', className)}>
      {/* Standard Scheduled */}
      <button
        type="button"
        onClick={() => onChange('STANDARD')}
        className={cn(
          'w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer',
          value === 'STANDARD'
            ? 'border-foreground bg-muted/40 shadow-2xs'
            : 'border-border bg-card hover:bg-muted/20'
        )}
      >
        <div className="pt-0.5 shrink-0">
          <div
            className={cn(
              'w-4 h-4 rounded-full border flex items-center justify-center transition-colors',
              value === 'STANDARD'
                ? 'border-foreground'
                : 'border-muted-foreground/50'
            )}
          >
            {value === 'STANDARD' && (
              <div className="w-2 h-2 rounded-full bg-foreground" />
            )}
          </div>
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-bold text-foreground">
              {t('booking.standardTitle', { defaultValue: 'Standard Scheduled' })}
            </span>
            {basePrice !== undefined && (
              <span className="font-mono text-xs font-bold text-foreground shrink-0">
                {formatCurrency(basePrice + 100)}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('booking.standardDesc', {
              defaultValue: 'Schedule for an upcoming date and convenient time slot.',
            })}
          </p>
        </div>
      </button>

      {/* On-Demand */}
      <button
        type="button"
        onClick={() => onChange('ON_DEMAND')}
        className={cn(
          'w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer',
          value === 'ON_DEMAND'
            ? 'border-foreground bg-muted/40 shadow-2xs'
            : 'border-border bg-card hover:bg-muted/20'
        )}
      >
        <div className="pt-0.5 shrink-0">
          <div
            className={cn(
              'w-4 h-4 rounded-full border flex items-center justify-center transition-colors',
              value === 'ON_DEMAND'
                ? 'border-foreground'
                : 'border-muted-foreground/50'
            )}
          >
            {value === 'ON_DEMAND' && (
              <div className="w-2 h-2 rounded-full bg-foreground" />
            )}
          </div>
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-bold text-foreground">
              {t('booking.onDemandTitle', { defaultValue: 'On-Demand' })}
            </span>
            {basePrice !== undefined && (
              <span className="font-mono text-xs font-bold text-foreground shrink-0">
                {formatCurrency(basePrice + 150)}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('booking.onDemandDesc', {
              defaultValue: 'Request immediate dispatch of the nearest available verified worker.',
            })}
          </p>
        </div>
      </button>

      {/* Emergency Priority */}
      {emergencySupported && (
        <button
          type="button"
          onClick={() => onChange('EMERGENCY')}
          className={cn(
            'w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer',
            value === 'EMERGENCY'
              ? 'border-foreground bg-muted/40 shadow-2xs'
              : 'border-border bg-card hover:bg-muted/20'
          )}
        >
          <div className="pt-0.5 shrink-0">
            <div
              className={cn(
                'w-4 h-4 rounded-full border flex items-center justify-center transition-colors',
                value === 'EMERGENCY'
                  ? 'border-foreground'
                  : 'border-muted-foreground/50'
              )}
            >
              {value === 'EMERGENCY' && (
                <div className="w-2 h-2 rounded-full bg-foreground" />
              )}
            </div>
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-sm font-bold text-foreground">
                {t('booking.emergencyTitle', { defaultValue: 'Emergency Priority' })}
              </span>
              {basePrice !== undefined && (
                <span className="font-mono text-xs font-bold text-foreground shrink-0">
                  {formatCurrency(basePrice + 250)}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('booking.emergencyDesc', {
                defaultValue: 'High-priority instant broadcast across all nearby verified workers.',
              })}
            </p>
          </div>
        </button>
      )}
    </div>
  )
}
