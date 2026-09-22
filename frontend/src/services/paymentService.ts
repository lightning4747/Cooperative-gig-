import type { Payment, Invoice } from '@/types/payment'
import { apiClient } from '@/lib/apiClient'

function mapBackendPayment(p: any): Payment {
  return {
    id: String(p.id),
    jobId: String(p.jobId || p.job_id || ''),
    customerId: String(p.customerId || p.customer_id || ''),
    workerId: String(p.workerId || p.worker_id || ''),
    customerPrice: Number(p.grossAmount || p.gross_amount || 0),
    basePrice: Number(p.basePrice || p.base_price || 0),
    surplus: Number(p.surplus || 0),
    welfareContribution: Number(p.welfareContribution || p.welfare_contribution || 0),
    workerEarning: Number(p.workerEarning || p.worker_earning || 0),
    status:
      p.status === 'SIMULATED_SUCCEEDED'
        ? 'COMPLETED'
        : (p.status as any) || 'COMPLETED',
    paidAt: p.createdAt || p.created_at || new Date().toISOString(),
  }
}

function mapBackendInvoice(inv: any): Invoice {
  const snap = inv.snapshot || {}
  return {
    id: String(inv.id),
    invoiceNumber: inv.invoiceNumber || inv.invoice_number || `INV-${inv.id}`,
    jobId: String(inv.jobId || inv.job_id || ''),
    paymentId: String(inv.paymentId || inv.payment_id || inv.id),
    serviceCategory: snap.categoryName || 'Cooperative Services',
    subservice: snap.service || snap.subserviceName || 'Standard Service',
    customerName: snap.customerName || 'Citizen Member',
    workerName: snap.workerName || 'Cooperative Worker',
    societyName: snap.societyName || 'Primary Cooperative Society',
    societyRegistrationNumber: snap.societyRegistrationNo || 'DEMO-SOC-001',
    workerEShramRef: snap.uanLast4 ? `XXXXXXXX${snap.uanLast4}` : 'Verified',
    servicePrice: Number(snap.grossAmount || snap.gross || 500),
    basePrice: Number(snap.baseWage || snap.basePrice || 500),
    surplus: Number(snap.surplus || 0),
    welfareContribution: Number(snap.welfareContribution || snap.welfare || 0),
    workerEarning: Number(snap.workerEarning || snap.earning || 500),
    paymentStatus: inv.paymentStatus || 'PAID',
    issuedAt: inv.createdAt || inv.created_at || new Date().toISOString(),
  }
}

export const paymentService = {
  simulatePayment: async (jobId: string): Promise<Payment> => {
    const res = await apiClient.post(`/jobs/${jobId}/payments/simulate`)
    return mapBackendPayment(res.data)
  },

  getPayment: async (jobId: string): Promise<Payment | undefined> => {
    try {
      const res = await apiClient.get(`/jobs/${jobId}/payment`)
      return mapBackendPayment(res.data)
    } catch {
      return undefined
    }
  },

  getInvoice: async (jobId: string): Promise<Invoice | undefined> => {
    try {
      const res = await apiClient.get(`/jobs/${jobId}/invoice`)
      return mapBackendInvoice(res.data)
    } catch {
      return undefined
    }
  },

  processPayment: async (
    jobId: string,
    customerPrice: number
  ): Promise<{ payment: Payment; invoice: Invoice }> => {
    const payment = await paymentService.simulatePayment(jobId)
    let invoice = await paymentService.getInvoice(jobId)
    if (!invoice) {
      invoice = {
        id: `inv-${jobId}`,
        invoiceNumber: `INV-${jobId.slice(0, 8).toUpperCase()}`,
        jobId,
        paymentId: payment.id,
        serviceCategory: 'Cooperative Services',
        subservice: 'Service Execution',
        customerName: 'Citizen Member',
        workerName: 'Cooperative Worker',
        societyName: 'Primary Cooperative Society',
        societyRegistrationNumber: 'DEMO-SOC-001',
        workerEShramRef: 'Verified',
        servicePrice: customerPrice,
        basePrice: payment.basePrice,
        surplus: payment.surplus,
        welfareContribution: payment.welfareContribution,
        workerEarning: payment.workerEarning,
        paymentStatus: 'PAID',
        issuedAt: new Date().toISOString(),
      }
    }
    return { payment, invoice }
  },
}
