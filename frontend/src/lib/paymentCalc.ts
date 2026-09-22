/**
 * Structural Wage Floor and Surplus Calculation.
 *
 * Blueprint & Spec Formula:
 * Surplus = CustomerPrice - BasePrice
 * WelfareContribution = f(Surplus) = surplus * welfareRate (e.g. 50%)
 * WorkerTakeHome = BasePrice + (Surplus - WelfareContribution)
 *
 * Invariant: WorkerEarning >= BasePrice (always holds).
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
  welfareRate: number = 0.5
): PaymentBreakdown {
  const safeCustomerPrice = Math.max(customerPrice, basePrice)
  const surplus = Math.max(0, safeCustomerPrice - basePrice)
  const welfareContribution = Math.round(surplus * welfareRate)
  const workerEarning = basePrice + (surplus - welfareContribution)

  return {
    customerPrice: safeCustomerPrice,
    basePrice,
    surplus,
    welfareContribution,
    workerEarning,
  }
}
