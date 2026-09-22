import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const {
    user,
    isLoading,
    activeChallenge,
    requestChallenge,
    verify,
    login,
    signup,
    updateProfile,
    refreshSession,
    logout,
    clearChallenge,
  } = useAuthStore()

  return {
    user,
    isLoading,
    activeChallenge,
    requestChallenge,
    verify,
    login,
    signup,
    updateProfile,
    refreshSession,
    logout,
    clearChallenge,
    isAuthenticated: !!user,
    isCustomer: user?.role === 'CUSTOMER',
    isWorker: user?.role === 'WORKER',
    isFederationAdmin: user?.role === 'FEDERATION_ADMIN',
  }
}
