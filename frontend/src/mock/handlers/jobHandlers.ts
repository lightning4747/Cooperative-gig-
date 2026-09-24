import type { Job, JobStatus, BookingType } from '@/types/job'
import type { Rating } from '@/types/rating'
import { delay } from '@/lib/delay'
import { generateOTP } from '@/lib/otp'
import { calculateDistanceKm } from '@/lib/mapUtils'
import { computeAllocationScore } from '@/lib/allocation'
import { calculatePayment } from '@/lib/paymentCalc'
import {
  getStoredJobs,
  saveStoredJobs,
  getStoredWorkers,
  saveStoredWorkers,
  getStoredWelfare,
  saveStoredWelfare,
  getStoredRatings,
  saveStoredRatings,
} from '../storage'

export interface CreateJobInput {
  customerId: string
  customerName: string
  customerPhone: string
  serviceCategoryId: string
  serviceCategoryName: string
  subserviceId: string
  subserviceName: string
  bookingType: BookingType
  basePrice: number
  location: {
    latitude: number
    longitude: number
    formattedAddress: string
    area: string
  }
  scheduledAt?: string
}

function findBestWorker(subserviceId: string, location: CreateJobInput['location']) {
  const workers = getStoredWorkers()
  const eligible = workers.filter((w) => {
    const hasSkill = w.skills.some((s) => s.subserviceId === subserviceId && s.isVerified)
    return hasSkill && w.status === 'ACTIVE' && w.availability === 'AVAILABLE'
  })

  if (eligible.length === 0) {
    // Fallback to active worker for seamless hackathon demo flow
    const active = workers.find((w) => w.status === 'ACTIVE' && w.availability === 'AVAILABLE')
    if (active) {
      const distance = 1.2
      const allocation = computeAllocationScore({
        distanceKm: distance,
        rating: active.rating,
        dailyJobCount: active.dailyJobCount,
      })
      return { worker: active, allocation }
    }
    return null
  }

  const scored = eligible.map((w) => {
    const distance = calculateDistanceKm(
      location.latitude,
      location.longitude,
      w.latitude,
      w.longitude
    )
    const allocation = computeAllocationScore({
      distanceKm: distance,
      rating: w.rating,
      dailyJobCount: w.dailyJobCount,
    })
    return { worker: w, allocation }
  })

  scored.sort((a, b) => b.allocation.totalScore - a.allocation.totalScore)
  return scored[0]
}

export async function createJob(input: CreateJobInput): Promise<Job> {
  await delay(350)
  const isEmergency = input.bookingType === 'EMERGENCY'
  const newJobId = `job-${Date.now().toString().slice(-6)}`
  const match = isEmergency ? null : findBestWorker(input.subserviceId, input.location)

  const status: JobStatus = isEmergency ? 'BROADCAST' : match ? 'OFFERED' : 'SEARCHING'

  const newJob: Job = {
    id: newJobId,
    customerId: input.customerId,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    workerId: match?.worker.userId,
    workerName: match?.worker.name,
    workerPhone: match?.worker.phone,
    serviceCategoryId: input.serviceCategoryId,
    serviceCategoryName: input.serviceCategoryName,
    subserviceId: input.subserviceId,
    subserviceName: input.subserviceName,
    bookingType: input.bookingType,
    status,
    isEmergency,
    location: input.location,
    scheduledAt: input.scheduledAt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    basePrice: input.basePrice,
    allocationScore: match?.allocation.totalScore,
    allocationBreakdown: match?.allocation,
  }

  const currentJobs = getStoredJobs()
  const updatedJobs = [newJob, ...currentJobs]
  saveStoredJobs(updatedJobs, newJob.id)

  return newJob
}

export async function getJobById(jobId: string): Promise<Job> {
  await delay(150)
  const jobs = getStoredJobs()
  const job = jobs.find((j) => j.id === jobId)
  if (!job) {
    throw new Error(`Job ${jobId} not found`)
  }
  return { ...job }
}

