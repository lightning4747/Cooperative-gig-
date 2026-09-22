export type WorkerStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED'
export type WorkerAvailability = 'AVAILABLE' | 'BUSY' | 'OFFLINE'
export type InsuranceStatus = 'ENROLLED' | 'NOT_ENROLLED' | 'PENDING'

export interface WorkerSkill {
  id: string
  workerId: string
  serviceCategoryId: string
  subserviceId: string
  subserviceName: string
  isVerified: boolean
  certificationRef?: string
}

export interface WorkerProfile {
  userId: string
  name: string
  phone: string
  societyId: string
  societyName: string
  membershipId: string
  eShramUAN: string
  status: WorkerStatus
  availability: WorkerAvailability
  latitude: number
  longitude: number
  rating: number
  totalJobsCompleted: number
  dailyJobCount: number
  welfareBalance?: number
  welfareEntriesCount?: number
  skills: WorkerSkill[]
  insurancePMSBY: InsuranceStatus
  insurancePMJJBY: InsuranceStatus
}
