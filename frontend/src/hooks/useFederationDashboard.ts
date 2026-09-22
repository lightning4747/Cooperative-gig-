import { useQuery } from '@tanstack/react-query'
import { federationService } from '@/services/federationService'

export function useFederationDashboard() {
  const metricsQuery = useQuery({
    queryKey: ['federationMetrics'],
    queryFn: () => federationService.getMetrics(),
    refetchInterval: 10000,
  })

  const societiesQuery = useQuery({
    queryKey: ['federationSocieties'],
    queryFn: () => federationService.getSocieties(),
  })

  const emergenciesQuery = useQuery({
    queryKey: ['unfulfilledEmergencies'],
    queryFn: () => federationService.getUnfulfilledEmergencies(),
    refetchInterval: 5000,
  })

  return {
    metrics: metricsQuery.data,
    societies: societiesQuery.data || [],
    emergencies: emergenciesQuery.data || [],
    isLoading: metricsQuery.isLoading || societiesQuery.isLoading,
  }
}

export function useFederationWorkers(societyId?: string) {
  const query = useQuery({
    queryKey: ['federationWorkers', societyId],
    queryFn: () => federationService.getWorkers(societyId),
  })

  return {
    workers: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
