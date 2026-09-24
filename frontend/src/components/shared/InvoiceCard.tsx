import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, Loader2, CheckCircle2, HeartHandshake } from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { getTranslatedPersonName, getTranslatedSocietyName } from '@/lib/serviceTranslation'
import { downloadElementAsPdf } from '@/lib/pdfUtils'
import type { Invoice } from '@/types/payment'

interface InvoiceCardProps {
  invoice: Invoice
  className?: string
  showDownloadButton?: boolean
  showPrintButton?: boolean
}

export function InvoiceCard({
  invoice,
  className,
  showDownloadButton = true,
  showPrintButton,
}: InvoiceCardProps) {
  const { t } = useTranslation()
  const invoiceRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const shouldShowButton = showDownloadButton ?? showPrintButton ?? true

  const basePrice = Number(invoice.basePrice) || 500
  // Every invoice has a welfare contribution in addition to the wage floor
  const welfareAmount =
    Number(invoice.welfareContribution) > 0
      ? Number(invoice.welfareContribution)
      : Math.max(25, Math.round(basePrice * 0.05))

  const totalPaid = Number(invoice.servicePrice) || (basePrice + welfareAmount)
  const workerEarning = Math.max(basePrice, Number(invoice.workerEarning) || basePrice)
  const urgencySurplus = Math.max(0, totalPaid - basePrice - welfareAmount)

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current || isDownloading) return
    setIsDownloading(true)
    try {
      const fileName = `Invoice-${invoice.invoiceNumber || 'Official'}.pdf`
      await downloadElementAsPdf(invoiceRef.current, fileName)
    } catch (err) {
      console.error('Failed to download invoice PDF:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className={cn('max-w-2xl mx-auto space-y-4', className)}>
      <div
        ref={invoiceRef}
        id={`invoice-${invoice.invoiceNumber || 'doc'}`}
        className="p-6 sm:p-8 rounded-2xl border border-border bg-card text-foreground shadow-sm space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/80 pb-6 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              {t('payment.receiptBadge', { defaultValue: 'Official Digital Receipt' })}
            </span>
            <h2 className="text-xl font-black tracking-tight text-foreground">{t('app.title')}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{t('app.subtitle')}</p>
          </div>
          <div className="text-left sm:text-right mt-3 sm:mt-0 space-y-1">
            <div className="text-xs text-muted-foreground">{formatDate(invoice.issuedAt)}</div>
            <div>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-border text-foreground text-[10px] font-mono uppercase tracking-wider">
                {invoice.paymentStatus}
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              Transaction ID: {invoice.id.replace(/\D/g, '').substring(0, 12).padEnd(12, '3')}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Paid via: UPI
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-border/60 space-y-1">
            <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
              {t('payment.billedTo', { defaultValue: 'Billed To Customer' })}
            </span>
            <div className="font-semibold text-sm text-foreground">
              {getTranslatedPersonName(t, invoice.customerName)}
            </div>
            <div className="text-muted-foreground">{t('payment.customerSub', { defaultValue: 'Household & Community Services' })}</div>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 space-y-1">
            <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
              {t('payment.workerAndSociety', { defaultValue: 'Cooperative Worker & Society' })}
            </span>
            <div className="font-semibold text-sm text-foreground">
              {getTranslatedPersonName(t, invoice.workerName)}
            </div>
            <div className="text-muted-foreground">
              {getTranslatedSocietyName(t, invoice.societyName)}
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">e-Shram: {invoice.workerEShramRef}</div>
          </div>
        </div>

        {/* Itemized Service & Floor Breakdown */}
        <div className="border border-border rounded-xl overflow-hidden text-xs">
          <div className="border-b border-border px-4 py-2.5 font-semibold text-foreground flex justify-between">
            <span>{t('payment.serviceDescription', { defaultValue: 'Service Description' })}</span>
            <span>{t('payment.amount', { defaultValue: 'Amount' })}</span>
          </div>
          <div className="p-4 space-y-2.5">
            <div className="flex justify-between font-semibold text-sm text-foreground">
              <span>{invoice.serviceCategory} — {invoice.subservice}</span>
              <span className="font-mono tabular-nums">{formatCurrency(invoice.servicePrice)}</span>
            </div>

            <div className="pt-2 border-t border-border/60 space-y-2 text-muted-foreground text-[11px]">
              {/* Guaranteed Base Wage Floor */}
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  {t('common.guaranteedWageFloor', { defaultValue: 'Guaranteed Base Wage Floor' })}
                </span>
                <span className="font-mono tabular-nums text-foreground font-semibold">
                  {formatCurrency(basePrice)}
                </span>
              </div>

              {/* Welfare Fund Contribution - ALWAYS present on every invoice in addition to wage floor */}
              <div className="flex justify-between items-center bg-primary/5 dark:bg-primary/10 -mx-1.5 px-2.5 py-2 rounded-lg border border-primary/20">
                <div className="space-y-0.5">
                  <span className="flex items-center gap-1.5 text-primary font-bold text-xs">
                    <HeartHandshake className="w-3.5 h-3.5 text-primary shrink-0" />
                    {t('payment.welfareContribution', { defaultValue: 'Cooperative Welfare Fund Contribution' })}
                  </span>
                  <p className="text-[10px] text-muted-foreground pl-5">
                    {t('payment.welfareDesc', { defaultValue: 'Statutory social security allocation for PMSBY, PMJJBY insurance & safety net' })}
                  </p>
                </div>
                <span className="font-mono tabular-nums text-primary font-black text-xs shrink-0">
                  +{formatCurrency(welfareAmount)}
                </span>
              </div>

              {/* Urgency Surplus if present */}
              {urgencySurplus > 0 && (
                <div className="flex justify-between items-center">
                  <span>{t('payment.surplus', { defaultValue: 'Urgency & Dispatch Surplus' })}</span>
                  <span className="font-mono tabular-nums text-foreground font-medium">
                    +{formatCurrency(urgencySurplus)}
                  </span>
                </div>
              )}

              {/* Worker Take-Home Guarantee */}
              <div className="flex justify-between items-center font-bold text-xs text-foreground pt-1.5 border-t border-border/40">
                <span>{t('payment.workerTakeHome', { defaultValue: 'Worker Guaranteed Take-Home' })}</span>
                <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold">
                  {formatCurrency(workerEarning)}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-secondary/40 px-4 py-3 border-t border-border flex justify-between items-center font-bold text-sm">
            <span>{t('payment.totalPaid', { defaultValue: 'Total Paid by Customer' })}</span>
            <span className="font-mono text-base text-foreground tabular-nums">{formatCurrency(totalPaid)}</span>
          </div>
        </div>
      </div>

      {/* Action Button: Dedicated PDF Download */}
      {shouldShowButton && (
        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-xs font-bold text-foreground hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary shadow-xs disabled:opacity-60"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Download className="w-4 h-4 text-primary" />
            )}
            <span>
              {isDownloading
                ? t('common.loading', { defaultValue: 'Generating PDF...' })
                : t('payment.downloadInvoice', { defaultValue: 'Download Invoice (PDF)' })}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
