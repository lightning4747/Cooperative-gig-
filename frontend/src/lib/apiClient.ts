import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  // Never send stale Authorization headers to public auth endpoints
  if (
    config.url?.includes('/auth/challenges') ||
    config.url?.includes('/auth/verify') ||
    config.url?.includes('/auth/refresh')
  ) {
    if (config.headers) {
      delete config.headers.Authorization
      delete config.headers.authorization
    }
    return config
  }

  const token = sessionStorage.getItem('auth_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  } else if (config.headers) {
    delete config.headers.Authorization
    delete config.headers.authorization
  }
  return config
})

// Response interceptor to handle token refresh on 401
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest.url?.includes('/auth/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = sessionStorage.getItem('refresh_token')
      if (!refreshToken) {
        isRefreshing = false
        sessionStorage.removeItem('auth_token')
        sessionStorage.removeItem('refresh_token')
        sessionStorage.removeItem('coop_auth_user')
        delete apiClient.defaults.headers.common.Authorization
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        })
        const { accessToken, refreshToken: newRefreshToken, user } = response.data
        sessionStorage.setItem('auth_token', accessToken)
        if (newRefreshToken) {
          sessionStorage.setItem('refresh_token', newRefreshToken)
        }
        if (user) {
          const mapped = {
            ...user,
            role: user.role === 'ADMIN' ? 'FEDERATION_ADMIN' : user.role,
          }
          sessionStorage.setItem('coop_auth_user', JSON.stringify(mapped))
        }

        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        processQueue(null, accessToken)
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        sessionStorage.removeItem('auth_token')
        sessionStorage.removeItem('refresh_token')
        sessionStorage.removeItem('coop_auth_user')
        delete apiClient.defaults.headers.common.Authorization
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
