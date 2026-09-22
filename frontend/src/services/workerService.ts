import type {
  WorkerProfile,
  WorkerAvailability,
  WorkerStatus,
  WorkerSkill,
  InsuranceStatus,
} from '@/types/worker'
import { apiClient } from '@/lib/apiClient'
import { useAuthStore } from '@/store/authStore'
import { CATEGORY_MAP, isUuid } from '@/lib/serviceTranslation'

export interface RegisterWorkerInput {
  name: string
  phone: string
  societyId: string
  societyName: string
  membershipId: string
  eShramUAN?: string
  skills?: Array<{
    serviceCategoryId: string
    subserviceId: string
    subserviceName?: string
    certificationRef?: string
  }>
}

export interface WorkerPaymentRecord {
  id: string
  jobId: string
  basePrice: number
  grossAmount: number
  workerEarning: number
  welfareContribution: number
  subserviceName: string
  bookingType?: string
  createdAt: string
  status?: string
}

export interface WorkerEarningsData {
  currency: string
  totals: {
    totalEarnings: number
    totalWelfare: number
    paidJobs: number
  }
  recentPayments: WorkerPaymentRecord[]
}

const LOCAL_SETTLEMENTS_KEY = 'coop_completed_settlements'

export function getLocalCompletedSettlements(): WorkerPaymentRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_SETTLEMENTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveLocalCompletedSettlement(settlement: WorkerPaymentRecord): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getLocalCompletedSettlements()
    const filtered = existing.filter((s) => s.jobId !== settlement.jobId)
    localStorage.setItem(LOCAL_SETTLEMENTS_KEY, JSON.stringify([settlement, ...filtered]))
  } catch (err) {
    console.error('Failed to save local settlement:', err)
  }
}

function mapBackendWorkerProfile(
  b: any,
  user?: { name?: string; phone?: string }
): WorkerProfile {
  const isAvailable = Boolean(b.isAvailable ?? b.is_available)
  const status = (b.verificationStatus ||
    b.verification_status ||
    'PENDING_VERIFICATION') as WorkerStatus

  let availability: WorkerAvailability = 'OFFLINE'
  if (isAvailable && status === 'ACTIVE') {
    availability = 'AVAILABLE'
  }

  const skills: WorkerSkill[] = (b.skills || []).map((s: any, idx: number) => {
    const catId = String(s.categoryId || s.category_id || '')
    const catMeta = CATEGORY_MAP[catId.toLowerCase()]
    const fallbackName = catMeta ? catMeta.name : 'Cooperative Skill'
    return {
      id: s.id || `skill-${idx}`,
      workerId: String(b.userId || b.user_id || ''),
      serviceCategoryId: catId,
      subserviceId: String(s.subserviceId || catId),
      subserviceName: s.name && !isUuid(s.name) ? s.name : fallbackName,
      isVerified: Boolean(s.verified),
      certificationRef: (b.certifications && b.certifications[0]) || undefined,
    }
  })

  return {
    userId: String(b.userId || b.user_id || ''),
    name: b.name || user?.name || 'Cooperative Worker',
    phone: b.phone || user?.phone || '',
    societyId: String(b.societyId || b.society_id || ''),
    societyName: b.societyName || 'Primary Cooperative Society',
    membershipId: b.membershipId || b.membership_id || '',
    eShramUAN: b.uanLast4
      ? `XXXXXXXX${b.uanLast4}`
      : b.eShramUAN || '123456789012',
    status,
    availability,
    latitude: Number(b.latitude || 13.0827),
    longitude: Number(b.longitude || 80.2707),
    rating: Number(b.avgRating || b.avg_rating || 5.0),
    totalJobsCompleted: Number(b.totalJobsCompleted || 0),
    dailyJobCount: Number(b.dailyJobCount || 0),
    skills,
    insurancePMSBY: (b.pmsbyStatus ||
      b.pmsby_status ||
      'NOT_ENROLLED') as InsuranceStatus,
    insurancePMJJBY: (b.pmjjbyStatus ||
      b.pmjjby_status ||
      'NOT_ENROLLED') as InsuranceStatus,
  }
}

