import type { CustomerProfile, Address } from '@/types/user'
import { apiClient } from '@/lib/apiClient'
import { useAuthStore } from '@/store/authStore'

export const customerService = {
  getProfile: async (userId?: string): Promise<CustomerProfile> => {
    try {
      const res = await apiClient.get<any>('/me')
      const user = res.data
      const addressesStr = localStorage.getItem(`customer_addresses_${user.id}`)
      const addresses: Address[] = addressesStr ? JSON.parse(addressesStr) : []
      return {
        userId: String(user.id),
        phone: user.phone || '',
        name: user.name || 'Citizen Member',
        savedAddresses: addresses,
        preferredLanguage: user.preferredLang || user.preferred_lang || 'en',
      }
    } catch {
      const authUser = useAuthStore.getState().user
      const addressesStr = authUser?.id ? localStorage.getItem(`customer_addresses_${authUser.id}`) : null
      const addresses: Address[] = addressesStr ? JSON.parse(addressesStr) : []
      return {
        userId: authUser?.id || userId || 'customer-me',
        phone: authUser?.phone || '',
        name: authUser?.name || 'Citizen Member',
        savedAddresses: addresses,
        preferredLanguage: (authUser?.preferredLang as any) || 'en',
      }
    }
  },

  updateProfile: async (userId: string, updates: Partial<CustomerProfile>): Promise<CustomerProfile> => {
    try {
      const res = await apiClient.patch<any>('/me', {
        name: updates.name,
        preferredLang: updates.preferredLanguage,
      })
      const user = res.data
      return {
        userId: String(user.id),
        phone: user.phone || '',
        name: user.name || 'Citizen Member',
        savedAddresses: updates.savedAddresses || [],
        preferredLanguage: user.preferredLang || user.preferred_lang || 'en',
      }
    } catch {
      return {
        userId,
        phone: updates.phone || '',
        name: updates.name || 'Citizen Member',
        savedAddresses: updates.savedAddresses || [],
        preferredLanguage: (updates.preferredLanguage as any) || 'en',
      }
    }
  },

  addAddress: async (userId: string, address: Omit<Address, 'id'>): Promise<Address> => {
    const newAddr: Address = {
      ...address,
      id: `addr-${Date.now()}`,
    }
    const key = `customer_addresses_${userId}`
    const existing = localStorage.getItem(key)
    const list: Address[] = existing ? JSON.parse(existing) : []
    list.push(newAddr)
    localStorage.setItem(key, JSON.stringify(list))
    return newAddr
  },
}
