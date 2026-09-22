export interface Subservice {
  id: string
  categoryId: string
  name: string
  code?: string
  description: string
  basePrice: number // Guaranteed worker wage floor
  estimatedDurationMinutes: number
  durationMinutes?: number
  emergencySupported: boolean
  active?: boolean
  currency?: string
  imageUrl?: string
}

export interface ServiceCategory {
  id: string
  name: string
  code?: string
  description: string
  icon: string // Lucide icon name
  subservices: Subservice[]
  imageUrl?: string
}
