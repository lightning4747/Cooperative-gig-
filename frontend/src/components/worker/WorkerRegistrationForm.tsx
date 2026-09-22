import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  User,
  Building2,
  Wrench,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileCheck,
} from 'lucide-react'
import {
  workerRegistrationSchema,
  type WorkerRegistrationFormData,
} from '@/lib/schemas'
import { workerService } from '@/services/workerService'
import { catalogService } from '@/services/catalogService'
import { useServiceCatalog } from '@/hooks/useServiceCatalog'
import type { Society } from '@/types/federation'
import { getTranslatedCategoryName, getTranslatedSubserviceName } from '@/lib/serviceTranslation'
import { cn } from '@/lib/utils'

interface WorkerRegistrationFormProps {
  onComplete?: () => void
  className?: string
}

export function WorkerRegistrationForm({ onComplete, className }: WorkerRegistrationFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { categories } = useServiceCatalog()
  const [societies, setSocieties] = useState<Society[]>([])

  useEffect(() => {
    catalogService
      .getSocieties()
      .then((data) => {
        if (data && data.length > 0) setSocieties(data)
      })
      .catch(() => {})
  }, [])

  const {
    register,
    handleSubmit,
    trigger,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<WorkerRegistrationFormData>({
    resolver: zodResolver(workerRegistrationSchema),
    defaultValues: {
      name: '',
      phone: '',
      eShramUAN: '',
      societyId: '',
      membershipId: '',
      serviceCategoryId: '',
      subserviceId: '',
      certificationRef: '',
    },
    mode: 'onTouched',
  })

  // Ensure default society and category are set when loaded
  useEffect(() => {
    if (societies.length > 0 && !getValues('societyId')) {
      setValue('societyId', societies[0].id)
    }
  }, [societies, setValue, getValues])

  useEffect(() => {
    if (categories.length > 0 && !getValues('serviceCategoryId')) {
      setValue('serviceCategoryId', categories[0].id)
      if (categories[0].subservices.length > 0) {
        setValue('subserviceId', categories[0].subservices[0].id)
      }
    }
  }, [categories, setValue, getValues])

  const formValues = useWatch({ control })
  const selectedCategory = categories.find(
    (c) => c.id === formValues.serviceCategoryId || c.code === formValues.serviceCategoryId
  )
  const availableSubservices = selectedCategory?.subservices || []
  const selectedSociety = societies.find(
    (s) => s.id === formValues.societyId
  )

  const nextStep = async (fieldsToValidate: (keyof WorkerRegistrationFormData)[]) => {
    const valid = await trigger(fieldsToValidate)
    if (valid) setStep((s) => s + 1)
  }

  const prevStep = () => {
    setStep((s) => Math.max(1, s - 1))
  }

  const onSubmit = async (data: WorkerRegistrationFormData) => {
    setIsSubmitting(true)
    try {
      const society = societies.find((s) => s.id === data.societyId)
      const subservice = availableSubservices.find((s) => s.id === data.subserviceId)

      await workerService.register({
        name: data.name,
        phone: data.phone,
        societyId: data.societyId,
        societyName: society?.name || 'Cooperative Labour Society',
        membershipId: data.membershipId,
        eShramUAN: data.eShramUAN || 'UAN-PENDING',
        skills: [
          {
            serviceCategoryId: data.serviceCategoryId,
            subserviceId: data.subserviceId,
            subserviceName: subservice?.name || 'Plumbing',
            certificationRef: data.certificationRef,
          },
        ],
      })

      if (onComplete) {
        onComplete()
      } else {
        navigate('/worker/verification')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* 4-Step Progress Indicator */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { id: 1, label: t('worker.registration.stepPersonal', 'Personal') },
          { id: 2, label: t('worker.registration.stepSociety', 'Society') },
          { id: 3, label: t('worker.registration.stepSkills', 'Skills') },
          { id: 4, label: t('worker.registration.stepReview', 'Review') },
        ].map((s) => (
          <div
            key={s.id}
            className={cn(
              'p-2.5 rounded-xl border text-center transition-all',
              step === s.id
                ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs ring-1 ring-primary/20'
                : step > s.id
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold'
                : 'border-border bg-card text-muted-foreground font-medium'
            )}
          >
            <span className="block text-[10px] uppercase tracking-wider">
              Step {s.id}
            </span>
            <span className="text-xs truncate block">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-xs">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* STEP 1: PERSONAL IDENTITY */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm border-b border-border/60 pb-2">
                <User className="w-4 h-4 text-primary" />
                <span>{t('worker.registration.stepPersonal', 'Personal Identity & e-Shram')}</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  {t('worker.registration.fullName', 'Full Legal Name')} *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  {...register('name')}
                  className="w-full p-3 rounded-xl border border-input text-xs font-medium bg-background min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.name && (
                  <p className="text-[11px] text-destructive font-medium">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  {t('worker.registration.phone', 'Mobile Phone (10 digits)')} *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    {...register('phone')}
                    className="w-full p-3 pl-12 rounded-xl border border-input text-xs font-medium bg-background min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {errors.phone && (
                  <p className="text-[11px] text-destructive font-medium">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  {t('worker.registration.eShram', 'e-Shram Universal Account Number (UAN)')} (Optional)
                </label>
                <input
                  type="text"
                  placeholder="UAN 12-digit number"
                  {...register('eShramUAN')}
                  className="w-full p-3 rounded-xl border border-input text-xs font-medium bg-background min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-[11px] text-muted-foreground">
                  Enables direct linkage with PMSBY accidental insurance and central social security benefits.
                </p>
              </div>

              <button
                type="button"
                onClick={() => nextStep(['name', 'phone'])}
                className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-primary/90 transition-all"
              >
                <span>{t('worker.registration.next', 'Continue to Society Affiliation')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: SOCIETY AFFILIATION */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm border-b border-border/60 pb-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span>{t('worker.registration.stepSociety', 'Primary Cooperative Society Affiliation')}</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  {t('worker.registration.society', 'Select Registered Cooperative Society')} *
                </label>
                <select
                  {...register('societyId')}
                  className="w-full p-3 rounded-xl border border-input text-xs font-medium bg-background min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {societies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.district})
                    </option>
                  ))}
                </select>
                {errors.societyId && (
                  <p className="text-[11px] text-destructive font-medium">{errors.societyId.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  {t('worker.registration.membershipId', 'Society Membership / Shareholder ID')} *
                </label>
                <input
                  type="text"
                  placeholder="e.g. MEM-BLR-S-0104"
                  {...register('membershipId')}
                  className="w-full p-3 rounded-xl border border-input text-xs font-mono font-medium bg-background min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.membershipId && (
                  <p className="text-[11px] text-destructive font-medium">{errors.membershipId.message}</p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Issued by your local primary cooperative upon share capital deposit.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="min-h-[44px] py-2.5 px-4 rounded-xl border border-border bg-secondary/70 hover:bg-secondary text-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('worker.registration.back', 'Back')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => nextStep(['societyId', 'membershipId'])}
                  className="min-h-[44px] py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-primary/90 transition-all"
                >
                  <span>{t('worker.registration.next', 'Continue to Skills')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SKILLS */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm border-b border-border/60 pb-2">
                <Wrench className="w-4 h-4 text-primary" />
                <span>{t('worker.registration.stepSkills', 'Your Skills & Work')}</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  {t('worker.registration.category', 'What work do you do?')} *
                </label>
                <select
                  {...register('serviceCategoryId')}
                  className="w-full p-3 rounded-xl border border-input text-xs font-medium bg-background min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {getTranslatedCategoryName(t, c.id, c.name)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  {t('worker.registration.skill', 'Specific work')} *
                </label>
                <select
                  {...register('subserviceId')}
                  className="w-full p-3 rounded-xl border border-input text-xs font-medium bg-background min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {availableSubservices.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {getTranslatedSubserviceName(t, sub.id, sub.name)} (Base: ₹{sub.basePrice})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  {t('worker.registration.certRef', 'Certificate Number')} (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ITI-PLUMB-2019-142 or Skill Certificate"
                  {...register('certificationRef')}
                  className="w-full p-3 rounded-xl border border-input text-xs font-medium bg-background min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-[11px] text-muted-foreground">
                  Workers with certificate get priority for incoming jobs.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="min-h-[44px] py-2.5 px-4 rounded-xl border border-border bg-secondary/70 hover:bg-secondary text-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('worker.registration.back', 'Back')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => nextStep(['serviceCategoryId', 'subserviceId'])}
                  className="min-h-[44px] py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-primary/90 transition-all"
                >
                  <span>{t('worker.registration.next', 'Review Details')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & SUBMISSION */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm border-b border-border/60 pb-2">
                <FileCheck className="w-4 h-4 text-primary" />
                <span>{t('worker.registration.stepReview', 'Check Your Details')}</span>
              </div>

              <div className="p-4 rounded-xl bg-secondary/50 border border-border/80 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Full Legal Name:</span>
                  <span className="font-bold text-foreground">{formValues.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mobile Phone:</span>
                  <span className="font-mono text-foreground">+91 {formValues.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">e-Shram UAN:</span>
                  <span className="font-mono text-foreground">{formValues.eShramUAN || 'Pending'}</span>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-2">
                  <span className="text-muted-foreground">Cooperative Society:</span>
                  <span className="font-medium text-foreground">{selectedSociety?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member ID:</span>
                  <span className="font-mono font-bold text-foreground">{formValues.membershipId || 'Pending'}</span>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-2">
                  <span className="text-muted-foreground">Work Category:</span>
                  <span className="font-bold text-foreground">
                    {getTranslatedCategoryName(t, selectedCategory?.id, selectedCategory?.name)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Skill:</span>
                  <span className="font-medium text-foreground">
                    {availableSubservices.find((s) => s.id === formValues.subserviceId)?.name || 'General'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Your details will be sent to the cooperative office to check.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="min-h-[44px] py-2.5 px-4 rounded-xl border border-border bg-secondary/70 hover:bg-secondary text-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('worker.registration.back', 'Back')}</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[44px] py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('worker.registration.submitVerification', 'Send Details')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
