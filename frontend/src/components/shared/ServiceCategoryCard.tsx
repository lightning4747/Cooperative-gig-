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
        'group h-40 sm:h-44 min-h-[160px] sm:min-h-[176px] w-full rounded-2xl border-[3px] transition-all flex flex-col overflow-hidden text-left shadow-xs bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 select-none cursor-pointer',
        isSelected
          ? 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-50/20 font-bold'
          : 'border-border hover:border-amber-500/50',
        className
      )}
    >
      {/* Top Image Banner with Invisible Placeholder for Icon Geometry */}
      <div className="relative h-24 sm:h-28 w-full overflow-hidden bg-muted shrink-0">
        <img
          src={imageUrl}
          alt={categoryTitle}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Invisible placeholder element where the icon used to be */}
        <div
          className="absolute top-2 right-2 w-7 h-7 rounded-lg invisible pointer-events-none select-none opacity-0"
          aria-hidden="true"
        />
      </div>

      {/* Label container: Title and Sub-tasks */}
      <div className="p-2.5 sm:p-3 flex flex-col justify-center flex-1 w-full space-y-1 min-h-[50px]">
        <span className="text-xs sm:text-sm font-bold text-foreground leading-snug line-clamp-1 w-full">
          {categoryTitle}
        </span>
        <span className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight truncate w-full">
          {subTasks}
        </span>
      </div>
    </button>
  )
}
