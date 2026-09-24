import type { HistoricalAnalyticsResponse } from '@/types/analytics'
import { apiClient } from '@/lib/apiClient'
import { mockHistoricalAnalytics } from '@/mock/data/analytics'

export const analyticsService = {
  getHistoricalAnalytics: async (days = 30): Promise<HistoricalAnalyticsResponse> => {
    try {
      const res = await apiClient.get<HistoricalAnalyticsResponse>(`/admin/analytics/historical?days=${days}`)
      if (res.data && res.data.summary && res.data.summary.totalBookings > 30) {
        return res.data
      }
      return mockHistoricalAnalytics
    } catch {
      return mockHistoricalAnalytics
    }
  },
}
