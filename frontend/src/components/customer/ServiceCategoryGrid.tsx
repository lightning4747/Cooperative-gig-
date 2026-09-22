import { useNavigate } from 'react-router-dom'
import { ServiceCategoryCard } from '@/components/shared/ServiceCategoryCard'
import { useServiceCatalog } from '@/hooks/useServiceCatalog'
import type { ServiceCategory } from '@/types/service'
import { cn } from '@/lib/utils'

interface ServiceCategoryGridProps {
  categories?: ServiceCategory[]
  onSelectCategory?: (category: ServiceCategory) => void
  filterEmergency?: boolean
  className?: string
}

export function ServiceCategoryGrid({
  categories: propCategories,
  onSelectCategory,
  filterEmergency = false,
  className,
}: ServiceCategoryGridProps) {
  const navigate = useNavigate()
  const { categories: catalogCategories, isLoading } = useServiceCatalog()
  const categories = propCategories || catalogCategories

  // If filtered for emergency, only show categories that contain at least one emergencySupported subservice
  const displayCategories = filterEmergency
    ? categories.filter((cat) => cat.subservices.some((s) => s.emergencySupported))
    : categories

  const handleCardClick = (cat: ServiceCategory) => {
    if (onSelectCategory) {
      onSelectCategory(cat)
    } else {
      navigate(`/customer/services/${cat.id}${filterEmergency ? '?emergency=true' : ''}`)
    }
  }

  if (isLoading && displayCategories.length === 0) {
    return (
      <div
        className={cn(
          'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4',
          className
        )}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-40 sm:h-44 min-h-[160px] sm:min-h-[176px] rounded-2xl bg-muted/40 animate-pulse border-[3px] border-border/40"
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4',
        className
      )}
    >
      {displayCategories.map((category) => (
        <ServiceCategoryCard
          key={category.id}
          category={category}
          onClick={() => handleCardClick(category)}
        />
      ))}
    </div>
  )
}
