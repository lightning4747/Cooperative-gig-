export type DemandLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type CapacityLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type GapStatus = 'GAP' | 'OPTIMAL' | 'SURPLUS'

export interface DemandForecast {
  id: string
  serviceCategoryId: string
  serviceCategoryName: string
  area: string
  period: string
  forecastDemand: DemandLevel
  availableCapacity: CapacityLevel
  capacityGap: GapStatus
  recommendation: string
  expectedBookings?: number
  verifiedWorkers?: number
  gapRatio?: number
}

