import { apiClient } from '@/lib/apiClient'
import type { ServiceCategory, Subservice } from '@/types/service'
import type { Society } from '@/types/federation'
import { getCategoryImageUrl, getSubserviceImageUrl } from '@/lib/serviceImages'

interface BackendCategory {
  id: string
  code: string
  name: string
}

interface BackendSubservice {
  id: string
  categoryId: string
  code: string
  name: string
  description: string
  basePrice: number
  durationMinutes: number
  emergencySupported: boolean
  active: boolean
  currency: string
}

interface BackendSociety {
  id: string
  federationId: string
  name: string
  registrationNo: string
  district: string
  state?: string
  workerCount?: number
}

const CATEGORY_META: Record<string, { icon: string; description: string }> = {
  Caregiving: {
    icon: 'HeartHandshake',
    description: 'Certified cooperative care for elders, infants, and patients',
  },
  Carpentry: {
    icon: 'Hammer',
    description: 'Furniture repair, custom woodwork, and fittings',
  },
  Cleaning: {
    icon: 'Sparkles',
    description: 'Deep home cleaning, sanitation, and hygiene services',
  },
  'Domestic Help': {
    icon: 'Home',
    description: 'Housekeeping, meal assistance, and daily domestic chores',
  },
  Driving: {
    icon: 'Car',
    description: 'Professional licensed chauffeurs and transport operators',
  },
  Electrical: {
    icon: 'Zap',
    description: 'Wiring, appliance troubleshooting, and safety inspections',
  },
  Gardening: {
    icon: 'Sprout',
    description: 'Landscaping, pruning, lawn maintenance, and garden care',
  },
  Painting: {
    icon: 'Paintbrush',
    description: 'Interior, exterior wall painting and surface finishing',
  },
  Plumbing: {
    icon: 'Wrench',
    description: 'Leak repairs, pipe installations, and sanitary maintenance',
  },
  Technician: {
    icon: 'Cpu',
    description: 'Electronic devices, AC, and home appliance maintenance',
  },
}

let cachedCategories: ServiceCategory[] | null = null
let cachedSubservices: Subservice[] | null = null

export const catalogService = {
  getCategories: async (): Promise<ServiceCategory[]> => {
    const [catRes, subRes] = await Promise.all([
      apiClient.get<BackendCategory[]>('/catalog/categories'),
      apiClient.get<BackendSubservice[]>('/catalog/subservices'),
    ])

    const subservices: Subservice[] = subRes.data.map((s) => ({
      id: s.id,
      categoryId: s.categoryId,
      code: s.code,
      name: s.name,
      description: s.description,
      basePrice: Number(s.basePrice),
      estimatedDurationMinutes: s.durationMinutes || 60,
      durationMinutes: s.durationMinutes,
      emergencySupported: Boolean(s.emergencySupported ?? true),
      active: Boolean(s.active),
      currency: s.currency || 'INR',
      imageUrl: getSubserviceImageUrl(s.id, s.categoryId),
    }))

    cachedSubservices = subservices

    const categories: ServiceCategory[] = catRes.data.map((c) => {
      const meta = CATEGORY_META[c.name] || {
        icon: 'Wrench',
        description: `${c.name} cooperative services`,
      }
      return {
        id: c.id,
        code: c.code,
        name: c.name,
        description: meta.description,
        icon: meta.icon,
        imageUrl: getCategoryImageUrl(c.code || c.name || c.id),
        subservices: subservices.filter((s) => s.categoryId === c.id),
      }
    })

    cachedCategories = categories
    return categories
  },

  getCachedCategories: (): ServiceCategory[] | null => cachedCategories,

  getSubservices: async (categoryId?: string): Promise<Subservice[]> => {
    if (!cachedSubservices) {
      await catalogService.getCategories()
    }
    const all = cachedSubservices || []
    if (!categoryId) return all
    return all.filter((s) => s.categoryId === categoryId)
  },

  getCategoryById: async (categoryId: string): Promise<ServiceCategory | undefined> => {
    if (!cachedCategories) {
      await catalogService.getCategories()
    }
    return cachedCategories?.find((c) => c.id === categoryId)
  },

  getSubserviceById: async (subserviceId: string): Promise<Subservice | undefined> => {
    if (!cachedSubservices) {
      await catalogService.getCategories()
    }
    return cachedSubservices?.find((s) => s.id === subserviceId)
  },

  getSocieties: async (): Promise<Society[]> => {
    const res = await apiClient.get<BackendSociety[]>('/societies')
    return res.data.map((soc) => ({
      id: soc.id,
      federationId: soc.federationId,
      name: soc.name,
      registrationNumber: soc.registrationNo || 'DEMO-SOC',
      district: soc.district || 'Coimbatore',
      state: soc.state || 'Tamil Nadu',
      workerCount: soc.workerCount || 0,
    }))
  },
}
