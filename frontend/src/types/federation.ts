export interface Federation {
  id: string
  name: string
  registrationNumber: string
  createdAt: string
  totalSocieties: number
  totalWorkers: number
}

export interface Society {
  id: string
  federationId: string
  name: string
  registrationNumber: string
  district: string
  state: string
  workerCount: number
}
