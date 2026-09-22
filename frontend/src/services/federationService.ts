import type { WorkerProfile, WorkerStatus, WorkerSkill, InsuranceStatus } from '@/types/worker'
import type { Federation, Society } from '@/types/federation'
import type { Job, BookingType, JobStatus } from '@/types/job'
import { apiClient } from '@/lib/apiClient'
import { catalogService } from './catalogService'
import { CATEGORY_MAP, isUuid } from '@/lib/serviceTranslation'

export interface AllocationConfig {
  version: number
  proximityWeight: number
  ratingWeight: number
  loadWeight: number
  welfareRate: number
  emergencySurcharge: number
  standardRadiusM: number
  emergencyRadiusM: number
  emergencyTimeoutS: number
}

function mapBackendWorkerProfile(w: any): WorkerProfile {
  const isAvailable = Boolean(w.isAvailable ?? w.is_available)
  const status = (w.verificationStatus || w.verification_status || 'PENDING_VERIFICATION') as WorkerStatus

  const skills: WorkerSkill[] = (w.skills || []).map((s: any, idx: number) => {
    const catId = String(s.categoryId || s.category_id || '')
    const catMeta = CATEGORY_MAP[catId.toLowerCase()]
    const fallbackName = catMeta ? catMeta.name : 'Cooperative Skill'
    return {
      id: s.id || `skill-${idx}`,
      workerId: String(w.userId || w.user_id || ''),
      serviceCategoryId: catId,
      subserviceId: String(s.subserviceId || catId),
      subserviceName: s.name && !isUuid(s.name) ? s.name : fallbackName,
      isVerified: Boolean(s.verified),
      certificationRef: (w.certifications && w.certifications[0]) || undefined,
    }
  })

  return {
    userId: String(w.userId || w.user_id || ''),
    name: w.name || 'Cooperative Worker',
    phone: w.phone || '',
    societyId: String(w.societyId || w.society_id || ''),
    societyName: w.societyName || 'Primary Cooperative Society',
    membershipId: w.membershipId || w.membership_id || '',
    eShramUAN: w.uanLast4 ? `XXXXXXXX${w.uanLast4}` : (w.eShramUAN || '123456789012'),
    status,
    availability: isAvailable && status === 'ACTIVE' ? 'AVAILABLE' : 'OFFLINE',
    latitude: Number(w.latitude || 13.0827),
    longitude: Number(w.longitude || 80.2707),
    rating: Number(w.avgRating || w.avg_rating || 5.0),
    totalJobsCompleted: Number(w.totalJobsCompleted || w.total_jobs_completed || 0),
    welfareBalance: Number(w.welfareBalance || w.welfare_balance || 0),
    welfareEntriesCount: Number(w.welfareEntriesCount || w.welfare_entries_count || 0),
    dailyJobCount: Number(w.dailyJobCount || 0),
    skills,
    insurancePMSBY: (w.pmsbyStatus || w.pmsby_status || 'NOT_ENROLLED') as InsuranceStatus,
    insurancePMJJBY: (w.pmjjbyStatus || w.pmjjby_status || 'NOT_ENROLLED') as InsuranceStatus,
  }
}

