import type { CustomerProfile, Address } from '@/types/user'
import { delay } from '@/lib/delay'
import { mockCustomers } from '../data/customers'

let customers = [...mockCustomers]

export async function getCustomerProfile(userId: string): Promise<CustomerProfile> {
  await delay(300)
  const profile = customers.find((c) => c.userId === userId) || customers[0]
  return profile
}

export async function updateCustomerProfile(
  userId: string,
  updates: Partial<CustomerProfile>
): Promise<CustomerProfile> {
  await delay(300)
  const index = customers.findIndex((c) => c.userId === userId)
  if (index >= 0) {
    customers[index] = { ...customers[index], ...updates }
    return customers[index]
  }
  return customers[0]
}

export async function addCustomerAddress(
  userId: string,
  address: Omit<Address, 'id'>
): Promise<Address> {
  await delay(300)
  const newAddress: Address = {
    ...address,
    id: `addr-${Date.now()}`,
  }
  const cust = customers.find((c) => c.userId === userId)
  if (cust) {
    cust.savedAddresses.push(newAddress)
  }
  return newAddress
}
