import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileText, Download, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useJobs } from '@/hooks/useJob'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  getTranslatedCategoryName,
  getTranslatedSubserviceName,
  getTranslatedPersonName,
} from '@/lib/serviceTranslation'
import { formatCurrency, formatDate } from '@/lib/utils'

export function CustomerInvoicesPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const { data: jobs, isLoading, isError } = useJobs({
    customerId: user?.id,
  })

  // Completed jobs represent settled services eligible for invoices
  const completedBookings = useMemo(() => {
    return (jobs || []).filter((j) => j.status === 'COMPLETED')
  }, [jobs])

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            {t('customer.invoicesTitle', { defaultValue: 'Cooperative Invoices' })}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('customer.invoicesSubtitle', {
              defaultValue:
                'Verified tax-compliant digital invoices with cooperative welfare cess breakdown',
            })}
          </p>
        </div>

        <Link
          to="/customer/bookings"
          className="px-3.5 py-2 rounded-xl border border-border hover:bg-muted text-foreground font-semibold text-xs transition-colors self-start sm:self-auto"
        >
          {t('customer.myBookingsTitle', { defaultValue: 'My Bookings' })}
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-16 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : isError ? (
        <div className="p-8 rounded-2xl border border-destructive/30 bg-destructive/10 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <p className="text-xs text-destructive font-semibold">
            {t('common.error', { defaultValue: 'Failed to load invoices.' })}
          </p>
        </div>
      ) : completedBookings.length === 0 ? (
        <div className="p-12 rounded-2xl border border-border bg-card text-center space-y-4 max-w-md mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-secondary text-muted-foreground flex items-center justify-center mx-auto border border-border/80">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              {t('customer.noInvoicesTitle', { defaultValue: 'No Invoices Found' })}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('customer.noInvoicesDesc', {
                defaultValue:
                  'Official digital invoices are generated upon job completion and payment settlement.',
              })}
            </p>
          </div>
          <Link
            to="/customer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all"
          >
            <span>{t('customer.exploreServices', { defaultValue: 'Explore Services' })}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completedBookings.map((b) => {
            const subName = getTranslatedSubserviceName(t, b.subserviceId, b.subserviceName)
            const catName = getTranslatedCategoryName(t, b.serviceCategoryId, b.serviceCategoryName)
            return (
              <div
                key={b.id}
                className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4 hover:border-border/90 transition-all"
              >
                <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="font-bold text-sm text-foreground truncate">{subName}</h3>
                    <span className="text-[11px] text-muted-foreground">{catName}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase font-mono shrink-0">
                    PAID ✓
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                      Settled Date
                    </span>
                    <span className="text-foreground">{formatDate(b.updatedAt || b.createdAt)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                      Total Amount
                    </span>
                    <span className="font-mono font-black text-sm text-foreground">
                      {formatCurrency(b.grossAmount || b.basePrice || 450)}
                    </span>
                  </div>
                  <div className="col-span-2 text-[11px] text-muted-foreground">
                    Technician: {b.workerName ? getTranslatedPersonName(t, b.workerName) : 'Cooperative Member'}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    Includes Welfare Cess
                  </span>
                  <Link
                    to={`/customer/jobs/${b.id}/invoice`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-2xs hover:bg-primary/90 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View / PDF</span>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