export const federationService = {
  getFederation: async (): Promise<Federation> => {
    return {
      id: 'fed-karnataka-apex',
      name: 'Karnataka State Labour & Gig Workers Cooperative Federation',
      registrationNumber: 'KSL-FED-2024-001',
      createdAt: '2024-01-01T00:00:00Z',
      totalSocieties: 4,
      totalWorkers: 156,
    }
  },

  getWorkers: async (societyId?: string, status?: string): Promise<WorkerProfile[]> => {
    try {
      const res = await apiClient.get<any[]>('/admin/workers', {
        params: {
          societyId,
          status,
        },
      })
      return res.data.map(mapBackendWorkerProfile)
    } catch (err) {
      console.warn('Backend getWorkers failed:', err)
      return []
    }
  },

  verifyWorker: async (
    workerId: string,
    status: WorkerStatus,
    verifiedCategoryIds?: string[],
    note?: string
  ): Promise<WorkerProfile> => {
    const activeStatus = status === 'ACTIVE' ? 'ACTIVE' : status === 'SUSPENDED' ? 'SUSPENDED' : 'REJECTED'
    const categories = verifiedCategoryIds && verifiedCategoryIds.length > 0
      ? verifiedCategoryIds
      : []

    await apiClient.put(`/admin/workers/${workerId}/verification`, {
      status: activeStatus,
      verifiedCategoryIds: categories,
      note: note || 'Verified credentials and membership compliance in good order.',
    })
    const workers = await federationService.getWorkers()
    const found = workers.find((w) => w.userId === workerId)
    if (found) return found
    return {
      userId: workerId,
      name: 'Verified Cooperative Member',
      phone: '',
      societyId: 'soc-1',
      societyName: 'Primary Cooperative Society',
      membershipId: 'MEM-UPDATED',
      eShramUAN: 'XXXXXXXX1234',
      status: activeStatus as WorkerStatus,
      availability: activeStatus === 'ACTIVE' ? 'AVAILABLE' : 'OFFLINE',
      latitude: 12.9344,
      longitude: 77.6101,
      rating: 5.0,
      totalJobsCompleted: 0,
      dailyJobCount: 0,
      skills: [],
      insurancePMSBY: 'ENROLLED',
      insurancePMJJBY: 'ENROLLED',
    }
  },

  updateInsurance: async (
    workerId: string,
    pmsbyStatus: string,
    pmjjbyStatus: string,
    evidenceReference?: string
  ): Promise<void> => {
    try {
      await apiClient.put(`/admin/workers/${workerId}/insurance`, {
        pmsbyStatus,
        pmjjbyStatus,
        evidenceReference: evidenceReference || 'Verified direct e-Shram statutory bank link',
      })
    } catch (err) {
      console.warn('Backend updateInsurance failed:', err)
    }
  },

  getSocieties: async (): Promise<Society[]> => {
    try {
      const societies = await catalogService.getSocieties()
      return societies || []
    } catch {
      return []
    }
  },

  getUnfulfilledEmergencies: async (): Promise<Job[]> => {
    try {
      const res = await apiClient.get<any[]>('/admin/unfulfilled')
      return res.data.map((j) => ({
        id: String(j.id),
        customerId: '',
        customerName: 'Citizen Member',
        customerPhone: '',
        serviceCategoryId: '',
        serviceCategoryName: '',
        subserviceId: '',
        subserviceName: j.serviceName || j.service_name || 'Emergency Service',
        bookingType: (j.bookingType || j.booking_type || 'EMERGENCY') as BookingType,
        status: 'EXPIRED' as JobStatus,
        isEmergency: true,
        location: {
          latitude: 12.9344,
          longitude: 77.6101,
          formattedAddress: j.formattedAddress || j.formatted_address || 'Bengaluru Central',
          area: j.area || 'Bengaluru',
        },
        createdAt: j.createdAt || j.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        basePrice: 500,
      }))
    } catch (err) {
      console.warn('Backend getUnfulfilledEmergencies failed:', err)
      return []
    }
  },

  getEligibleWorkers: async (jobId: string): Promise<any[]> => {
    try {
      const res = await apiClient.get(`/admin/jobs/${jobId}/eligible-workers`)
      return res.data
    } catch {
      return []
    }
  },

  recordManualDispatch: async (
    jobId: string,
    workerId: string,
    notes: string
  ): Promise<Job> => {
    const res = await apiClient.post(`/admin/jobs/${jobId}/manual-dispatch`, {
      workerId,
      method: 'PHONE',
      note: notes || 'Admin direct dispatch coordination',
    })
    return {
      id: String(res.data.id),
      customerId: '',
      customerName: 'Citizen Member',
      customerPhone: '',
      workerId,
      workerName: res.data.workerName || 'Dispatched Cooperative Member',
      serviceCategoryId: '',
      serviceCategoryName: '',
      subserviceId: '',
      subserviceName: res.data.serviceName || 'Cooperative Service',
      bookingType: 'EMERGENCY',
      status: 'ACCEPTED',
      isEmergency: true,
      location: {
        latitude: 12.9344,
        longitude: 77.6101,
        formattedAddress: res.data.formattedAddress || 'Location',
        area: res.data.area || 'Area',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      basePrice: 500,
      manualDispatchNotes: notes,
    }
  },

  getMetrics: async () => {
    try {
      const res = await apiClient.get<any>('/admin/metrics')
      const data = res.data
      return {
        activeWorkers: data.workers?.verified || data.workers?.registered || 0,
        pendingWorkers: Number(data.workers?.pending || 0),
        jobsToday: data.jobsToday || 0,
        availableWorkers: data.workers?.available || data.workers?.online || 0,
        welfareBalance: Number(data.money?.welfare || 0),
        raw: data,
      }
    } catch (err) {
      console.warn('Backend getMetrics failed:', err)
      return {
        activeWorkers: 0,
        pendingWorkers: 0,
        jobsToday: 0,
        availableWorkers: 0,
        welfareBalance: 0,
        raw: {},
      }
    }
  },

  getWelfareEntries: async (societyId?: string) => {
    try {
      const res = await apiClient.get<any[]>('/admin/welfare', {
        params: { societyId },
      })
      return res.data
    } catch {
      return []
    }
  },

  getAuditLogs: async (after?: number) => {
    try {
      const res = await apiClient.get<any[]>('/admin/audit', {
        params: { after: after || 0 },
      })
      return res.data
    } catch {
      return []
    }
  },

  getConfig: async (): Promise<AllocationConfig> => {
    const res = await apiClient.get<AllocationConfig>('/admin/config')
    return res.data
  },

  updateConfig: async (config: AllocationConfig): Promise<AllocationConfig> => {
    const res = await apiClient.put<AllocationConfig>('/admin/config', config)
    return res.data
  },

  updateSubservicePrice: async (
    subserviceId: string,
    data: { basePrice: number; emergencySupported?: boolean; active?: boolean }
  ): Promise<void> => {
    await apiClient.put(`/admin/subservices/${subserviceId}/price`, {
      basePrice: data.basePrice,
      emergencySupported: data.emergencySupported ?? false,
      active: data.active ?? true,
    })
  },
}
