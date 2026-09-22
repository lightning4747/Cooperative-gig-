export interface Payment {
  id: string
  jobId: string
  customerId: string
  workerId: string
  customerPrice: number
  basePrice: number
  surplus: number
  welfareContribution: number
  workerEarning: number
  status: 'PENDING' | 'COMPLETED' | 'SIMULATED'
  paidAt?: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  jobId: string
  paymentId: string
  serviceCategory: string
  subservice: string
  customerName: string
  workerName: string
  societyName: string
  societyRegistrationNumber: string
  workerEShramRef: string
  servicePrice: number
  basePrice: number
  surplus: number
  welfareContribution: number
  workerEarning: number
  paymentStatus: string
  issuedAt: string
}
