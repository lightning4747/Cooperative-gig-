import type { Job, JobStatus, BookingType } from '@/types/job'
import { apiClient } from '@/lib/apiClient'
import { queryClient } from '@/lib/queryClient'
import { dispatchJobUpdate } from '@/lib/events'
import {
  SUB_SERVICES_MAP,
  CATEGORY_MAP,
  isUuid,
} from '@/lib/serviceTranslation'

export interface CreateJobInput {
  customerId?: string
  customerName?: string
  customerPhone?: string
  serviceCategoryId?: string
  serviceCategoryName?: string
  subserviceId: string
  subserviceName?: string
  bookingType: BookingType
  basePrice?: number
  scheduledAt?: string
  location: {
    latitude: number
    longitude: number
    formattedAddress: string
    area?: string
  }
}

export interface Quote {
  id: string
  customerId: string
  subserviceId: string
  bookingType: BookingType
  basePrice: number
  grossAmount: number
  welfareRate: number
  configVersion: number
  currency: string
  expiresAt: string
}

export interface DoorstepCodeResponse {
  otp: string
  expiresAt: string
  attemptsRemaining: number
}

function mapBackendJobToJob(b: any): Job {
  const subserviceId = String(b.subserviceId || b.subservice_id || '')
  let subserviceName = b.serviceName || b.service_name || b.subserviceName || ''
  let serviceCategoryId = b.serviceCategoryId || b.categoryId || b.category_id || ''
  let serviceCategoryName = b.serviceCategoryName || b.categoryName || b.category_name || ''

  if (subserviceId && SUB_SERVICES_MAP[subserviceId.toLowerCase()]) {
    const subInfo = SUB_SERVICES_MAP[subserviceId.toLowerCase()]
    if (!subserviceName || isUuid(subserviceName)) {
      subserviceName = subInfo.name
    }
    if (!serviceCategoryName || isUuid(serviceCategoryName)) {
      serviceCategoryName = subInfo.categoryName
    }
  }

  if (serviceCategoryId && CATEGORY_MAP[serviceCategoryId.toLowerCase()]) {
    if (!serviceCategoryName || isUuid(serviceCategoryName)) {
      serviceCategoryName = CATEGORY_MAP[serviceCategoryId.toLowerCase()].name
    }
  }

  if (!subserviceName) {
    subserviceName = 'Cooperative Service'
  }

  return {
    id: String(b.id),
    customerId: String(b.customerId || b.customer_id || ''),
    customerName: b.customerName || b.customer_name || 'Customer',
    customerPhone: b.customerPhone || b.customer_phone || '',
    workerId: b.workerId || b.worker_id ? String(b.workerId || b.worker_id) : undefined,
    workerName: b.workerName || b.worker_name || undefined,
    workerPhone: b.workerPhone || b.worker_phone || undefined,
    serviceCategoryId,
    serviceCategoryName,
    subserviceId,
    subserviceName,
    bookingType: (b.bookingType || b.booking_type || 'STANDARD') as BookingType,
    status: (b.status || 'SEARCHING') as JobStatus,
    isEmergency: (b.bookingType || b.booking_type) === 'EMERGENCY',
    location: {
      latitude: Number(b.latitude || 13.0827),
      longitude: Number(b.longitude || 80.2707),
      formattedAddress: b.formattedAddress || b.formatted_address || '',
      area: b.area || '',
    },
    scheduledAt: b.scheduledTime || b.scheduled_time || undefined,
    createdAt: b.createdAt || b.created_at || new Date().toISOString(),
    updatedAt: b.updatedAt || b.updated_at || new Date().toISOString(),
    otp: b.otp || undefined,
    basePrice: Number(b.basePrice || b.base_price || 0),
    grossAmount: Number(b.grossAmount || b.gross_amount || b.basePrice || b.base_price || 0),
    welfareRate: Number(b.welfareRate || b.welfare_rate || 0),
    isPaid: Boolean(
      b.isPaid ||
      b.is_paid ||
      b.paymentStatus === 'SIMULATED_SUCCEEDED' ||
      b.payment_status === 'SIMULATED_SUCCEEDED' ||
      b.paidAmount ||
      b.paid_amount
    ),
    paidAmount: b.paidAmount
      ? Number(b.paidAmount)
      : b.paid_amount
      ? Number(b.paid_amount)
      : undefined,
    paymentStatus: b.paymentStatus || b.payment_status || undefined,
    allocationScore: b.allocationScore ? Number(b.allocationScore) : undefined,
    allocationBreakdown: b.allocationBreakdown || undefined,
    manualDispatchNotes: b.manualDispatchNotes || undefined,
    history: b.history || [],
  }
}

