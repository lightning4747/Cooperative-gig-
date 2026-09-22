import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, CheckCircle2, Loader2 } from 'lucide-react'
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
          <div className="text-left sm:text-right">
            <div className="font-mono text-xs font-bold text-foreground">{invoice.invoiceNumber}</div>
            <div className="text-xs text-muted-foreground">{formatDate(invoice.issuedAt)}</div>
            <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold">
              <CheckCircle2 className="w-3 h-3 text-green-600" />
              <span>{invoice.paymentStatus}</span>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/60 space-y-1">
            <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
              {t('payment.billedTo', { defaultValue: 'Billed To (Citizen Customer)' })}
            </span>
            <div className="font-semibold text-sm text-foreground">
              {getTranslatedPersonName(t, invoice.customerName)}
            </div>
            <div className="text-muted-foreground">{t('payment.customerSub', { defaultValue: 'Household & Community Services' })}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/60 space-y-1">
            <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
              {t('payment.workerAndSociety', { defaultValue: 'Cooperative Worker & Society' })}
            </span>
            <div className="font-semibold text-sm text-foreground">
              {getTranslatedPersonName(t, invoice.workerName)}
            </div>
            <div className="text-muted-foreground">
              {getTranslatedSocietyName(t, invoice.societyName)}
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">Reg: {invoice.societyRegistrationNumber}</div>
            <div className="font-mono text-[11px] text-muted-foreground">e-Shram: {invoice.workerEShramRef}</div>
          </div>
        </div>

        {/* Itemized Service & Floor Breakdown */}
        <div className="border border-border rounded-xl overflow-hidden text-xs">
          <div className="bg-secondary/70 px-4 py-2.5 font-semibold text-foreground flex justify-between">
            <span>{t('payment.serviceDescription', { defaultValue: 'Service Description' })}</span>
            <span>{t('payment.amount', { defaultValue: 'Amount' })}</span>
          </div>
          <div className="p-4 space-y-2.5">
            <div className="flex justify-between font-semibold text-sm text-foreground">
              <span>{invoice.serviceCategory} — {invoice.subservice}</span>
              <span className="font-mono tabular-nums">{formatCurrency(invoice.servicePrice)}</span>
            </div>

            <div className="pt-2 border-t border-border/60 space-y-1.5 text-muted-foreground text-[11px]">
              <div className="flex justify-between">
                <span>{t('common.guaranteedWageFloor', { defaultValue: 'Guaranteed Base Price Floor' })}</span>
                <span className="font-mono tabular-nums text-foreground">{formatCurrency(invoice.basePrice)}</span>
              </div>
              {invoice.surplus > 0 && (
                <>
                  <div className="flex justify-between">
                    <span>{t('payment.surplus', { defaultValue: 'Customer Surplus' })}</span>
                    <span className="font-mono tabular-nums text-foreground">+{formatCurrency(invoice.surplus)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('payment.welfareContribution', { defaultValue: 'Welfare Contribution Deducted (From Surplus)' })}</span>
                    <span className="font-mono tabular-nums text-primary">-{formatCurrency(invoice.welfareContribution)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-bold text-xs text-foreground pt-1 border-t border-border/40">
                <span>{t('payment.workerTakeHome', { defaultValue: 'Worker Guaranteed Earning' })}</span>
                <span className="font-mono tabular-nums text-green-700">{formatCurrency(invoice.workerEarning)}</span>
              </div>
            </div>
          </div>
          <div className="bg-secondary/40 px-4 py-3 border-t border-border flex justify-between items-center font-bold text-sm">
            <span>{t('payment.totalPaid', { defaultValue: 'Total Paid by Customer' })}</span>
            <span className="font-mono text-base text-foreground tabular-nums">{formatCurrency(invoice.servicePrice)}</span>
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
