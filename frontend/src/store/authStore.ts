import { create } from 'zustand'
import type { User, UserRole } from '@/types/user'
import { authService, type ChallengeResponse } from '@/services/authService'

interface AuthState {
  user: User | null
  isLoading: boolean
  activeChallenge: ChallengeResponse | null
  requestChallenge: (phone: string, signup?: boolean) => Promise<ChallengeResponse>
  verify: (challengeId: string, code: string, role: UserRole, name?: string, signup?: boolean) => Promise<User>
  login: (phone: string, role: UserRole, otp?: string) => Promise<User>
  signup: (phone: string, role: UserRole, otp?: string, name?: string) => Promise<User>
  updateProfile: (name: string, preferredLang: 'en' | 'hi' | 'ta') => Promise<User>
  refreshSession: () => Promise<User | null>
  logout: () => Promise<void>
  clearChallenge: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: authService.getCurrentUser(),
  isLoading: false,
  activeChallenge: null,

  requestChallenge: async (phone: string, signup: boolean = false) => {
    set({ isLoading: true })
    try {
      const challenge = await authService.requestChallenge(phone, signup)
      set({ activeChallenge: challenge, isLoading: false })
      return challenge
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  verify: async (challengeId: string, code: string, role: UserRole, name?: string, signup: boolean = false) => {
    set({ isLoading: true })
    try {
      const user = await authService.verify(challengeId, code, role, name, signup)
      set({ user, activeChallenge: null, isLoading: false })
      return user
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  login: async (phone: string, role: UserRole, otp?: string) => {
    set({ isLoading: true })
    try {
      const user = await authService.login(phone, role, otp)
      set({ user, activeChallenge: null, isLoading: false })
      return user
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  signup: async (phone: string, role: UserRole, otp?: string, name?: string) => {
    set({ isLoading: true })
    try {
      const user = await authService.signup(phone, role, otp, name)
      set({ user, activeChallenge: null, isLoading: false })
      return user
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  updateProfile: async (name: string, preferredLang: 'en' | 'hi' | 'ta') => {
    const updated = await authService.updateProfile(name, preferredLang)
    set({ user: updated })
    return updated
  },

  refreshSession: async () => {
    try {
      const me = await authService.getMe()
      set({ user: me })
      return me
    } catch {
      set({ user: null })
      return null
    }
  },

  logout: async () => {
    await authService.logout()
    set({ user: null, activeChallenge: null })
  },

  clearChallenge: () => set({ activeChallenge: null }),
}))
