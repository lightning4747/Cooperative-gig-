import type { Payment, Invoice } from '@/types/payment'
import { delay } from '@/lib/delay'
import { calculatePayment } from '@/lib/paymentCalc'
import { mockPayments, mockInvoices } from '../data/payments'
import { mockJobs } from '../data/jobs'
import { mockWorkers } from '../data/workers'
import { getStoredJobs, saveStoredJobs } from '../storage'

let payments = [...mockPayments]
let invoices = [...mockInvoices]

function buildPaymentRecord(
  id: string,
  jobId: string,
  customerId: string,
  workerId: string,
  breakdown: ReturnType<typeof calculatePayment>,
  now: string
): Payment {
  return {
    id,
    jobId,
    customerId,
    workerId,
    customerPrice: breakdown.customerPrice,
    basePrice: breakdown.basePrice,
    surplus: breakdown.surplus,
    welfareContribution: breakdown.welfareContribution,
    workerEarning: breakdown.workerEarning,
    status: 'COMPLETED',
    paidAt: now,
  }
}

function buildInvoiceRecord(
  id: string,
  jobId: string,
  paymentId: string,
  breakdown: ReturnType<typeof calculatePayment>,
  now: string,
  workerId: string,
  serviceCategory = 'Cooperative Service',
  subservice = 'Standard Service',
  customerName = 'Customer',
  workerName = 'Cooperative Worker'
): Invoice {
  const worker = mockWorkers.find((w) => w.userId === workerId)

  return {
    id,
    invoiceNumber: `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
    jobId,
    paymentId,
    serviceCategory,
    subservice,
    customerName,
    workerName,
    societyName: worker?.societyName || 'Bengaluru South Cooperative Labour Society',
    societyRegistrationNumber: 'SOC-BLR-S-104',
    workerEShramRef: worker?.eShramUAN || 'UAN-9821-4432-1102',
    servicePrice: breakdown.customerPrice,
    basePrice: breakdown.basePrice,
    surplus: breakdown.surplus,
    welfareContribution: breakdown.welfareContribution,
    workerEarning: breakdown.workerEarning,
    paymentStatus: 'PAID',
    issuedAt: now,
  }
}

export async function processPaymentSimulation(
  jobId: string,
  customerPrice: number
): Promise<{ payment: Payment; invoice: Invoice }> {
  await delay(400)
  const storedJobs = getStoredJobs()
  const job = storedJobs.find((j) => j.id === jobId) || mockJobs.find((j) => j.id === jobId)
  if (job) {
    job.isPaid = true
    job.paidAmount = customerPrice
    job.paymentStatus = 'SIMULATED_SUCCEEDED'
    saveStoredJobs(storedJobs, jobId)
  }
  const basePrice = job?.basePrice || 500
  const breakdown = calculatePayment(customerPrice, basePrice, 0.5)

  const paymentId = `pay-${Date.now()}`
  const invoiceId = `inv-${Date.now()}`
  const now = new Date().toISOString()
  const workerId = job?.workerId || 'wrk-ramesh-kumar'
  const customerId = job?.customerId || 'cust-priya-sharma'

  const newPayment = buildPaymentRecord(paymentId, jobId, customerId, workerId, breakdown, now)
  const newInvoice = buildInvoiceRecord(
    invoiceId,
    jobId,
    paymentId,
    breakdown,
    now,
    workerId,
    job?.serviceCategoryName,
    job?.subserviceName,
    job?.customerName,
    job?.workerName
  )

  payments.unshift(newPayment)
  invoices.unshift(newInvoice)

  return { payment: newPayment, invoice: newInvoice }
}

export async function getInvoiceByJobId(jobId: string): Promise<Invoice | undefined> {
  await delay(200)
  return invoices.find((inv) => inv.jobId === jobId)
}
