import { useTranslation } from 'react-i18next'
import {
  RotateCcw,
  Maximize2,
  Clock,
} from 'lucide-react'
import { useEmergencyBroadcast } from '@/hooks/useEmergencyBroadcast'

interface EmergencyCountdownProps {
  jobId: string
  timeoutSeconds?: number
  onExpandSearch?: () => void
  onConvertToOnDemand?: () => void
  className?: string
}

export function EmergencyCountdown({
  jobId,
  timeoutSeconds = 60,
  onExpandSearch,
  onConvertToOnDemand,
  className,
}: EmergencyCountdownProps) {
  const { t } = useTranslation()
  const { secondsRemaining, isTimedOut, retryBroadcast } = useEmergencyBroadcast(
    jobId,
    timeoutSeconds
  )

  const progress = (secondsRemaining / timeoutSeconds) * 100

  return (
    <div className={`rounded-xl border border-destructive/30 bg-destructive/5 p-3.5 sm:p-4 shadow-2xs space-y-3 ${className || ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse shrink-0" />
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
              {isTimedOut
                ? t('emergency.timeoutTitle', { defaultValue: 'No Immediate Responder' })
                : t('emergency.broadcastingTitle', { defaultValue: 'Broadcasting to Nearby Cooperative Workers' })}
            </h3>
            <span className="text-[11px] text-muted-foreground block truncate">
              {isTimedOut
                ? t('emergency.timeoutDesc', { defaultValue: 'Expand search radius or re-broadcast.' })
                : t('emergency.broadcastingDesc', { defaultValue: 'Searching nearest verified partners in your zone.' })}
            </span>
          </div>
        </div>

        {!isTimedOut && (
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <span className="font-mono text-xs font-black text-destructive px-2 py-0.5 rounded bg-background border border-destructive/30 tabular-nums">
              {secondsRemaining}s
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-destructive">
              Live Broadcast
            </span>
          </div>
        )}
      </div>

      {!isTimedOut && (
        <div className="w-full bg-border/60 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-destructive h-full transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Narrative Headline */}
      <div className="space-y-1.5 max-w-sm mx-auto">
        <h3 className="text-base font-black text-foreground">
          {isTimedOut
            ? t('emergency.timeoutTitle', { defaultValue: 'No Immediate Responder' })
            : t('emergency.broadcastingTitle', { defaultValue: 'Broadcasting to Nearby Cooperative Workers' })}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {isTimedOut
            ? t('emergency.timeoutDesc', {
                defaultValue:
                  '',
              })
            : t('emergency.broadcastingDesc', {
                defaultValue:
                  '',
              })}
        </p>
      </div>

      {/* Fallback Action Options upon Timeout */}
      {isTimedOut ? (
        <div className="space-y-2.5 pt-2">
          {/* Retry Broadcast */}
          <button
            type="button"
            onClick={retryBroadcast}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-destructive text-destructive-foreground font-bold text-xs shadow-xs hover:bg-destructive/90 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('emergency.retryCTA', { defaultValue: 'Try Emergency Broadcast Again' })}</span>
          </button>

          {/* Expand Search Radius */}
          {onExpandSearch && (
            <button
              type="button"
              onClick={onExpandSearch}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border border-border bg-card text-foreground hover:bg-muted/50 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5 text-primary" />
              <span>{t('emergency.expandCTA', { defaultValue: 'Expand Search Radius (+5 km)' })}</span>
            </button>
          )}

          {/* Convert to On-Demand */}
          {onConvertToOnDemand && (
            <button
              type="button"
              onClick={onConvertToOnDemand}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 text-primary-foreground font-bold text-xs hover:bg-primary/20 transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span style={{ color: 'black' }}>
                {t('emergency.convertToOnDemandCTA', { defaultValue: 'Book as Standard On-Demand' })}
              </span>
            </button>
          )}
        </div>
      ) : (
      <div></div>)}
    </div>
  )
}
