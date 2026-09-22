export type UserRole = 'CUSTOMER' | 'WORKER' | 'FEDERATION_ADMIN'

export interface User {
  id: string
  role: UserRole
  phone: string
  name: string
  preferredLang?: 'en' | 'hi' | 'ta'
}

export interface Address {
  id: string
  label: string
  formattedAddress: string
  latitude: number
  longitude: number
  isDefault?: boolean
}

export interface CustomerProfile {
  userId: string
  name: string
  phone: string
  preferredLanguage: 'en' | 'hi' | 'ta'
  savedAddresses: Address[]
}
