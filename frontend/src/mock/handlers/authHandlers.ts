import type { User, UserRole } from '@/types/user'
import { delay } from '@/lib/delay'
import { mockCustomers } from '../data/customers'
import { mockWorkers } from '../data/workers'

export async function loginWithPhoneAndRole(
  phone: string,
  role: UserRole,
  _otp: string = '123456'
): Promise<User> {
  await delay(350)

  const cleanPhone = phone.replace(/\D/g, '')

  if (role === 'CUSTOMER') {
    const cust = mockCustomers.find((c) => c.phone.replace(/\D/g, '') === cleanPhone)
    if (!cust && cleanPhone !== '9876543210') {
      throw new Error('User not found')
    }
    return {
      id: cust?.userId || 'cust-demo-ravi',
      name: cust?.name || 'Ravi Kumar',
      phone: cust?.phone || '9876543210',
      role: 'CUSTOMER',
    }
  }

  if (role === 'WORKER') {
    const wrk = mockWorkers.find((w) => w.phone.replace(/\D/g, '') === cleanPhone)
    if (!wrk && cleanPhone !== '9876543211') {
      throw new Error('User not found')
    }
    return {
      id: wrk?.userId || 'wrk-demo-arun',
      name: wrk?.name || 'Arun Electrician',
      phone: wrk?.phone || '9876543211',
      role: 'WORKER',
    }
  }

  if (cleanPhone === '9999999999') {
    return {
      id: 'admin-fed-01',
      name: 'Federation administrator',
      phone: '9999999999',
      role: 'FEDERATION_ADMIN',
    }
  }

  throw new Error('User not found')
}
