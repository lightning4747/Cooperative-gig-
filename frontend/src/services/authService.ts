import type { User, UserRole } from '@/types/user'
import { apiClient } from '@/lib/apiClient'
import { queryClient } from '@/lib/queryClient'

export interface ChallengeResponse {
  challengeId: string
  expiresInSeconds: number
  devCode?: string
  deliveryMode: string
}

export interface BackendUser {
  id: string
  phone: string
  role: 'CUSTOMER' | 'WORKER' | 'ADMIN'
  name: string
  preferredLang: 'en' | 'hi' | 'ta'
}

export interface AuthSessionResponse {
  accessToken: string
  refreshToken: string
  expiresInSeconds: number
  user: BackendUser
}

export function normalizePhone(phone: string): string {
  const cleaned = phone.trim().replace(/[\s-]/g, '')
  if (cleaned.startsWith('+')) return cleaned
  return `+91${cleaned}`
}

export function mapBackendRole(backendRole: string): UserRole {
  if (backendRole === 'ADMIN') return 'FEDERATION_ADMIN'
  if (backendRole === 'WORKER') return 'WORKER'
  return 'CUSTOMER'
}

export const authService = {
  requestChallenge: async (phone: string, signup: boolean = false): Promise<ChallengeResponse> => {
    const formattedPhone = normalizePhone(phone)
    const res = await apiClient.post<ChallengeResponse>('/auth/challenges', {
      phone: formattedPhone,
      signup,
    })
    return res.data
  },

  verify: async (
    challengeId: string,
    code: string,
    role: UserRole,
    name?: string,
    signup: boolean = false
  ): Promise<User> => {
    const backendRole = role === 'FEDERATION_ADMIN' ? 'ADMIN' : role
    const res = await apiClient.post<AuthSessionResponse>('/auth/verify', {
      challengeId,
      code,
      role: backendRole,
      name: name || '',
      signup,
    })

    const data = res.data
    sessionStorage.setItem('auth_token', data.accessToken)
    sessionStorage.setItem('refresh_token', data.refreshToken)
    apiClient.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`

    const mappedUser: User = {
      id: data.user.id,
      phone: data.user.phone,
      name: data.user.name,
      role: mapBackendRole(data.user.role),
      preferredLang: data.user.preferredLang,
    }

    sessionStorage.setItem('coop_auth_user', JSON.stringify(mappedUser))
    return mappedUser
  },

  login: async (phone: string, role: UserRole, otp?: string, name?: string): Promise<User> => {
    const challenge = await authService.requestChallenge(phone, false)
    const code = challenge.devCode || otp || '123456'
    return authService.verify(challenge.challengeId, code, role, name, false)
  },

  signup: async (phone: string, role: UserRole, otp?: string, name?: string): Promise<User> => {
    const challenge = await authService.requestChallenge(phone, true)
    const code = challenge.devCode || otp || '123456'
    return authService.verify(challenge.challengeId, code, role, name, true)
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<BackendUser>('/me')
    const mappedUser: User = {
      id: res.data.id,
      phone: res.data.phone,
      name: res.data.name,
      role: mapBackendRole(res.data.role),
      preferredLang: res.data.preferredLang,
    }
    sessionStorage.setItem('coop_auth_user', JSON.stringify(mappedUser))
    return mappedUser
  },

  updateProfile: async (name: string, preferredLang: 'en' | 'hi' | 'ta'): Promise<User> => {
    const res = await apiClient.patch<BackendUser>('/me', {
      name,
      preferredLang,
    })
    const mappedUser: User = {
      id: res.data.id,
      phone: res.data.phone,
      name: res.data.name,
      role: mapBackendRole(res.data.role),
      preferredLang: res.data.preferredLang,
    }
    sessionStorage.setItem('coop_auth_user', JSON.stringify(mappedUser))
    return mappedUser
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/me/logout')
    } catch {
      // Ignore network or token expiration error on logout
    } finally {
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('refresh_token')
      sessionStorage.removeItem('coop_auth_user')
      delete apiClient.defaults.headers.common.Authorization
      queryClient.clear()
    }
  },

  getCurrentUser: (): User | null => {
    const raw = sessionStorage.getItem('coop_auth_user')
    if (!raw) return null
    try {
      return JSON.parse(raw) as User
    } catch {
      return null
    }
  },
}
