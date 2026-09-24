import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date)
  } catch {
    return isoString
  }
}

export function cleanAddress(address?: string): string {
  if (!address) return ''
  // Remove coordinates like "(12.9236° N, 77.6754° E)" from the address
  return address.replace(/\s*\(\d+\.\d+°\s*[NS],\s*\d+\.\d+°\s*[EW]\)/gi, '').trim()
}

export function formatPhone(phone?: string | null): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length >= 10) {
    const last10 = digits.slice(-10)
    return `+91 ${last10.slice(0, 5)} ${last10.slice(5)}`
  }
  return phone
}
