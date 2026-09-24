import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Download, Loader2, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { InvoiceCard } from '@/components/shared/InvoiceCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { usePayment } from '@/hooks/usePayment'
import { downloadElementAsPdf } from '@/lib/pdfUtils'

export function WorkerInvoicePage() {
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
          backTo="/worker/passbook"
          title={t('payment.invoiceTitle', { defaultValue: 'Official Digital Invoice' })}
        />
        <div className="p-6 rounded-2xl border border-border bg-card shadow-xs text-center space-y-3 max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-black text-foreground">
            {t('payment.invoiceNotFound', { defaultValue: 'Receipt not found' })}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t('payment.invoiceNotFoundDesc', {
              defaultValue: 'We could not load the receipt details for this job.',
            })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        backTo="/worker/passbook"
        title={t('payment.invoiceTitle', { defaultValue: 'Official Digital Invoice' })}
        action={
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
        }
      />

      <InvoiceCard invoice={invoice} />
    </div>
  )
}