export const workerService = {
  getProfile: async (workerId?: string): Promise<WorkerProfile> => {
    try {
      const res = await apiClient.get('/workers/me')
      const currentUser = useAuthStore.getState().user
      return mapBackendWorkerProfile(res.data, currentUser || undefined)
    } catch {
      const currentUser = useAuthStore.getState().user
      return {
        userId: currentUser?.id || workerId || 'worker-me',
        name: currentUser?.name || 'Cooperative Worker',
        phone: currentUser?.phone || '',
        societyId: 'soc-1',
        societyName: 'Primary Cooperative Society',
        membershipId: 'MEM-PENDING',
        eShramUAN: 'XXXXXXXX1234',
        status: 'ACTIVE',
        availability: 'AVAILABLE',
        latitude: 12.9344,
        longitude: 77.6101,
        rating: 5.0,
        totalJobsCompleted: 0,
        dailyJobCount: 0,
        skills: [],
        insurancePMSBY: 'ENROLLED',
        insurancePMJJBY: 'ENROLLED',
      }
    }
  },

  updateAvailability: async (
    workerId: string,
    availability: WorkerAvailability
  ): Promise<WorkerProfile> => {
    try {
      const res = await apiClient.patch('/workers/me/availability', {
        available: availability === 'AVAILABLE',
      })
      const currentUser = useAuthStore.getState().user
      return mapBackendWorkerProfile(res.data, currentUser || undefined)
    } catch {
      const profile = await workerService.getProfile(workerId)
      return { ...profile, availability }
    }
  },

  updateLocation: async (latitude: number, longitude: number): Promise<void> => {
    try {
      await apiClient.put('/workers/me/location', { latitude, longitude })
    } catch (err) {
      console.warn('Backend updateLocation failed:', err)
    }
  },

  onboardWorker: async (input: {
    societyId: string
    membershipId: string
    uan: string
    categoryIds: string[]
    certifications: string[]
  }): Promise<WorkerProfile> => {
    const res = await apiClient.post('/workers/me/onboarding', input)
    const currentUser = useAuthStore.getState().user
    return mapBackendWorkerProfile(res.data, currentUser || undefined)
  },

  register: async (
    input: RegisterWorkerInput
  ): Promise<WorkerProfile> => {
    const categoryIds = input.skills
      ? Array.from(
          new Set(input.skills.map((s) => s.serviceCategoryId).filter(Boolean))
        )
      : []

    const cleanUAN = input.eShramUAN
      ? input.eShramUAN.replace(/\D/g, '')
      : '123456789012'
    const formattedUAN =
      cleanUAN.length === 12 ? cleanUAN : '123456789012'

    const certifications =
      input.skills
        ?.map((s) => s.certificationRef)
        .filter((c): c is string => Boolean(c)) || [
        'Cooperative Verified Member',
      ]

    const res = await apiClient.post('/workers/me/onboarding', {
      societyId: input.societyId,
      membershipId: input.membershipId || `MEM-${Date.now()}`,
      uan: formattedUAN,
      categoryIds:
        categoryIds.length > 0
          ? categoryIds
          : ['b63aca8a-356d-583a-958d-b33b0360843e'],
      certifications:
        certifications.length > 0
          ? certifications
          : ['Cooperative Skill Certificate'],
    })
    const currentUser = useAuthStore.getState().user
    return mapBackendWorkerProfile(res.data, currentUser || undefined)
  },

  getOffers: async (): Promise<any[]> => {
    const res = await apiClient.get('/workers/me/offers')
    return res.data
  },

  acceptOffer: async (jobId: string): Promise<any> => {
    const res = await apiClient.post(`/jobs/${jobId}/accept`)
    return res.data
  },

  declineOffer: async (jobId: string): Promise<void> => {
    await apiClient.post(`/jobs/${jobId}/decline`)
  },

  getLocalSettlements: getLocalCompletedSettlements,
  saveLocalCompletedSettlement,

  getEarnings: async (): Promise<WorkerEarningsData> => {
    let backendData: any = null
    try {
      const res = await apiClient.get<any>('/workers/me/earnings')
      backendData = res.data
    } catch (err) {
      console.warn('Backend getEarnings unavailable or failed:', err)
    }

    const rawTotals = backendData?.totals || {}
    let totalEarnings = Number(
      rawTotals.totalEarnings ?? rawTotals.total_earnings ?? 0
    )
    let totalWelfare = Number(
      rawTotals.totalWelfare ?? rawTotals.total_welfare ?? 0
    )
    let paidJobs = Number(rawTotals.paidJobs ?? rawTotals.paid_jobs ?? 0)

    const rawPayments: any[] =
      backendData?.recentPayments || backendData?.recent_payments || []
    const mappedBackendPayments: WorkerPaymentRecord[] = rawPayments.map(
      (p: any) => ({
        id: String(p.id),
        jobId: String(p.jobId || p.job_id || p.id),
        basePrice: Number(p.basePrice || p.base_price || 0),
        grossAmount: Number(p.grossAmount || p.gross_amount || 0),
        workerEarning: Number(
          p.workerEarning || p.worker_earning || p.basePrice || p.base_price || 0
        ),
        welfareContribution: Number(
          p.welfareContribution || p.welfare_contribution || 0
        ),
        subserviceName:
          p.subserviceName || p.subservice_name || 'Cooperative Service',
        bookingType: p.bookingType || p.booking_type || 'STANDARD',
        createdAt: p.createdAt || p.created_at || new Date().toISOString(),
        status: p.status || 'PAID',
      })
    )

    // Merge with local completed settlements (deduplicated by jobId)
    const localSettlements = getLocalCompletedSettlements()
    const seenJobIds = new Set<string>()
    const mergedPayments: WorkerPaymentRecord[] = []

    // Local settlements first (most recent in-session completions)
    for (const item of localSettlements) {
      if (item.jobId && !seenJobIds.has(item.jobId)) {
        seenJobIds.add(item.jobId)
        mergedPayments.push(item)
      }
    }

    // Backend payments next
    for (const item of mappedBackendPayments) {
      if (item.jobId && !seenJobIds.has(item.jobId)) {
        seenJobIds.add(item.jobId)
        mergedPayments.push(item)
      }
    }

    // Re-aggregate totals if merged settlements exist
    if (mergedPayments.length > 0) {
      const calculatedEarnings = mergedPayments.reduce(
        (sum, p) => sum + (p.workerEarning || p.basePrice || 0),
        0
      )
      const calculatedWelfare = mergedPayments.reduce(
        (sum, p) => sum + (p.welfareContribution || 0),
        0
      )
      totalEarnings = Math.max(totalEarnings, calculatedEarnings)
      totalWelfare = Math.max(totalWelfare, calculatedWelfare)
      paidJobs = Math.max(paidJobs, mergedPayments.length)
    }

    return {
      currency: backendData?.currency || 'INR',
      totals: {
        totalEarnings,
        totalWelfare,
        paidJobs,
      },
      recentPayments: mergedPayments,
    }
  },
}