function matchesJobFilter(
  j: Job,
  filters?: {
    customerId?: string
    workerId?: string
    status?: JobStatus
    isEmergency?: boolean
    includeBroadcast?: boolean
  }
): boolean {
  if (!filters) return true
  if (filters.customerId && j.customerId !== filters.customerId) return false
  if (filters.workerId) {
    if (filters.includeBroadcast && j.status === 'BROADCAST') {
      // Broadcast emergency jobs are open to all nearby workers
      return true
    }
    if (j.workerId !== filters.workerId) {
      return false
    }
  }
  if (filters.status && j.status !== filters.status) return false
  if (filters.isEmergency !== undefined && j.isEmergency !== filters.isEmergency) return false
  return true
}

export async function listJobs(filters?: {
  customerId?: string
  workerId?: string
  status?: JobStatus
  isEmergency?: boolean
  includeBroadcast?: boolean
}): Promise<Job[]> {
  await delay(200)
  const jobs = getStoredJobs()
  return jobs.filter((j) => matchesJobFilter(j, filters))
}

export async function getOffersForWorker(workerId: string): Promise<Job[]> {
  await delay(200)
  const jobs = getStoredJobs()
  return jobs.filter((j) => {
    if (j.status === 'OFFERED' && j.workerId === workerId) return true
    if (j.status === 'BROADCAST' && j.isEmergency) return true
    return false
  })
}

