import { z } from 'zod'

/**
 * Authentication & Sign-in schema
 */
export const loginSchema = z.object({
  role: z.enum(['CUSTOMER', 'WORKER', 'FEDERATION_ADMIN'], {
    required_error: 'Please select a platform role',
  }),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
  otp: z
    .string()
    .trim()
    .optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Worker Registration multi-step schema
 */
export const workerRegistrationSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  eShramUAN: z.string().optional(),
  societyId: z.string().min(1, 'Please select a primary cooperative society'),
  membershipId: z.string().min(3, 'Society membership ID is required'),
  serviceCategoryId: z.string().min(1, 'Service category is required'),
  subserviceId: z.string().min(1, 'Primary skill is required'),
  certificationRef: z.string().optional(),
})

export type WorkerRegistrationFormData = z.infer<typeof workerRegistrationSchema>

/**
 * Service Booking validation schema
 */
export const bookingSchema = z.object({
  customerId: z.string().min(1),
  serviceCategoryId: z.string().min(1),
  subserviceId: z.string().min(1),
  bookingType: z.enum(['STANDARD', 'ON_DEMAND', 'EMERGENCY']),
  formattedAddress: z.string().min(5, 'Delivery address must be specified'),
  latitude: z.number(),
  longitude: z.number(),
  scheduledAt: z.string().optional(),
})

export type BookingFormData = z.infer<typeof bookingSchema>

/**
 * Customer Rating & Feedback schema
 */
export const ratingSchema = z.object({
  stars: z.number().int().min(1, 'Please select a rating').max(5),
  feedback: z
    .string()
    .max(300, 'Feedback cannot exceed 300 characters')
    .optional(),
})

export type RatingFormData = z.infer<typeof ratingSchema>

/**
 * Federation Statutory Configuration schema
 */
export const federationConfigSchema = z.object({
  welfarePercent: z
    .number({ invalid_type_error: 'Must be a valid percentage' })
    .min(0, 'Percentage cannot be negative')
    .max(100, 'Percentage cannot exceed 100'),
})

export type FederationConfigFormData = z.infer<typeof federationConfigSchema>
