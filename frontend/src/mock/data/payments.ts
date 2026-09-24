import type { Payment, Invoice } from '@/types/payment'

export const mockPayments: Payment[] = [
  {
    id: 'pay-102',
    jobId: 'job-102',
    customerId: '83cf9fc2-33be-4b62-82c6-73396ab41283',
    workerId: '83cf9fc2-33be-4b62-82c6-73396ab41284',
    customerPrice: 800, // Customer paid 800 (base: 600)
    basePrice: 600,
    surplus: 200,
    welfareContribution: 100, // 50% of surplus
    workerEarning: 700, // 600 + (200 - 100)
    status: 'COMPLETED',
    paidAt: '2026-09-19T09:35:00.000Z',
  },
  {
    id: 'pay-103',
    jobId: 'job-103',
    customerId: 'cust-anand-kumar',
    workerId: '83cf9fc2-33be-4b62-82c6-73396ab41281',
    customerPrice: 700, // Exact base price, surplus 0
    basePrice: 700,
    surplus: 0,
    welfareContribution: 0,
    workerEarning: 700,
    status: 'COMPLETED',
    paidAt: '2026-09-18T16:05:00.000Z',
  },
]

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-102',
    invoiceNumber: 'INV-2026-09-0102',
    jobId: 'job-102',
    paymentId: 'pay-102',
    serviceCategory: 'Plumbing',
    subservice: 'Pipe burst (Emergency)',
    customerName: 'Ravi Kumar',
    workerName: 'Karthik Plumber',
    societyName: 'RS Puram Cooperative Workers Union',
    societyRegistrationNumber: 'TN-CBE-2023-042',
    workerEShramRef: 'UAN-9821-4432-0002',
    servicePrice: 800,
    basePrice: 600,
    surplus: 200,
    welfareContribution: 100,
    workerEarning: 700,
    paymentStatus: 'PAID',
    issuedAt: '2026-09-19T09:35:00.000Z',
  },
  {
    id: 'inv-103',
    invoiceNumber: 'INV-2026-09-0103',
    jobId: 'job-103',
    paymentId: 'pay-103',
    serviceCategory: 'Electrical',
    subservice: 'MCB wiring',
    customerName: 'Anand Kumar',
    workerName: 'Arun',
    societyName: 'Coimbatore City Labour & Artisans Cooperative Society',
    societyRegistrationNumber: 'TN-CBE-2023-011',
    workerEShramRef: 'UAN-9821-4432-0001',
    servicePrice: 700,
    basePrice: 700,
    surplus: 0,
    welfareContribution: 0,
    workerEarning: 700,
    paymentStatus: 'PAID',
    issuedAt: '2026-09-18T16:05:00.000Z',
  },
]
