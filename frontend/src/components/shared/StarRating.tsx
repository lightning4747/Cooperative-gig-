import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (rating: number) => void
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_MAP = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
}

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const displayValue = hoverValue !== null ? hoverValue : value

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = displayValue >= star

        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(star)}
            onMouseEnter={() => !readOnly && setHoverValue(star)}
            onMouseLeave={() => !readOnly && setHoverValue(null)}
            className={cn(
              'p-0.5 transition-transform focus:outline-none',
              !readOnly && 'hover:scale-110 cursor-pointer',
              readOnly && 'cursor-default'
            )}
            aria-label={`${star} star`}
          >
            <Star
              className={cn(
                SIZE_MAP[size],
                'transition-colors',
                isFilled ? 'fill-primary text-primary' : 'text-border fill-transparent'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
