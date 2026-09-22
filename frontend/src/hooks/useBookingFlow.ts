import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { jobService } from '@/services/jobService'
import { useAuthStore } from '@/store/authStore'
import { bookingSchema } from '@/lib/schemas'
import type { BookingType } from '@/types/job'

interface BookingState {
  categoryId: string
  categoryName: string
  subserviceId: string
  subserviceName: string
  basePrice: number
  bookingType: BookingType
  scheduledAt?: string
  location?: {
    latitude: number
    longitude: number
    formattedAddress: string
    area?: string
  }
}

const DRAFT_KEY = 'cooperative_booking_draft'

function loadDraft(): Partial<BookingState> {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (err) {
    console.warn('Failed to load booking draft:', err)
  }
  return { bookingType: 'STANDARD' }
}

function saveDraft(state: Partial<BookingState>) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(state))
  } catch (err) {
    console.warn('Failed to save booking draft:', err)
  }
}

function clearStoredDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY)
  } catch (err) {
    console.warn('Failed to clear booking draft:', err)
  }
}

export function useBookingFlow() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [booking, setBooking] = useState<Partial<BookingState>>(loadDraft)

  const updateBooking = useCallback((data: Partial<BookingState>) => {
    setBooking((prev) => {
      const next = { ...prev, ...data }
      saveDraft(next)
      return next
    })
  }, [])

  const clearBooking = useCallback(() => {
    clearStoredDraft()
    setBooking({ bookingType: 'ON_DEMAND' })
  }, [])

  const createJobMutation = useMutation({
    mutationFn: async (customerId: string) => {
      if (!booking.subserviceId || !booking.location || !booking.basePrice) {
        throw new Error('Incomplete booking information')
      }

      bookingSchema.parse({
        customerId,
        serviceCategoryId: booking.categoryId || '',
        subserviceId: booking.subserviceId,
        bookingType: booking.bookingType || 'ON_DEMAND',
        formattedAddress: booking.location.formattedAddress,
        latitude: booking.location.latitude,
        longitude: booking.location.longitude,
        scheduledAt: booking.scheduledAt,
      })

      const currentUser = useAuthStore.getState().user

      return jobService.createJob({
        customerId,
        customerName: currentUser?.name || 'Customer User',
        customerPhone: currentUser?.phone || '9876543210',
        serviceCategoryId: booking.categoryId!,
        serviceCategoryName: booking.categoryName!,
        subserviceId: booking.subserviceId!,
        subserviceName: booking.subserviceName!,
        bookingType: booking.bookingType || 'ON_DEMAND',
        basePrice: booking.basePrice!,
        location: {
          latitude: booking.location!.latitude,
          longitude: booking.location!.longitude,
          formattedAddress: booking.location!.formattedAddress,
          area: booking.location!.area || 'Chennai Central',
        },
        scheduledAt: booking.scheduledAt,
      })
    },
    onSuccess: (newJob) => {
      clearStoredDraft()
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      navigate(`/customer/jobs/${newJob.id}/tracking`)
    },
  })

  return {
    booking,
    updateBooking,
    clearBooking,
    confirmBooking: createJobMutation.mutateAsync,
    isSubmitting: createJobMutation.isPending,
  }
}
