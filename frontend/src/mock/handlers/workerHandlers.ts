import type { WorkerProfile, WorkerAvailability, WorkerSkill } from '@/types/worker'
import { delay } from '@/lib/delay'
import { mockWorkers } from '../data/workers'

let workers = [...mockWorkers]

export async function getWorkerProfile(workerId: string): Promise<WorkerProfile> {
  await delay(300)
  const worker = workers.find((w) => w.userId === workerId) || workers[0]
  return worker
}

export async function updateWorkerAvailability(
  workerId: string,
  availability: WorkerAvailability
): Promise<WorkerProfile> {
  await delay(250)
  const worker = workers.find((w) => w.userId === workerId)
  if (worker) {
    worker.availability = availability
    return { ...worker }
  }
  return workers[0]
}

export interface RegisterWorkerInput {
  name: string
  phone: string
  societyId: string
  societyName: string
  membershipId: string
  eShramUAN: string
  skills: { serviceCategoryId: string; subserviceId: string; subserviceName: string; certificationRef?: string }[]
}

export async function registerWorker(input: RegisterWorkerInput): Promise<WorkerProfile> {
  await delay(400)
  const newWorkerId = `wrk-${Date.now()}`
  const createdSkills: WorkerSkill[] = input.skills.map((s, idx) => ({
    id: `sk-new-${idx}`,
    workerId: newWorkerId,
    serviceCategoryId: s.serviceCategoryId,
    subserviceId: s.subserviceId,
    subserviceName: s.subserviceName,
    isVerified: false,
    certificationRef: s.certificationRef,
  }))

  const newProfile: WorkerProfile = {
    userId: newWorkerId,
    name: input.name,
    phone: input.phone,
    societyId: input.societyId,
    societyName: input.societyName,
    membershipId: input.membershipId,
    eShramUAN: input.eShramUAN,
    status: 'PENDING_VERIFICATION',
    availability: 'AVAILABLE',
    latitude: 12.9250,
    longitude: 77.6300,
    rating: 0,
    totalJobsCompleted: 0,
    dailyJobCount: 0,
    skills: createdSkills,
    insurancePMSBY: 'PENDING',
    insurancePMJJBY: 'PENDING',
  }

  workers.unshift(newProfile)
  return newProfile
}
