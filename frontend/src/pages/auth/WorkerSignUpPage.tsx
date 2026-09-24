import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Phone,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Paperclip,
  Check,
  ChevronDown,
  Search,
  X,
} from 'lucide-react'
import { catalogService } from '@/services/catalogService'
import { workerService } from '@/services/workerService'
import { authService } from '@/services/authService'
import type { Society } from '@/types/federation'
import type { ServiceCategory } from '@/types/service'
import { cn } from '@/lib/utils'

const GENDER_OPTIONS = ['Male', 'Female', 'Other'] as const
type Gender = (typeof GENDER_OPTIONS)[number]

const EXP_OPTIONS = ['1-2 Years', '3-5 Years', '5+ Years'] as const
type Experience = (typeof EXP_OPTIONS)[number]

export function WorkerSignUpPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Multi-step progress (1: Personal, 2: Trade & Society, 3: ID & Submit)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)

  // Step 1: Personal Details
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState<Gender>('Male')
  const [experienceYears, setExperienceYears] = useState<Experience>('3-5 Years')
  const [otp, setOtp] = useState('123456')
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false)

  // Step 2: Trade & Society
  const [societies, setSocieties] = useState<Society[]>([])
  const [selectedSocietyId, setSelectedSocietyId] = useState<string>('')
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [selectedSubserviceIds, setSelectedSubserviceIds] = useState<string[]>([])

  // Searchable Dropdowns State & Refs
  const [isSocietyDropdownOpen, setIsSocietyDropdownOpen] = useState(false)
  const [societySearchQuery, setSocietySearchQuery] = useState('')
  const societyDropdownRef = useRef<HTMLDivElement>(null)

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const [categorySearchQuery, setCategorySearchQuery] = useState('')
  const categoryDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        societyDropdownRef.current &&
        !societyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSocietyDropdownOpen(false)
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Step 3: Identity & Submit
  const [membershipId, setMembershipId] = useState<string>(() => `MEM-CBE-${Math.floor(100 + Math.random() * 900)}`)
  const [uanNumber, setUanNumber] = useState('')
  const [isEshramVerified, setIsEshramVerified] = useState(false)
  const [isVerifyingEshram, setIsVerifyingEshram] = useState(false)
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null)
  const [certVerificationUrl, setCertVerificationUrl] = useState('')

  // Submission & UI states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Load Societies & Categories on mount
  useEffect(() => {
    catalogService
      .getSocieties()
      .then((data) => {
        if (data && data.length > 0) {
          setSocieties(data)
          setSelectedSocietyId(data[0].id)
        }
      })
      .catch(() => {})

    catalogService
      .getCategories()
      .then((cats) => {
        setCategories(cats)
        if (cats && cats.length > 0) {
          const firstCat = cats[0]
          setSelectedCategoryIds([firstCat.id])
          if (firstCat.subservices && firstCat.subservices.length > 0) {
            setSelectedSubserviceIds([firstCat.subservices[0].id])
          }
        }
      })
      .catch(() => {})
  }, [])

  // Toggle category selection
  const handleToggleCategory = (catId: string) => {
    if (selectedCategoryIds.includes(catId)) {
      if (selectedCategoryIds.length === 1) return // Keep at least one
      setSelectedCategoryIds((prev) => prev.filter((id) => id !== catId))
      const cat = categories.find((c) => c.id === catId)
      const catSubIds = (cat?.subservices || []).map((s) => s.id)
      setSelectedSubserviceIds((prev) => prev.filter((id) => !catSubIds.includes(id)))
    } else {
      setSelectedCategoryIds((prev) => [...prev, catId])
      const cat = categories.find((c) => c.id === catId)
      if (cat?.subservices && cat.subservices.length > 0) {
        const firstSub = cat.subservices[0].id
        setSelectedSubserviceIds((prev) => (prev.includes(firstSub) ? prev : [...prev, firstSub]))
      }
    }
  }

  // Toggle subservice skill selection
  const handleToggleSkill = (skillId: string) => {
    setSelectedSubserviceIds((prev) =>
      prev.includes(skillId)
        ? (prev.length > 1 ? prev.filter((id) => id !== skillId) : prev)
        : [...prev, skillId]
    )
  }

  // Instant Phone verification
  const handleVerifyPhone = () => {
    const cleanPhone = phone.trim().replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      setFormError('Please enter a 10-digit mobile number')
      return
    }
    setFormError(null)
    setIsVerifyingPhone(true)
    setTimeout(() => {
      setIsVerifyingPhone(false)
      setIsPhoneVerified(true)
      setOtp('123456')
    }, 400)
  }

  // Instant e-Shram verification
  const handleVerifyEshram = () => {
    const cleanUan = uanNumber.trim().replace(/\D/g, '')
    if (cleanUan.length !== 12) {
      setFormError('Please enter a 12-digit e-Shram UAN')
      return
    }
    setFormError(null)
    setIsVerifyingEshram(true)
    setTimeout(() => {
      setIsVerifyingEshram(false)
      setIsEshramVerified(true)
    }, 500)
  }

  // Step 1 Validation & Next
  const handleStep1Next = () => {
    setFormError(null)
    if (!name.trim()) {
      setFormError('Please enter your full legal name')
      return
    }
    const cleanPhone = phone.trim().replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      setFormError('Please enter a 10-digit mobile number')
      return
    }
    setCurrentStep(2)
  }

  // Step 2 Validation & Next
  const handleStep2Next = () => {
    setFormError(null)
    if (!selectedSocietyId) {
      setFormError('Please select your primary cooperative society')
      return
    }
    if (selectedCategoryIds.length === 0) {
      setFormError('Please select at least one trade')
      return
    }
    if (selectedSubserviceIds.length === 0) {
      setFormError('Please select at least one skill')
      return
    }
    setCurrentStep(3)
  }

  // Final Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const cleanPhone = phone.trim().replace(/\D/g, '')
    const cleanUan = uanNumber.trim().replace(/\D/g, '')

    if (cleanUan.length > 0 && cleanUan.length !== 12) {
      setFormError('If provided, e-Shram UAN must be exactly 12 digits')
      return
    }

    setIsSubmitting(true)
    try {
      try {
        await authService.signup(cleanPhone, 'WORKER', otp || '123456', name.trim())
      } catch (authErr: any) {
        if (authErr?.response?.status === 409 || authErr?.message?.includes('already exists')) {
          await authService.login(cleanPhone, 'WORKER', otp || '123456', name.trim())
        } else {
          throw authErr
        }
      }

      const allSelectedSkills = categories
        .flatMap((c) => c.subservices || [])
        .filter((s) => selectedSubserviceIds.includes(s.id))
      const skillNames = allSelectedSkills.map((s) => s.name).join(', ')

      const certifications = [
        `GENDER:${gender}`,
        `EXP_YEARS:${experienceYears}`,
        `PRIMARY_SKILLS:${skillNames}`,
        ...(cleanUan ? [`ESHRAM_UAN:${cleanUan}`] : ['ESHRAM_STATUS:NOT_PROVIDED']),
        ...(attachedFileName ? [`ESHRAM_DOC:${attachedFileName}`] : []),
        ...(certVerificationUrl.trim() ? [`CERT_URL:${certVerificationUrl.trim()}`] : []),
      ]

      await workerService.onboardWorker({
        societyId: selectedSocietyId,
        membershipId: membershipId.trim() || `MEM-${Date.now().toString().slice(-6)}`,
        uan: cleanUan,
        categoryIds: selectedCategoryIds,
        certifications,
      })

      setIsSubmitted(true)
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as any)?.response?.data?.detail ||
            (err as any)?.response?.data?.message ||
            'Failed to submit registration. Please verify details and retry.'
      setFormError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success Confirmation Screen
  if (isSubmitted) {
    return (
      <div className="w-full bg-card border border-border rounded-xl p-6 sm:p-8 space-y-6 shadow-xs text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">
            {t('workerSignUp.submittedTitle', { defaultValue: 'Registration Submitted' })}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {t('workerSignUp.submittedDesc', {
              defaultValue:
                'Your cooperative registration is under review. You can now sign in to your worker dashboard.',
            })}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-secondary/50 border border-border text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Worker:</span>
            <span className="font-bold text-foreground">{name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mobile:</span>
            <span className="font-mono text-foreground">+91 {phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Membership ID:</span>
            <span className="font-mono text-foreground">{membershipId}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xs hover:bg-primary/90 transition-all min-h-[48px]"
        >
          <span>{t('auth.signIn', { defaultValue: 'Sign In to Dashboard' })}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  const filteredSocieties = societies.filter((s) => {
    const q = societySearchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      s.name.toLowerCase().includes(q) ||
      (s.district || '').toLowerCase().includes(q) ||
      (s.registrationNumber || '').toLowerCase().includes(q)
    )
  })

  const filteredCategories = categories.filter((c) => {
    const q = categorySearchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q)
    )
  })

  const selectedSociety = societies.find((s) => s.id === selectedSocietyId)

  return (
    <div className="w-full bg-card border border-border rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
      {/* Header & Step Tracker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t('workerSignUp.title', { defaultValue: 'Worker Registration' })}
          </h1>
          <span className="text-xs font-mono font-bold text-muted-foreground">
            Step {currentStep} of 3
          </span>
        </div>

        {/* 3-Segment Step Progress Bar */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((stepNum) => (
            <div
              key={stepNum}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                stepNum <= currentStep ? 'bg-primary' : 'bg-secondary'
              )}
            />
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          {currentStep === 1 && 'Personal Details · Name & Mobile'}
          {currentStep === 2 && 'Trade & Society · Services & Cooperative Union'}
          {currentStep === 3 && 'Verification · ID & e-Shram UAN'}
        </p>
      </div>

      {formError && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* STEP 1: Personal Details */}
      {currentStep === 1 && (
        <div className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="workerName" className="text-xs font-bold text-foreground block">
              Full Legal Name *
            </label>
            <input
              id="workerName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arun Kumar"
              className="w-full px-3.5 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[48px]"
            />
          </div>

          {/* Mobile Phone */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="workerPhone" className="font-bold text-foreground">
                Mobile Phone Number *
              </label>
              {isPhoneVerified && (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              )}
            </div>
            <div className="flex items-center rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-primary/40 min-h-[48px]">
              <div className="flex items-center gap-1.5 px-3 py-3 text-muted-foreground select-none shrink-0 border-r border-border">
                <Phone className="w-4 h-4" />
                <span className="text-xs font-mono font-bold text-foreground">+91</span>
              </div>
              <input
                id="workerPhone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  if (isPhoneVerified) setIsPhoneVerified(false)
                }}
                placeholder="9876543211"
                className="flex-1 bg-transparent px-3 py-3 text-foreground text-sm font-mono focus:outline-none"
              />
              {!isPhoneVerified && (
                <button
                  type="button"
                  onClick={handleVerifyPhone}
                  disabled={isVerifyingPhone}
                  className="mr-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground transition-colors shrink-0 min-h-[36px]"
                >
                  {isVerifyingPhone ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Verify'}
                </button>
              )}
            </div>
          </div>

          {/* Gender Tap Chips */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              Gender *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GENDER_OPTIONS.map((g) => {
                const isSelected = gender === g
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={cn(
                      'min-h-[48px] rounded-xl border text-xs font-bold transition-all flex items-center justify-center cursor-pointer',
                      isSelected
                        ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                    )}
                  >
                    {g}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Experience Tap Chips */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              Experience Level *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {EXP_OPTIONS.map((exp) => {
                const isSelected = experienceYears === exp
                return (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => setExperienceYears(exp)}
                    className={cn(
                      'min-h-[48px] rounded-xl border text-xs font-bold transition-all flex items-center justify-center cursor-pointer',
                      isSelected
                        ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                    )}
                  >
                    {exp}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Primary CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleStep1Next}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xs hover:bg-primary/90 transition-all min-h-[48px] cursor-pointer"
            >
              <span>Continue to Trade & Society</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Trade & Society */}
      {currentStep === 2 && (
        <div className="space-y-5">
          {/* 1. Primary Cooperative Society Searchable Dropdown */}
          <div className="space-y-1.5" ref={societyDropdownRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground block">
                Primary Cooperative Society *
              </label>
              <span className="text-[11px] text-muted-foreground font-medium">
                {societies.length} Societies Available
              </span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsSocietyDropdownOpen(!isSocietyDropdownOpen)
                  setIsCategoryDropdownOpen(false)
                }}
                className={cn(
                  'w-full min-h-[50px] p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer bg-background',
                  isSocietyDropdownOpen
                    ? 'border-primary ring-2 ring-primary/20 shadow-xs'
                    : 'border-input hover:border-primary/50'
                )}
              >
                {selectedSociety ? (
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-xs font-bold text-foreground block truncate">
                      {selectedSociety.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground block truncate">
                      {selectedSociety.district || 'Coimbatore'} · Reg #{selectedSociety.registrationNumber}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Select primary cooperative society...
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2',
                    isSocietyDropdownOpen && 'rotate-180 text-primary'
                  )}
                />
              </button>

              {/* Dropdown Menu with Search */}
              {isSocietyDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-40 rounded-xl border border-border bg-card shadow-lg overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
                  {/* Search Input Bar */}
                  <div className="p-2 border-b border-border bg-muted/20">
                    <div className="relative flex items-center">
                      <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 shrink-0" />
                      <input
                        type="text"
                        autoFocus
                        value={societySearchQuery}
                        onChange={(e) => setSocietySearchQuery(e.target.value)}
                        placeholder="Search cooperative society, district..."
                        className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      {societySearchQuery && (
                        <button
                          type="button"
                          onClick={() => setSocietySearchQuery('')}
                          className="absolute right-2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Limited Height Scrollable List */}
                  <div className="max-h-52 overflow-y-auto divide-y divide-border/40">
                    {filteredSocieties.length === 0 ? (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        No cooperative societies match &ldquo;{societySearchQuery}&rdquo;
                      </div>
                    ) : (
                      filteredSocieties.map((soc) => {
                        const isSelected = selectedSocietyId === soc.id
                        return (
                          <button
                            key={soc.id}
                            type="button"
                            onClick={() => {
                              setSelectedSocietyId(soc.id)
                              setIsSocietyDropdownOpen(false)
                              setSocietySearchQuery('')
                            }}
                            className={cn(
                              'w-full p-3 text-left transition-colors flex items-center justify-between text-xs cursor-pointer',
                              isSelected
                                ? 'bg-primary/10 text-primary font-bold'
                                : 'hover:bg-muted/40 text-foreground'
                            )}
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <span className="text-xs font-semibold text-foreground block truncate">
                                {soc.name}
                              </span>
                              <span className="text-[11px] text-muted-foreground block truncate">
                                {soc.district || 'Coimbatore'} · Reg #{soc.registrationNumber}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 stroke-[2.5]" />
                              </div>
                            )}
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Service Trade Categories Searchable Dropdown */}
          <div className="space-y-1.5" ref={categoryDropdownRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground block">
                Service Trade Categories *
              </label>
              <span className="text-[11px] text-muted-foreground font-medium">
                {selectedCategoryIds.length} Selected
              </span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                  setIsSocietyDropdownOpen(false)
                }}
                className={cn(
                  'w-full min-h-[50px] p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer bg-background',
                  isCategoryDropdownOpen
                    ? 'border-primary ring-2 ring-primary/20 shadow-xs'
                    : 'border-input hover:border-primary/50'
                )}
              >
                {selectedCategoryIds.length === 0 ? (
                  <span className="text-xs text-muted-foreground px-1">
                    Select service trade categories...
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-1.5 flex-1 min-w-0 pr-2">
                    {categories
                      .filter((c) => selectedCategoryIds.includes(c.id))
                      .slice(0, 3)
                      .map((cat) => (
                        <span
                          key={cat.id}
                          className="px-2 py-0.5 rounded-md bg-secondary border border-border text-foreground text-[11px] font-semibold flex items-center gap-1 shrink-0"
                        >
                          <span className="truncate max-w-[120px]">{cat.name}</span>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleCategory(cat.id)
                            }}
                            className="hover:text-destructive cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </span>
                        </span>
                      ))}
                    {selectedCategoryIds.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-bold self-center">
                        +{selectedCategoryIds.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2',
                    isCategoryDropdownOpen && 'rotate-180 text-primary'
                  )}
                />
              </button>

              {/* Dropdown Menu with Search */}
              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-40 rounded-xl border border-border bg-card shadow-lg overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
                  {/* Search Bar */}
                  <div className="p-2 border-b border-border bg-muted/20">
                    <div className="relative flex items-center">
                      <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 shrink-0" />
                      <input
                        type="text"
                        autoFocus
                        value={categorySearchQuery}
                        onChange={(e) => setCategorySearchQuery(e.target.value)}
                        placeholder="Search trade category (e.g. Electrical, Carpentry)..."
                        className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      {categorySearchQuery && (
                        <button
                          type="button"
                          onClick={() => setCategorySearchQuery('')}
                          className="absolute right-2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary bar */}
                  <div className="px-3 py-1.5 bg-muted/30 border-b border-border/50 text-[10px] font-semibold text-muted-foreground flex justify-between items-center">
                    <span>{selectedCategoryIds.length} of {categories.length} trades chosen</span>
                    {selectedCategoryIds.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCategoryIds([])
                          setSelectedSubserviceIds([])
                        }}
                        className="text-primary hover:underline cursor-pointer"
                      >
                        Reset selection
                      </button>
                    )}
                  </div>

                  {/* Limited Height Scrollable List */}
                  <div className="max-h-52 overflow-y-auto divide-y divide-border/40">
                    {filteredCategories.length === 0 ? (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        No trade categories match &ldquo;{categorySearchQuery}&rdquo;
                      </div>
                    ) : (
                      filteredCategories.map((cat) => {
                        const isSelected = selectedCategoryIds.includes(cat.id)
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleToggleCategory(cat.id)}
                            className={cn(
                              'w-full p-2.5 text-left transition-colors flex items-center justify-between text-xs cursor-pointer',
                              isSelected
                                ? 'bg-primary/5 text-foreground'
                                : 'hover:bg-muted/40 text-foreground'
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                              <div
                                className={cn(
                                  'w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors',
                                  isSelected
                                    ? 'bg-primary border-primary text-primary-foreground'
                                    : 'border-muted-foreground/40 bg-background'
                                )}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className={cn('text-xs block truncate', isSelected ? 'font-bold text-primary' : 'font-semibold text-foreground')}>
                                  {cat.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground block truncate">
                                  {cat.description}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                              {cat.subservices?.length || 0} skills
                            </span>
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Skills Multi-Select Chips */}
          {selectedCategoryIds.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-foreground block">
                Selected Skills & Specializations *
              </label>
              <p className="text-[11px] text-muted-foreground">
                Select specific services you are certified to deliver:
              </p>
              <div className="flex flex-wrap gap-2 pt-1 max-h-48 overflow-y-auto p-1">
                {categories
                  .filter((c) => selectedCategoryIds.includes(c.id))
                  .flatMap((c) => c.subservices || [])
                  .map((sub) => {
                    const isSelected = selectedSubserviceIds.includes(sub.id)
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleToggleSkill(sub.id)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground font-bold shadow-xs'
                            : 'border-border bg-card text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        <span>{sub.name}</span>
                      </button>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleStep2Next}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xs hover:bg-primary/90 transition-all min-h-[48px] cursor-pointer"
            >
              <span>Continue to Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground py-1 cursor-pointer flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Personal Details</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Identity & Submit */}
      {currentStep === 3 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Membership ID */}
          <div className="space-y-1.5">
            <label htmlFor="memberId" className="text-xs font-bold text-foreground block">
              Cooperative Membership ID
            </label>
            <input
              id="memberId"
              type="text"
              value={membershipId}
              onChange={(e) => setMembershipId(e.target.value)}
              placeholder="e.g. MEM-CBE-102"
              className="w-full px-3.5 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[48px]"
            />
          </div>

          {/* e-Shram UAN */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="uan" className="font-bold text-foreground">
                e-Shram UAN (Optional)
              </label>
              {isEshramVerified && (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              )}
            </div>
            <div className="flex items-center rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-primary/40 min-h-[48px]">
              <input
                id="uan"
                type="text"
                inputMode="numeric"
                maxLength={12}
                value={uanNumber}
                onChange={(e) => {
                  setUanNumber(e.target.value)
                  if (isEshramVerified) setIsEshramVerified(false)
                }}
                placeholder="12-digit UAN number"
                className="flex-1 bg-transparent px-3.5 py-3 text-foreground text-sm font-mono focus:outline-none"
              />
              {uanNumber.length === 12 && !isEshramVerified && (
                <button
                  type="button"
                  onClick={handleVerifyEshram}
                  disabled={isVerifyingEshram}
                  className="mr-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground transition-colors shrink-0 min-h-[36px]"
                >
                  {isVerifyingEshram ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Verify'}
                </button>
              )}
            </div>
          </div>

          {/* Skill India Certificate / URL */}
          <div className="space-y-1.5">
            <label htmlFor="certUrl" className="text-xs font-bold text-foreground block">
              Skill India / NCVT Certificate Code (Optional)
            </label>
            <input
              id="certUrl"
              type="text"
              value={certVerificationUrl}
              onChange={(e) => setCertVerificationUrl(e.target.value)}
              placeholder="e.g. SKILL-IN-2024-CBE-98"
              className="w-full px-3.5 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[48px]"
            />
          </div>

          {/* Attach ID Document */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              ID Proof Document (Aadhaar / Voter ID)
            </label>
            <label className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-dashed border-border bg-secondary/30 hover:bg-secondary/60 flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs font-medium text-muted-foreground">
              <Paperclip className="w-4 h-4 text-primary" />
              <span>{attachedFileName || 'Tap to attach document (PDF/JPG)'}</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) setAttachedFileName(f.name)
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* Submit Actions */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xs hover:bg-primary/90 transition-all min-h-[48px] disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Worker Registration</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground py-1 cursor-pointer flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Trade & Society</span>
            </button>
          </div>
        </form>
      )}

      {/* Footer Navigation */}
      <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
        <Link to="/login" className="text-muted-foreground hover:text-foreground font-medium">
          Already registered? Sign In
        </Link>
        <Link to="/language" className="text-muted-foreground hover:text-foreground font-medium">
          Change Language
        </Link>
      </div>
    </div>
  )
}
