/**
 * Cooperative Payment Breakdown.
 *
 * Rules:
 * 1. Customer pays: Base Pay + Welfare Contribution.
 * 2. Worker receives: Base Pay (100% of Base Pay, zero deductions).
 * 3. Welfare Pool receives: Welfare Contribution (mandatory fee paid by customer).
 */

export interface PaymentBreakdown {
  customerPrice: number
  basePrice: number
  surplus: number
  welfareContribution: number
  workerEarning: number
}

export function calculatePayment(
  customerPrice: number,
  basePrice: number,
  welfareRate: number = 0.05
): PaymentBreakdown {
  const safeBasePrice = Math.max(0, basePrice)
  const rate = welfareRate > 0.2 ? 0.05 : (welfareRate || 0.05)
  const defaultWelfare = Math.max(25, Math.round(safeBasePrice * rate))

  const welfareContribution = customerPrice > safeBasePrice
    ? customerPrice - safeBasePrice
    : defaultWelfare

  const totalCustomerPrice = customerPrice > safeBasePrice
    ? customerPrice
    : safeBasePrice + welfareContribution

  const workerEarning = safeBasePrice

  return {
    customerPrice: totalCustomerPrice,
    basePrice: safeBasePrice,
    surplus: welfareContribution,
    welfareContribution,
    workerEarning,
  }
}
