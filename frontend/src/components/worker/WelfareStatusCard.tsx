import { useTranslation } from 'react-i18next'

interface WelfareStatusCardProps {
  balance?: number
  membershipId?: string
  recentEntries?: Array<{
    id: string
    date: string
    task: string
    surplusContribution: number
    reason: string
  }>
}

export function WelfareStatusCard({
  balance = 0,
  recentEntries = [],
}: WelfareStatusCardProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      {/* Welfare Balance Card */}
      <div className="p-4 sm:p-5 rounded-xl border border-border bg-card shadow-xs space-y-1">
        <span className="text-xs font-semibold text-muted-foreground block">
          {t('worker.welfare.individualBalance', 'Welfare Balance')}
        </span>
        <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground">
          ₹{balance.toFixed(2)}
        </div>
      </div>

      {/* Welfare Contributions List */}
      <div className="p-4 sm:p-5 rounded-xl border border-border bg-card shadow-xs space-y-3">
        <div className="pb-2 border-b border-border/70">
          <h3 className="text-sm font-bold text-foreground">
            {t('worker.welfare.recentSurplusTitle', 'Recent Welfare Contributions')}
          </h3>
        </div>

        <div className="space-y-2 text-xs">
          {recentEntries.length === 0 ? (
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/50 text-center text-muted-foreground text-xs">
              {t(
                'worker.welfare.noEntries',
                'No welfare contributions recorded yet.'
              )}
            </div>
          ) : (
            recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded-lg bg-secondary/40 border border-border/60 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-foreground block">{entry.task}</span>
                  <span className="text-[11px] text-muted-foreground">{entry.date}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-600 text-sm block">
                    +₹{entry.surplusContribution}.00
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

