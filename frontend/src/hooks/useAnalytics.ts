import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/services/analyticsService'

export function useAnalytics(days = 30) {
  const query = useQuery({
    queryKey: ['admin-analytics-historical', days],
    queryFn: () => analyticsService.getHistoricalAnalytics(days),
    staleTime: 60 * 1000,
  })

  return {
    analytics: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
