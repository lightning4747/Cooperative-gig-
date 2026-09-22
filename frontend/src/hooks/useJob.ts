import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobService } from '@/services/jobService'
import type { JobStatus, Job } from '@/types/job'
import { subscribeToJobUpdates } from '@/lib/events'

export function useJob(jobId?: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribe = subscribeToJobUpdates((updatedJobId) => {
      if (!updatedJobId || updatedJobId === jobId) {
        queryClient.invalidateQueries({ queryKey: ['job', jobId] })
      }
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['workerOffers'] })
    })
    return unsubscribe
  }, [jobId, queryClient])

  const query = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => (jobId ? jobService.getJob(jobId) : Promise.reject('No jobId')),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data as Job | undefined
      // Poll faster during active transition phases
      if (
        data &&
        ['SEARCHING', 'BROADCAST', 'OFFERED', 'ACCEPTED', 'TRAVELLING', 'ARRIVED'].includes(
          data.status
        )
      ) {
        return 1500
      }
      return false
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, workerId }: { status: JobStatus; workerId?: string }) =>
      jobId ? jobService.updateStatus(jobId, status, workerId) : Promise.reject('No jobId'),
    onSuccess: (updatedJob) => {
      queryClient.setQueryData(['job', jobId], updatedJob)
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['workerOffers'] })
      queryClient.invalidateQueries({ queryKey: ['unfulfilledEmergencies'] })
      queryClient.invalidateQueries({ queryKey: ['federationMetrics'] })
    },
  })

  const verifyOtpMutation = useMutation({
    mutationFn: (otp: string) =>
      jobId ? jobService.verifyOtp(jobId, otp) : Promise.reject('No jobId'),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.setQueryData(['job', jobId], result.job)
        queryClient.invalidateQueries({ queryKey: ['jobs'] })
        queryClient.invalidateQueries({ queryKey: ['workerOffers'] })
      }
    },
  })

  return {
    job: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateStatus: updateStatusMutation.mutateAsync,
    verifyOtp: verifyOtpMutation.mutateAsync,
  }
}

export function useJobs(filters?: {
  customerId?: string
  workerId?: string
  status?: JobStatus
  isEmergency?: boolean
}) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribe = subscribeToJobUpdates(() => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    })
    return unsubscribe
  }, [queryClient])

  return useQuery<Job[]>({
    queryKey: ['jobs', filters],
    queryFn: () => jobService.listJobs(filters),
    refetchInterval: 2500,
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useJobPolling(jobId?: string, intervalMs: number = 2000) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribe = subscribeToJobUpdates((updatedJobId) => {
      if (!updatedJobId || updatedJobId === jobId) {
        queryClient.invalidateQueries({ queryKey: ['job', jobId] })
      }
    })
    return unsubscribe
  }, [jobId, queryClient])

  return useQuery({
    queryKey: ['job', jobId],
    queryFn: () => (jobId ? jobService.getJob(jobId) : Promise.reject('No jobId')),
    enabled: !!jobId,
    refetchInterval: intervalMs,
  })
}

export function useWorkerOffers(workerId?: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribe = subscribeToJobUpdates(() => {
      queryClient.invalidateQueries({ queryKey: ['workerOffers', workerId] })
    })
    return unsubscribe
  }, [workerId, queryClient])

  return useQuery<Job[]>({
    queryKey: ['workerOffers', workerId],
    queryFn: () => (workerId ? jobService.getOffersForWorker(workerId) : Promise.resolve([])),
    enabled: !!workerId,
    refetchInterval: 2000,
    staleTime: 0,
    refetchOnMount: 'always',
  })
}
