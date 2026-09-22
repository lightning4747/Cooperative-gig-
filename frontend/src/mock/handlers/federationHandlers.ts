import type { WorkerProfile, WorkerStatus } from '@/types/worker'
import type { Federation, Society } from '@/types/federation'
import type { Job } from '@/types/job'
import { delay } from '@/lib/delay'
import { mockSocieties, mockFederation } from '../data/federation'
import {
  getStoredJobs,
  saveStoredJobs,
  getStoredWorkers,
  saveStoredWorkers,
  getStoredWelfare,
} from '../storage'

export async function getFederationInfo(): Promise<Federation> {
  await delay(150)
  return { ...mockFederation }
}

export async function getFederationWorkers(societyId?: string): Promise<WorkerProfile[]> {
  await delay(200)
  const workers = getStoredWorkers()
  if (societyId) {
    return workers.filter((w) => w.societyId === societyId)
  }
  return workers
}

export async function updateWorkerVerificationStatus(
  workerId: string,
  newStatus: WorkerStatus
): Promise<WorkerProfile> {
  await delay(250)
  const workers = getStoredWorkers()
  const worker = workers.find((w) => w.userId === workerId)
  if (!worker) {
    throw new Error(`Worker ${workerId} not found`)
  }
  worker.status = newStatus
  if (newStatus === 'ACTIVE') {
    worker.skills.forEach((s) => (s.isVerified = true))
  }
  saveStoredWorkers(workers)
  return { ...worker }
}

export async function getFederationSocieties(): Promise<Society[]> {
  await delay(150)
  return [...mockSocieties]
}

export async function getUnfulfilledEmergencies(): Promise<Job[]> {
  await delay(200)
  const jobs = getStoredJobs()
  return jobs.filter(
    (j) => j.isEmergency && (j.status === 'SEARCHING' || j.status === 'BROADCAST')
  )
}

export async function recordManualEmergencyDispatch(
  jobId: string,
  workerId: string,
  notes: string
): Promise<Job> {
  await delay(300)
  const jobs = getStoredJobs()
  const job = jobs.find((j) => j.id === jobId)
  const workers = getStoredWorkers()
  const worker = workers.find((w) => w.userId === workerId)

  if (!job) {
    throw new Error(`Emergency job ${jobId} not found`)
  }

  job.status = 'ACCEPTED'
  job.workerId = workerId
  job.workerName = worker?.name || 'Manual Dispatched Worker'
  job.workerPhone = worker?.phone || '9876543210'
  job.manualDispatchNotes = notes
  job.updatedAt = new Date().toISOString()

  saveStoredJobs(jobs, jobId)
  return { ...job }
}

export async function getFederationOverviewMetrics(): Promise<{
  activeWorkers: number
  jobsToday: number
  availableWorkers: number
  welfareBalance: number
}> {
  await delay(200)
  const workers = getStoredWorkers()
  const jobs = getStoredJobs()
  const welfare = getStoredWelfare()

  const active = workers.filter((w) => w.status === 'ACTIVE').length
  const available = workers.filter(
    (w) => w.status === 'ACTIVE' && w.availability === 'AVAILABLE'
  ).length
  const jobsCount = jobs.length

  const totalWelfare = Object.values(welfare).reduce(
    (acc, l) => acc + l.balance,
    44250
  )

  return {
    activeWorkers: active,
    jobsToday: jobsCount,
    availableWorkers: available,
    welfareBalance: totalWelfare,
  }
}
