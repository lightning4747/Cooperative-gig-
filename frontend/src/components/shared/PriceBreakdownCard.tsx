import { useTranslation } from 'react-i18next'
import { CheckCircle2, HeartHandshake } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import { calculatePayment } from '@/lib/paymentCalc'

interface PriceBreakdownCardProps {
  customerPrice: number
  basePrice: number
  welfareRate?: number
  showSurplusDetails?: boolean
  className?: string
}

export function PriceBreakdownCard({
  customerPrice,
  basePrice,
  welfareRate = 0.05,
  showSurplusDetails = true,
  className,
}: PriceBreakdownCardProps) {
  const { t } = useTranslation()
  const breakdown = calculatePayment(customerPrice, basePrice, welfareRate)

  return (
    <div className={cn('p-4 rounded-xl border border-border bg-card shadow-sm space-y-3', className)}>
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <span className="text-sm font-semibold text-foreground">
          {t('payment.customerPrice', { defaultValue: 'Total' })}
        </span>
        <span className="font-mono text-base font-bold text-foreground tabular-nums">
          {formatCurrency(breakdown.customerPrice)}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-medium text-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {t('payment.basePrice', { defaultValue: 'Base Pay' })}
          </span>
          <span className="font-mono tabular-nums text-foreground font-semibold">
            {formatCurrency(breakdown.basePrice)}
          </span>
        </div>

        {showSurplusDetails && (
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-primary" />
              {t('payment.welfareContribution', { defaultValue: 'Welfare Contribution' })}
            </span>
            <span className="font-mono tabular-nums text-primary font-medium">
              +{formatCurrency(breakdown.welfareContribution)}
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-border flex items-center justify-between font-semibold text-sm">
          <span className="text-foreground">
            {t('payment.workerTakeHome', { defaultValue: 'Worker Receives' })}
          </span>
          <span className="font-mono tabular-nums text-base font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(breakdown.workerEarning)}
          </span>
        </div>
      </div>
    </div>
  )
}
