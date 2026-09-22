import { useQuery } from '@tanstack/react-query'
import { forecastService } from '@/services/forecastService'

export function useForecast() {
  const query = useQuery({
    queryKey: ['demandForecasts'],
    queryFn: () => forecastService.getForecasts(),
  })

  return {
    forecasts: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  }
}
