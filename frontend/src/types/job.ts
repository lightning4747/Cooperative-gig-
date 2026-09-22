export type JobStatus =
  | 'SEARCHING'
  | 'OFFERED'
  | 'BROADCAST'
  | 'ACCEPTED'
  | 'TRAVELLING'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'

export type BookingType = 'STANDARD' | 'ON_DEMAND' | 'EMERGENCY'

export interface AllocationBreakdown {
  proximityScore: number
  ratingScore: number
  dailyLoadPenalty: number
  totalScore: number
  explanation: string
}

export interface JobLocation {
  latitude: number
  longitude: number
  formattedAddress: string
  area: string
}

export interface Job {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  workerId?: string
  workerName?: string
  workerPhone?: string
  serviceCategoryId: string
  serviceCategoryName: string
  subserviceId: string
  subserviceName: string
  bookingType: BookingType
  status: JobStatus
  isEmergency: boolean
  location: JobLocation
  scheduledAt?: string // For STANDARD bookings
  createdAt: string
  updatedAt: string
  otp?: string // Mutual 6-digit physical OTP upon arrival
  basePrice: number
  grossAmount?: number
  welfareRate?: number
  isPaid?: boolean
  paidAmount?: number
  paymentStatus?: string
  allocationScore?: number
  allocationBreakdown?: AllocationBreakdown
  manualDispatchNotes?: string
  history?: Array<{
    fromStatus?: string
    toStatus: string
    reason?: string
    createdAt: string
  }>
}
