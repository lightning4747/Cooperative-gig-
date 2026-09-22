import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Clock, ChevronRight } from 'lucide-react'
import { useServiceCatalog } from '@/hooks/useServiceCatalog'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatCurrency, cn } from '@/lib/utils'
import { getSubserviceImageUrl } from '@/lib/serviceImages'
import type { Subservice } from '@/types/service'

interface SubserviceListProps {
  categoryId: string
  onSelectSubservice?: (subservice: Subservice) => void
  filterEmergency?: boolean
  className?: string
}

export function SubserviceList({
  categoryId,
  onSelectSubservice,
  filterEmergency = false,
  className,
}: SubserviceListProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getCategoryById, isLoading } = useServiceCatalog()

  const category = getCategoryById(categoryId)

  if (isLoading && !category) {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-2xl bg-muted/40 animate-pulse border border-border/40"
          />
        ))}
      </div>
    )
  }

  if (!category) {
    return (
      <EmptyState
        title={t('services.categoryNotFound', { defaultValue: 'Service category not found.' })}
        description="Please select a valid service category."
      />
    )
  }

  const subservices = filterEmergency
    ? category.subservices.filter((s) => s.emergencySupported)
    : category.subservices

  const handleSelect = (sub: Subservice) => {
    if (onSelectSubservice) {
      onSelectSubservice(sub)
    } else {
      navigate(`/customer/services/${category.id}/${sub.id}`)
    }
  }

  return (
    <div className={cn('space-y-2.5 sm:space-y-3', className)}>
      {subservices.map((sub) => {
        const imageUrl = sub.imageUrl || getSubserviceImageUrl(sub.id, category.id)
        const subName = t(sub.name, { defaultValue: sub.name })

        return (
          <button
            key={sub.id}
            type="button"
            onClick={() => handleSelect(sub)}
            className="w-full p-2.5 sm:p-3 rounded-2xl border border-border bg-card hover:border-amber-500/50 hover:bg-muted/30 transition-all text-left flex items-center justify-between gap-3 shadow-xs group cursor-pointer"
          >
            {/* Left Image Thumbnail */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/60 relative">
              <img
                src={imageUrl}
                alt={subName}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Middle Details: Title, Description, and Estimated Duration */}
            <div className="space-y-1 min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                {subName}
              </h4>

              <p className="text-[11px] text-muted-foreground line-clamp-1 leading-snug">
                {sub.description}
              </p>

              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-0.5">
                <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                <span>
                  ~{sub.estimatedDurationMinutes || sub.durationMinutes || 45} {t('common.mins', { defaultValue: 'mins' })}
                </span>
              </div>
            </div>

            {/* Right Base Price & Action */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <span className="font-mono font-black text-xs sm:text-sm text-foreground tabular-nums block">
                  {formatCurrency(sub.basePrice)}
                </span>
              </div>
              <div className="p-1.5 rounded-lg bg-secondary text-muted-foreground group-hover:text-amber-600 group-hover:bg-amber-500/15 transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
