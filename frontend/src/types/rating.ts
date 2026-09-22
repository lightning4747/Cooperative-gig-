export interface Rating {
  id: string
  jobId: string
  customerId: string
  customerName: string
  workerId: string
  workerName: string
  stars: 1 | 2 | 3 | 4 | 5
  feedback?: string
  createdAt: string
}
