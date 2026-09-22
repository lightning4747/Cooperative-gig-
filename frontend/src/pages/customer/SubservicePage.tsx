import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { useServiceCatalog } from '@/hooks/useServiceCatalog'
import { SubserviceList } from '@/components/customer/SubserviceList'
import { getTranslatedCategoryName } from '@/lib/serviceTranslation'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'

export function SubservicePage() {
  const { t } = useTranslation()
  const { categoryId } = useParams<{ categoryId: string }>()
  const [searchParams] = useSearchParams()
  const isEmergency = searchParams.get('emergency') === 'true'
  const { categories, getCategoryById, isLoading } = useServiceCatalog()

  if (isLoading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>
    )
  }

  const category = (categoryId ? getCategoryById(categoryId) : undefined) || categories[0]

  if (!category) {
    return (
      <EmptyState
        title={t('services.categoryNotFound', { defaultValue: 'Service Category Not Found' })}
        description={t('services.categoryNotFoundDesc', {
          defaultValue: 'The requested service category could not be retrieved from the catalog.',
        })}
        action={
          <Link
            to="/customer/services"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
          >
            {t('services.backToServices', { defaultValue: 'Back to Service Categories' })}
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/customer/services"
          className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-black tracking-tight text-foreground truncate">
            {getTranslatedCategoryName(t, category.id, category.name)}
          </h1>
          <p className="text-xs text-muted-foreground">
            {category.subservices.length}{' '}
            {t('services.standardizedSubtitle', {
              defaultValue: 'standardized services with transparent base wage floors',
            })}
          </p>
        </div>
      </div>

      {/* Emergency Filter Banner */}
      {isEmergency && (
        <div className="p-3.5 rounded-xl border border-destructive/40 bg-destructive/10 flex items-center gap-2.5 text-xs text-destructive font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            {t('services.emergencyFilterBanner', {
              defaultValue: 'Showing emergency-enabled services with instant broadcast dispatch.',
            })}
          </span>
        </div>
      )}

      {/* Subservices List */}
      <SubserviceList
        categoryId={category.id}
        filterEmergency={isEmergency}
      />
    </div>
  )
}

