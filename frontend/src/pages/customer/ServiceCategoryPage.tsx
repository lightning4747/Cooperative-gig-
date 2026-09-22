import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Search } from 'lucide-react'
import { ServiceCategoryGrid } from '@/components/customer/ServiceCategoryGrid'
import { useServiceCatalog } from '@/hooks/useServiceCatalog'

export function ServiceCategoryPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const isEmergency = searchParams.get('emergency') === 'true'
  const [search, setSearch] = useState('')
  const { categories } = useServiceCatalog()

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.id.toLowerCase().includes(search.toLowerCase()) ||
      cat.subservices.some((s) => s.name.toLowerCase().includes(search.toLowerCase()))

    if (isEmergency) {
      return matchesSearch && cat.subservices.some((s) => s.emergencySupported)
    }
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/customer"
          className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black tracking-tight text-foreground">
            {isEmergency
              ? t('services.emergencyTitle', { defaultValue: 'Emergency Services' })
              : t('nav.services', { defaultValue: 'Service Categories' })}
          </h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('services.searchPlaceholder', {
            defaultValue: 'Search service or problem (e.g., pipe, wiring, cleaning)...',
          })}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-xs"
        />
      </div>

      {/* Category Grid */}
      <ServiceCategoryGrid
        categories={filteredCategories}
        filterEmergency={isEmergency}
      />
    </div>
  )
}