export const jobService = {
  requestQuote: async (subserviceId: string, bookingType: BookingType): Promise<Quote> => {
    const res = await apiClient.post<Quote>('/quotes', {
      subserviceId,
      bookingType,
    })
    return res.data
  },

  createJob: async (input: CreateJobInput & { quoteId?: string }): Promise<Job> => {
    let quoteId = input.quoteId
    if (!quoteId) {
      const quote = await jobService.requestQuote(
        input.subserviceId,
        input.bookingType || 'STANDARD'
      )
      quoteId = quote.id
    }

    const idempotencyKey =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `key-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    const scheduledTime =
      input.bookingType === 'STANDARD' && input.scheduledAt
        ? new Date(input.scheduledAt).toISOString()
        : null

    const res = await apiClient.post(
      '/jobs',
      {
        quoteId,
        latitude: input.location.latitude,
        longitude: input.location.longitude,
        formattedAddress: input.location.formattedAddress,
        area: input.location.area || 'Bengaluru',
        scheduledTime,
      },
      {
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      }
    )

    const createdJob = mapBackendJobToJob(res.data)
    queryClient.invalidateQueries({ queryKey: ['jobs'] })
    queryClient.invalidateQueries({ queryKey: ['workerOffers'] })
    queryClient.invalidateQueries({ queryKey: ['unfulfilledEmergencies'] })
    queryClient.invalidateQueries({ queryKey: ['federationMetrics'] })
    dispatchJobUpdate(createdJob.id)
    return createdJob
  },

  getJob: async (jobId: string): Promise<Job> => {
    const res = await apiClient.get(`/jobs/${jobId}`)
    const job = mapBackendJobToJob(res.data)

    // If job status is ARRIVED, fetch doorstep OTP if available
    if (job.status === 'ARRIVED' && !job.otp) {
      try {
        const otpRes = await jobService.getDoorstepCode(jobId)
        if (otpRes.otp) {
          job.otp = otpRes.otp
        }
      } catch {
        // Worker might not have permissions to read customer OTP endpoint
      }
    }

    return job
  },

  listJobs: async (filters?: {
    customerId?: string
    workerId?: string
    status?: JobStatus
    isEmergency?: boolean
    societyId?: string
  }): Promise<Job[]> => {
    try {
      const res = await apiClient.get<any[]>('/jobs', {
        params: {
          societyId: filters?.societyId,
        },
      })
      let jobs = res.data.map(mapBackendJobToJob)
      if (filters?.customerId) {
        jobs = jobs.filter((j) => j.customerId === filters.customerId)
      }
      if (filters?.workerId) {
        jobs = jobs.filter((j) => j.workerId === filters.workerId)
      }
      if (filters?.status) {
        jobs = jobs.filter((j) => j.status === filters.status)
      }
      if (filters?.isEmergency !== undefined) {
        jobs = jobs.filter((j) => j.isEmergency === filters.isEmergency)
      }
      return jobs
    } catch (err) {
      console.warn('Backend listJobs failed:', err)
      return []
    }
  },

  getDoorstepCode: async (jobId: string): Promise<DoorstepCodeResponse> => {
    const res = await apiClient.get<DoorstepCodeResponse>(`/jobs/${jobId}/doorstep-code`)
    return res.data
  },

  renewDoorstepCode: async (jobId: string): Promise<DoorstepCodeResponse> => {
    const res = await apiClient.post<DoorstepCodeResponse>(`/jobs/${jobId}/doorstep-code/renew`)
    return res.data
  },

  cancelJob: async (jobId: string, reason: string): Promise<Job> => {
    const res = await apiClient.post(`/jobs/${jobId}/cancel`, { reason })
    const cancelled = mapBackendJobToJob(res.data)
    queryClient.setQueryData(['job', jobId], cancelled)
    queryClient.invalidateQueries({ queryKey: ['jobs'] })
    queryClient.invalidateQueries({ queryKey: ['workerOffers'] })
    queryClient.invalidateQueries({ queryKey: ['unfulfilledEmergencies'] })
    dispatchJobUpdate(jobId)
    return cancelled
  },

  updateStatus: async (
    jobId: string,
    status: JobStatus,
    _workerId?: string
  ): Promise<Job> => {
    let res
    if (status === 'ACCEPTED') {
      res = await apiClient.post(`/jobs/${jobId}/accept`)
    } else if (status === 'TRAVELLING') {
      res = await apiClient.post(`/jobs/${jobId}/travel`)
    } else if (status === 'ARRIVED') {
      res = await apiClient.post(`/jobs/${jobId}/arrive`)
    } else if (status === 'COMPLETED') {
      res = await apiClient.post(`/jobs/${jobId}/complete`)
    } else if (status === 'CANCELLED') {
      res = await apiClient.post(`/jobs/${jobId}/cancel`, {
        reason: 'Cancelled by user',
      })
    } else {
      throw new Error(`Unsupported status transition: ${status}`)
    }
    const updated = mapBackendJobToJob(res.data)
    queryClient.setQueryData(['job', jobId], updated)
    queryClient.invalidateQueries({ queryKey: ['jobs'] })
    queryClient.invalidateQueries({ queryKey: ['workerOffers'] })
    queryClient.invalidateQueries({ queryKey: ['unfulfilledEmergencies'] })
    queryClient.invalidateQueries({ queryKey: ['federationMetrics'] })
    dispatchJobUpdate(jobId)
    return updated
  },

  verifyOtp: async (
    jobId: string,
    otp: string
  ): Promise<{ success: boolean; job: Job }> => {
    const res = await apiClient.post(`/jobs/${jobId}/start`, { otp })
    const updated = mapBackendJobToJob(res.data)
    queryClient.setQueryData(['job', jobId], updated)
    queryClient.invalidateQueries({ queryKey: ['jobs'] })
    queryClient.invalidateQueries({ queryKey: ['workerOffers'] })
    queryClient.invalidateQueries({ queryKey: ['unfulfilledEmergencies'] })
    queryClient.invalidateQueries({ queryKey: ['federationMetrics'] })
    dispatchJobUpdate(jobId)
    return {
      success: true,
      job: updated,
    }
  },

  getOffersForWorker: async (workerId: string): Promise<Job[]> => {
    try {
      const res = await apiClient.get<any[]>('/workers/me/offers')
      return res.data.map((o) =>
        mapBackendJobToJob({
          ...o,
          id: o.jobId || o.job_id || o.id,
          workerId,
          status: 'OFFERED',
          area: o.area || 'Bengaluru',
          formattedAddress: o.formattedAddress || o.formatted_address || o.area || 'Doorstep Location',
          latitude: o.latitude || 12.934,
          longitude: o.longitude || 77.621,
          customerName: 'Verified Member',
          customerPhone: '9876543210',
        })
      )
    } catch (err) {
      console.warn('Backend getOffersForWorker failed:', err)
      return []
    }
  },

  submitRating: async (jobId: string, stars: 1 | 2 | 3 | 4 | 5, feedback?: string) => {
    await apiClient.post(`/jobs/${jobId}/rating`, {
      stars,
      feedback: feedback || 'Cooperative service completed satisfactorily.',
    })
    return { success: true }
  },
}
