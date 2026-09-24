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
  const basePrice = Number(snap.baseWage || snap.basePrice || inv.basePrice || 500)
  const servicePrice = Number(snap.grossAmount || snap.gross || inv.grossAmount || 500)
  const rawWelfare = Number(snap.welfareContribution || snap.welfare || inv.welfareContribution || 0)
  const rawSurplus = Number(snap.surplus || 0)
  
  // Every invoice must have a welfare contribution in addition to the wage floor
  const welfareContribution =
    rawWelfare > 0 ? rawWelfare : Math.max(25, Math.round(basePrice * 0.05))
  const surplus = rawSurplus > 0 ? rawSurplus : welfareContribution
  const workerEarning = Number(snap.workerEarning || snap.earning || inv.workerEarning || basePrice)

  return {
    id: String(inv.id),
    invoiceNumber: inv.invoiceNumber || inv.invoice_number || `INV-${inv.id}`,
    jobId: String(inv.jobId || inv.job_id || ''),
    paymentId: String(inv.paymentId || inv.payment_id || inv.id),
    serviceCategory: snap.categoryName || snap.serviceCategory || 'Cooperative Services',
    subservice: snap.service || snap.subserviceName || snap.service_name || 'Standard Service',
    customerName: snap.customerName || snap.customer_name || 'Citizen Member',
    workerName: snap.workerName || snap.worker_name || 'Cooperative Worker',
    societyName: snap.societyName || snap.society_name || 'Coimbatore City Labour & Artisans Cooperative Society',
    societyRegistrationNumber: snap.societyRegistrationNo || snap.society_registration || 'TN-CBE-2023-011',
    workerEShramRef: snap.uanLast4 ? `UAN-XXXX-XXXX-${snap.uanLast4}` : 'UAN-9821-4432-0001',
    servicePrice,
    basePrice,
    surplus,
    welfareContribution,
    workerEarning,
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
      const invoice = mapBackendInvoice(res.data)

      // If snapshot was incomplete, enrich with payment & job details
      if (!res.data?.snapshot?.baseWage || !res.data?.snapshot?.workerName) {
        try {
          const [payRes, jobRes] = await Promise.allSettled([
            apiClient.get(`/jobs/${jobId}/payment`),
            apiClient.get(`/jobs/${jobId}`),
          ])
          if (payRes.status === 'fulfilled' && payRes.value.data) {
            const p = payRes.value.data
            const pBase = Number(p.base_price || p.basePrice || invoice.basePrice)
            const pGross = Number(p.gross_amount || p.grossAmount || invoice.servicePrice)
            const pWelfare = Number(p.welfare_contribution || p.welfareContribution || 0)
            invoice.basePrice = pBase
            invoice.servicePrice = pGross
            invoice.welfareContribution = pWelfare > 0 ? pWelfare : Math.max(25, Math.round(pBase * 0.05))
            invoice.workerEarning = Number(p.worker_earning || p.workerEarning || pBase)
            invoice.surplus = Math.max(0, pGross - pBase)
          }
          if (jobRes.status === 'fulfilled' && jobRes.value.data) {
            const j = jobRes.value.data
            if (j.service_name || j.serviceName) invoice.subservice = j.service_name || j.serviceName
            if (j.worker_name || j.workerName) invoice.workerName = j.worker_name || j.workerName
            if (j.society_name || j.societyName) invoice.societyName = j.society_name || j.societyName
            if (j.customer_name || j.customerName) invoice.customerName = j.customer_name || j.customerName
          }
        } catch {
          // Keep best effort mapped invoice
        }
      }
      return invoice
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
      const basePrice = payment.basePrice || customerPrice
      const welfareContribution =
        payment.welfareContribution > 0
          ? payment.welfareContribution
          : Math.max(25, Math.round(basePrice * 0.05))

      invoice = {
        id: `inv-${jobId}`,
        invoiceNumber: `INV-${jobId.slice(0, 8).toUpperCase()}`,
        jobId,
        paymentId: payment.id,
        serviceCategory: 'Cooperative Services',
        subservice: 'Service Execution',
        customerName: 'Citizen Member',
        workerName: 'Cooperative Worker',
        societyName: 'Coimbatore City Labour & Artisans Cooperative Society',
        societyRegistrationNumber: 'TN-CBE-2023-011',
        workerEShramRef: 'UAN-9821-4432-0001',
        servicePrice: customerPrice,
        basePrice,
        surplus: payment.surplus || welfareContribution,
        welfareContribution,
        workerEarning: payment.workerEarning || basePrice,
        paymentStatus: 'PAID',
        issuedAt: new Date().toISOString(),
      }
    }
    return { payment, invoice }
  },
}
