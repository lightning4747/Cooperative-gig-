import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { ServiceCategory } from '@/types/service'
import {
  getTranslatedCategoryName,
  getCategorySubTasks,
} from '@/lib/serviceTranslation'
import { getCategoryImageUrl } from '@/lib/serviceImages'

interface ServiceCategoryCardProps {
  category: ServiceCategory
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

export function ServiceCategoryCard({
  category,
  isSelected = false,
  onClick,
  className,
}: ServiceCategoryCardProps) {
  const { t } = useTranslation()

  const categoryTitle = getTranslatedCategoryName(t, category.id, category.name)
  const subTasks = getCategorySubTasks(category.id || category.name)
  const imageUrl = category.imageUrl || getCategoryImageUrl(category.id || category.code || category.name)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group h-40 sm:h-44 min-h-[160px] sm:min-h-[176px] w-full rounded-xl border transition-all flex flex-col overflow-hidden text-left shadow-xs bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-primary select-none cursor-pointer',
        isSelected
          ? 'border-2 border-primary ring-2 ring-primary/20 bg-primary/5 font-bold'
          : 'border-border hover:border-primary/60 hover:bg-muted/10',
        className
      )}
    >
      {/* Top Image Banner */}
      <div className="relative h-24 sm:h-28 w-full overflow-hidden bg-muted shrink-0">
        <img
          src={imageUrl}
          alt={categoryTitle}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Label container: Title and Sub-tasks */}
      <div className="p-2.5 sm:p-3 flex flex-col justify-center flex-1 w-full space-y-0.5 min-h-[48px]">
        <span className="text-xs sm:text-sm font-bold text-foreground leading-snug line-clamp-1 w-full">
          {categoryTitle}
        </span>
        <span className="text-[11px] text-muted-foreground leading-tight truncate w-full">
          {subTasks}
        </span>
      </div>
    </button>
  )
}
