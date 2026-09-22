import { useState, useEffect } from 'react'
import { catalogService } from '@/services/catalogService'
import type { ServiceCategory, Subservice } from '@/types/service'

export function useServiceCatalog() {
  const [categories, setCategories] = useState<ServiceCategory[]>(
    () => catalogService.getCachedCategories() || []
  )
  const [isLoading, setIsLoading] = useState(
    () => !catalogService.getCachedCategories() || catalogService.getCachedCategories()!.length === 0
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    catalogService
      .getCategories()
      .then((data) => {
        if (mounted && data.length > 0) {
          setCategories(data)
        }
      })
      .catch((err) => {
        if (mounted) {
          console.warn('Failed to load categories from backend:', err)
          setError(err instanceof Error ? err.message : 'Failed to load catalog')
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const getCategoryById = (categoryId: string): ServiceCategory | undefined => {
    if (!categoryId) return undefined
    const cleanId = categoryId.toLowerCase().replace(/^cat-/, '').trim()
    return categories.find((c) => {
      const cId = (c.id || '').toLowerCase()
      const cCode = (c.code || '').toLowerCase()
      const cName = (c.name || '').toLowerCase()
      return (
        cId === categoryId.toLowerCase() ||
        cCode === cleanId ||
        cName === cleanId ||
        cCode === categoryId.toLowerCase() ||
        cId === cleanId
      )
    })
  }

  const getSubserviceById = (
    categoryId: string,
    subserviceId: string
  ): Subservice | undefined => {
    if (!subserviceId) return undefined
    const cleanSubId = subserviceId.toLowerCase().replace(/^sub-/, '').trim()
    const cat = getCategoryById(categoryId)
    const candidates = cat ? cat.subservices : categories.flatMap((c) => c.subservices)
    return candidates.find((s) => {
      const sId = (s.id || '').toLowerCase()
      const sCode = (s.code || '').toLowerCase()
      const sName = (s.name || '').toLowerCase().replace(/[\s-]/g, '_')
      return (
        sId === subserviceId.toLowerCase() ||
        sCode === subserviceId.toLowerCase() ||
        sCode === cleanSubId ||
        sName === cleanSubId ||
        sId === cleanSubId ||
        sCode.includes(cleanSubId) ||
        cleanSubId.includes(sCode)
      )
    })
  }

  return {
    categories,
    isLoading,
    error,
    getCategoryById,
    getSubserviceById,
  }
}
