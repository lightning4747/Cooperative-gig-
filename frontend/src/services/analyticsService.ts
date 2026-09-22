import type { HistoricalAnalyticsResponse } from '@/types/analytics'
import { apiClient } from '@/lib/apiClient'

export const analyticsService = {
  getHistoricalAnalytics: async (days = 30): Promise<HistoricalAnalyticsResponse> => {
    const res = await apiClient.get<HistoricalAnalyticsResponse>(`/admin/analytics/historical?days=${days}`)
    return res.data
  },
}
