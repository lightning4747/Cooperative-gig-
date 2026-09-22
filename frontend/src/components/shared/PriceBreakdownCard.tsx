import { useTranslation } from 'react-i18next'
import { CheckCircle2 } from 'lucide-react'
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
  welfareRate = 0.5,
  showSurplusDetails = true,
  className,
}: PriceBreakdownCardProps) {
  const { t } = useTranslation()
  const breakdown = calculatePayment(customerPrice, basePrice, welfareRate)

  return (
    <div className={cn('p-4 rounded-xl border border-border bg-card shadow-sm space-y-3', className)}>
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <span className="text-sm font-semibold text-foreground">
          {t('common.servicePrice', { defaultValue: 'Service Price' })}
        </span>
        <span className="font-mono text-base font-bold text-foreground tabular-nums">
          {formatCurrency(breakdown.customerPrice)}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            {t('common.guaranteedWageFloor', { defaultValue: 'Guaranteed Wage Floor' })}
          </span>
          <span className="font-mono tabular-nums text-foreground font-semibold">
            {formatCurrency(breakdown.basePrice)}
          </span>
        </div>

        {showSurplusDetails && breakdown.surplus > 0 && (
          <>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>{t('payment.surplus', { defaultValue: 'Surplus Paid by Customer' })}</span>
              <span className="font-mono tabular-nums text-foreground">
                +{formatCurrency(breakdown.surplus)}
              </span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span>{t('payment.welfareContribution', { defaultValue: 'Cooperative Welfare Contribution' })} (50%)</span>
              <span className="font-mono tabular-nums text-primary font-medium">
                -{formatCurrency(breakdown.welfareContribution)}
              </span>
            </div>
          </>
        )}

        <div className="pt-2 border-t border-border flex items-center justify-between font-semibold text-sm">
          <span className="text-foreground">
            {t('payment.workerTakeHome', { defaultValue: 'Worker Take-Home Guarantee' })}
          </span>
          <span className="font-mono tabular-nums text-base font-black text-green-700">
            {formatCurrency(breakdown.workerEarning)}
          </span>
        </div>
      </div>
    </div>
  )
}