export async function simulateIncomingOffer(workerId: string, isEmergency: boolean): Promise<Job> {
  const newJobId = `job-sim-${Date.now().toString().slice(-4)}`
  const newJob: Job = isEmergency
    ? {
        id: newJobId,
        customerId: '83cf9fc2-33be-4b62-82c6-73396ab41283',
        customerName: 'Ravi Kumar',
        customerPhone: '9876543210',
        serviceCategoryId: 'cat-plumbing',
        serviceCategoryName: 'Plumbing',
        subserviceId: 'sub-plumb-05',
        subserviceName: 'Pipe burst',
        bookingType: 'EMERGENCY',
        status: 'BROADCAST',
        isEmergency: true,
        location: {
          latitude: 11.0183,
          longitude: 76.9644,
          formattedAddress: '12 Cross Cut Road, Gandhipuram, Coimbatore 641012',
          area: 'Gandhipuram (0.6 km away)',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        basePrice: 650,
      }
    : {
        id: newJobId,
        customerId: 'cust-vikram-singh',
        customerName: 'Vikram Singh',
        customerPhone: '9845077889',
        workerId,
        workerName: 'Arun Electrician',
        workerPhone: '9876543211',
        serviceCategoryId: 'cat-electrical',
        serviceCategoryName: 'Electrical',
        subserviceId: 'sub-elec-01',
        subserviceName: 'Fan repair',
        bookingType: 'STANDARD',
        status: 'OFFERED',
        isEmergency: false,
        location: {
          latitude: 11.0088,
          longitude: 76.9482,
          formattedAddress: 'DB Road, RS Puram, Coimbatore 641002',
          area: 'RS Puram (1.1 km away)',
        },
        scheduledAt: new Date(Date.now() + 3600000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        basePrice: 450,
        allocationScore: 0.89,
        allocationBreakdown: {
          proximityScore: 0.94,
          ratingScore: 0.96,
          dailyLoadPenalty: 0.20,
          totalScore: 0.89,
          explanation:
            'Assigned via cooperative fair allocation: Nearest verified worker in Coimbatore (1.1 km) with 4.9 rating and balanced daily workload.',
        },
      }

  const jobs = getStoredJobs()
  const updated = [newJob, ...jobs]
  saveStoredJobs(updated, newJob.id)
  return newJob
}

export async function updateJobStatus(
  jobId: string,
  newStatus: JobStatus,
  workerId?: string
): Promise<Job> {
  await delay(250)
  const jobs = getStoredJobs()
  const jobIndex = jobs.findIndex((j) => j.id === jobId)
  if (jobIndex === -1) {
    throw new Error(`Job ${jobId} not found`)
  }

  const currentJob = jobs[jobIndex]

  // Atomic Lock Check for Emergency Broadcasts:
  // If job is already claimed by someone else, reject second worker
  if (newStatus === 'ACCEPTED' && workerId) {
    if (
      currentJob.status === 'ACCEPTED' &&
      currentJob.workerId &&
      currentJob.workerId !== workerId
    ) {
      throw new Error(
        'This emergency job has already been claimed by another cooperative worker.'
      )
    }
  }

  const updatedJob: Job = {
    ...currentJob,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  }

  if (newStatus === 'ACCEPTED' && workerId) {
    const workers = getStoredWorkers()
    const worker = workers.find((w) => w.userId === workerId)
    updatedJob.workerId = workerId
    updatedJob.workerName = worker?.name || 'Assigned Worker'
    updatedJob.workerPhone = worker?.phone || '9876543210'
  }

  // Generate mutual physical 6-digit OTP upon arrival
  if (newStatus === 'ARRIVED') {
    updatedJob.otp = generateOTP()
  }

  // Automatic statutory settlement and welfare credit upon completion
  if (newStatus === 'COMPLETED' && updatedJob.workerId) {
    const customerPrice = updatedJob.basePrice + 150
    const payment = calculatePayment(customerPrice, updatedJob.basePrice, 0.5)

    // Update worker welfare ledger
    const welfare = getStoredWelfare()
    const workerLedger = welfare[updatedJob.workerId] || {
      workerId: updatedJob.workerId,
      workerName: updatedJob.workerName || 'Worker Member',
      societyName: 'Coimbatore City Labour & Artisans Cooperative Society',
      totalContributions: 0,
      balance: 0,
      entries: [],
    }

    workerLedger.balance += payment.welfareContribution
    workerLedger.totalContributions += payment.welfareContribution
    workerLedger.entries.unshift({
      id: `welf-${Date.now().toString().slice(-5)}`,
      jobId: updatedJob.id,
      serviceName: updatedJob.subserviceName,
      amount: payment.welfareContribution,
      date: new Date().toISOString(),
    })

    welfare[updatedJob.workerId] = workerLedger
    saveStoredWelfare(welfare)

    // Increment worker completed jobs
    const workers = getStoredWorkers()
    const workerIdx = workers.findIndex((w) => w.userId === updatedJob.workerId)
    if (workerIdx !== -1) {
      workers[workerIdx].totalJobsCompleted += 1
      workers[workerIdx].dailyJobCount += 1
      saveStoredWorkers(workers)
    }

    // Also save settlement for the worker's earnings view
    try {
      const raw = localStorage.getItem('coop_completed_settlements')
      const existing = raw ? JSON.parse(raw) : []
      const filtered = existing.filter((s: any) => s.jobId !== updatedJob.id)
      localStorage.setItem(
        'coop_completed_settlements',
        JSON.stringify([
          {
            id: `settle-${updatedJob.id}`,
            jobId: updatedJob.id,
            basePrice: payment.basePrice,
            grossAmount: customerPrice,
            workerEarning: payment.workerEarning,
            welfareContribution: payment.welfareContribution,
            subserviceName: updatedJob.subserviceName || 'Cooperative Service',
            bookingType: updatedJob.bookingType || 'STANDARD',
            createdAt: new Date().toISOString(),
            status: 'PAID',
          },
          ...filtered,
        ])
      )
    } catch {}
  }

  jobs[jobIndex] = updatedJob
  saveStoredJobs(jobs, jobId)
  return { ...updatedJob }
}

export async function verifyDoorstepOTP(
  jobId: string,
  inputOtp: string
): Promise<{ success: boolean; job: Job }> {
  await delay(250)
  const job = await getJobById(jobId)

  // Verify match or allow prototype fallback master code 123456
  if (job.otp === inputOtp || inputOtp === '123456') {
    const updated = await updateJobStatus(jobId, 'IN_PROGRESS')
    return { success: true, job: updated }
  }
  return { success: false, job }
}

export async function submitJobRating(
  jobId: string,
  stars: 1 | 2 | 3 | 4 | 5,
  feedback?: string
): Promise<Rating> {
  await delay(250)
  const job = await getJobById(jobId)
  const newRating: Rating = {
    id: `rat-${Date.now()}`,
    jobId,
    customerId: job.customerId,
    customerName: job.customerName || 'Customer',
    workerId: job.workerId || 'wrk-ramesh-kumar',
    workerName: job.workerName || 'Worker',
    stars,
    feedback,
    createdAt: new Date().toISOString(),
  }

  const currentRatings = getStoredRatings()
  saveStoredRatings([newRating, ...currentRatings])

  return newRating
}
