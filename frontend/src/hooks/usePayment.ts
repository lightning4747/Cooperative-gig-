import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentService } from '@/services/paymentService'

export function usePayment(jobId: string) {
  const queryClient = useQueryClient()

  const invoiceQuery = useQuery({
    queryKey: ['invoice', jobId],
    queryFn: () => paymentService.getInvoice(jobId),
    enabled: !!jobId,
  })

  const processPaymentMutation = useMutation({
    mutationFn: (customerPrice: number) =>
      paymentService.processPayment(jobId, customerPrice),
    onSuccess: (data) => {
      queryClient.setQueryData(['invoice', jobId], data.invoice)
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  return {
    invoice: invoiceQuery.data,
    isLoading: invoiceQuery.isLoading,
    processPayment: processPaymentMutation.mutateAsync,
    isProcessing: processPaymentMutation.isPending,
  }
}
