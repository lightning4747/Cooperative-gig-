import type { DemandForecast } from '@/types/forecast'
import { apiClient } from '@/lib/apiClient'

export const forecastService = {
  getForecasts: async (): Promise<DemandForecast[]> => {
    try {
      const res = await apiClient.post<any>('/admin/forecast', { horizonDays: 7 })
      if (Array.isArray(res.data)) {
        return res.data
      }
      return []
    } catch {
      // Backend returns 503 if no ML model configured ("Provide the existing forecasting model endpoint; no synthetic prediction is substituted")
      return []
    }
  },
}
