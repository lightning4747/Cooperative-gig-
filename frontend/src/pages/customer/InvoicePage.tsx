import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Star, Download, Loader2, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { InvoiceCard } from '@/components/shared/InvoiceCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { usePayment } from '@/hooks/usePayment'
import { downloadElementAsPdf } from '@/lib/pdfUtils'

export function InvoicePage() {
  const { t } = useTranslation()
  const { jobId } = useParams<{ jobId: string }>()
  const targetId = jobId || ''
  const { invoice, isLoading } = usePayment(targetId)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!invoice || isDownloading) return
    const el = document.getElementById(`invoice-${invoice.invoiceNumber || 'doc'}`)
    if (!el) return
    setIsDownloading(true)
    try {
      await downloadElementAsPdf(el, `Invoice-${invoice.invoiceNumber || 'Official'}.pdf`)
    } catch (err) {
      console.error('Failed to download invoice PDF:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLoading && !invoice) {
    return <LoadingSpinner />
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <PageHeader
          backTo="/customer"
          title={t('payment.invoiceTitle', { defaultValue: 'Official Digital Invoice' })}
        />
        <div className="p-8 rounded-2xl border border-border bg-card text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-secondary text-muted-foreground flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              {t('payment.noInvoiceTitle', { defaultValue: 'Invoice Not Available' })}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {t('payment.noInvoiceDesc', { defaultValue: 'Invoices are generated upon payment settlement. If you recently paid, please allow a moment for the ledger record to settle.' })}
            </p>
          </div>
          <Link
            to="/customer"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all"
          >
            {t('common.returnHome', { defaultValue: 'Return to Customer Home' })}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        backTo="/customer"
        title={t('payment.invoiceTitle', { defaultValue: 'Official Digital Invoice' })}
        action={
          <>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:bg-muted text-foreground transition-colors text-xs font-semibold disabled:opacity-60"
              title={t('payment.downloadInvoice', { defaultValue: 'Download Invoice (PDF)' })}
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              ) : (
                <Download className="w-3.5 h-3.5 text-primary" />
              )}
              <span className="hidden sm:inline">
                {isDownloading
                  ? t('common.loading', { defaultValue: 'Generating...' })
                  : t('payment.downloadInvoice', { defaultValue: 'Download Invoice (PDF)' })}
              </span>
            </button>
            <Link
              to={`/customer/jobs/${targetId}/rating`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all"
            >
              <Star className="w-3.5 h-3.5" />
              <span>{t('rating.headerTitle', { defaultValue: 'Rate Service' })}</span>
            </Link>
          </>
        }
      />

      <InvoiceCard invoice={invoice} />
    </div>
  )
}
