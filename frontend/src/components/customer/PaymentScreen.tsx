import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CreditCard,
  Lock,
  Loader2,
  Wallet,
  Smartphone,
  Banknote,
} from 'lucide-react'
import { PriceBreakdownCard } from '@/components/shared/PriceBreakdownCard'
import { usePayment } from '@/hooks/usePayment'
import { formatCurrency, cn } from '@/lib/utils'
import type { Invoice, Payment } from '@/types/payment'

interface PaymentScreenProps {
  jobId: string
  customerPrice: number
  basePrice: number
  onSuccess: (result: { payment: Payment; invoice: Invoice }) => void
  className?: string
}

type PaymentMethod = 'UPI' | 'WALLET' | 'CASH'

export function PaymentScreen({
  jobId,
  customerPrice,
  basePrice,
  onSuccess,
  className,
}: PaymentScreenProps) {
  const { t } = useTranslation()
  const { processPayment, isProcessing } = usePayment(jobId)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('UPI')
  const [error, setError] = useState<string | null>(null)

  const handlePay = async () => {
    try {
      setError(null)
      const result = await processPayment(customerPrice)
      onSuccess(result)
    } catch (err: unknown) {
      console.error(err)
      setError(
        err instanceof Error
          ? err.message
          : 'Payment simulation encountered an error. Please retry.'
      )
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Price Breakdown with Wage-Floor Guarantee */}
      <PriceBreakdownCard
        customerPrice={customerPrice}
        basePrice={basePrice}
        showSurplusDetails={customerPrice > basePrice}
      />

      {/* Simulated Payment Modes */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-foreground block uppercase tracking-wider">
          {t('payment.selectMethod', { defaultValue: 'Select Payment Method' })}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {/* UPI */}
          <button
            type="button"
            onClick={() => setSelectedMethod('UPI')}
            className={cn(
              'p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5',
              selectedMethod === 'UPI'
                ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                : 'border-border bg-card hover:bg-muted/40'
            )}
          >
            <Smartphone className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold text-foreground">
              {t('payment.upi', { defaultValue: 'UPI / QR' })}
            </span>
          </button>

          {/* Cooperative Citizen Wallet */}
          <button
            type="button"
            onClick={() => setSelectedMethod('WALLET')}
            className={cn(
              'p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5',
              selectedMethod === 'WALLET'
                ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                : 'border-border bg-card hover:bg-muted/40'
            )}
          >
            <Wallet className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold text-foreground">
              {t('payment.wallet', { defaultValue: 'Coop Wallet' })}
            </span>
          </button>

          {/* Cash */}
          <button
            type="button"
            onClick={() => setSelectedMethod('CASH')}
            className={cn(
              'p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5',
              selectedMethod === 'CASH'
                ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                : 'border-border bg-card hover:bg-muted/40'
            )}
          >
            <Banknote className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold text-foreground">
              {t('payment.cash', { defaultValue: 'Direct Cash' })}
            </span>
          </button>
        </div>
      </div>

      {/* Security Note */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="w-3.5 h-3.5 text-emerald-600" />
        <span>
          {t('payment.escrowProtected', {
            defaultValue: '100% Secure & encrypted payment.',
          })}
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
          {error}
        </div>
      )}

      {/* Pay CTA */}
      <button
        type="button"
        onClick={handlePay}
        disabled={isProcessing}
        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xs hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>
              {t('payment.processingSettlement', { defaultValue: 'Processing Settlement...' })}
            </span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            <span>
              {t('payment.payAmount', {
                amount: formatCurrency(customerPrice),
                defaultValue: `Pay ${formatCurrency(customerPrice)} (Simulated)`,
              })}
            </span>
          </>
        )}
      </button>
    </div>
  )
}
