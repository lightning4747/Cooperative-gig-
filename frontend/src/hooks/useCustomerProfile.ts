import { useQuery } from '@tanstack/react-query'
import { customerService } from '@/services/customerService'

export function useCustomerProfile(userId?: string) {
  const targetId = userId || 'cust-priya-sharma'

  const query = useQuery({
    queryKey: ['customerProfile', targetId],
    queryFn: () => customerService.getProfile(targetId),
  })

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    savedAddresses: query.data?.savedAddresses || [],
  }
}
