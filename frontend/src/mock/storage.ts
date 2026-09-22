import type { Job } from '@/types/job'
import type { WorkerProfile } from '@/types/worker'
import type { WelfareLedger } from '@/types/welfare'
import type { Rating } from '@/types/rating'

const STORAGE_KEYS = {
  JOBS: 'coop_gig_jobs_v2',
  WORKERS: 'coop_gig_workers_v2',
  WELFARE: 'coop_gig_welfare_v2',
  RATINGS: 'coop_gig_ratings_v2',
}

const JOB_UPDATE_EVENT = 'coop-job-updated'

function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      return fallback
    }
    const parsed = JSON.parse(raw) as T
    // Purge legacy mock data if detected
    if (Array.isArray(parsed) && parsed.some((item: any) => item?.id === 'job-101' || item?.userId === 'wrk-ramesh-kumar')) {
      localStorage.removeItem(key)
      return fallback
    }
    return parsed
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`Failed to save to localStorage for key ${key}:`, err)
  }
}

// Jobs
export function getStoredJobs(): Job[] {
  return getFromStorage<Job[]>(STORAGE_KEYS.JOBS, [])
}

export function saveStoredJobs(jobs: Job[], updatedJobId?: string): void {
  saveToStorage(STORAGE_KEYS.JOBS, jobs)
  dispatchJobUpdate(updatedJobId)
}

// Workers
export function getStoredWorkers(): WorkerProfile[] {
  return getFromStorage<WorkerProfile[]>(STORAGE_KEYS.WORKERS, [])
}

export function saveStoredWorkers(workers: WorkerProfile[]): void {
  saveToStorage(STORAGE_KEYS.WORKERS, workers)
}

// Welfare
export function getStoredWelfare(): Record<string, WelfareLedger> {
  return getFromStorage<Record<string, WelfareLedger>>(
    STORAGE_KEYS.WELFARE,
    {}
  )
}

export function saveStoredWelfare(welfare: Record<string, WelfareLedger>): void {
  saveToStorage(STORAGE_KEYS.WELFARE, welfare)
}

// Ratings
export function getStoredRatings(): Rating[] {
  return getFromStorage<Rating[]>(STORAGE_KEYS.RATINGS, [])
}

export function saveStoredRatings(ratings: Rating[]): void {
  saveToStorage(STORAGE_KEYS.RATINGS, ratings)
}

// Event Dispatch & Subscription for Multi-Tab & Same-Tab Reactivity
export function dispatchJobUpdate(jobId?: string): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent(JOB_UPDATE_EVENT, {
      detail: { jobId, timestamp: Date.now() },
    })
  )
}

export function subscribeToJobUpdates(callback: (jobId?: string) => void): () => void {
  if (typeof window === 'undefined') return () => {}

  const handleCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent
    callback(customEvent.detail?.jobId)
  }

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.JOBS) {
      callback()
    }
  }

  window.addEventListener(JOB_UPDATE_EVENT, handleCustomEvent)
  window.addEventListener('storage', handleStorageEvent)

  return () => {
    window.removeEventListener(JOB_UPDATE_EVENT, handleCustomEvent)
    window.removeEventListener('storage', handleStorageEvent)
  }
}

// Helper to reset storage to default seed
export function resetMockStorage(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.JOBS)
  localStorage.removeItem(STORAGE_KEYS.WORKERS)
  localStorage.removeItem(STORAGE_KEYS.WELFARE)
  localStorage.removeItem(STORAGE_KEYS.RATINGS)
  dispatchJobUpdate()
}
