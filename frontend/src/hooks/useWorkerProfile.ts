import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workerService } from '@/services/workerService'
import type { WorkerAvailability } from '@/types/worker'

export function useWorkerProfile(workerId?: string) {
  const queryClient = useQueryClient()
  const targetId = workerId || 'wrk-ramesh-kumar'

  const query = useQuery({
    queryKey: ['workerProfile', targetId],
    queryFn: () => workerService.getProfile(targetId),
  })

  const updateAvailabilityMutation = useMutation({
    mutationFn: (availability: WorkerAvailability) =>
      workerService.updateAvailability(targetId, availability),
    onSuccess: (updated) => {
      queryClient.setQueryData(['workerProfile', targetId], updated)
    },
  })

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateAvailability: updateAvailabilityMutation.mutateAsync,
  }
}
