import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Phone,
  ArrowRight,
  AlertCircle,
  Loader2,
  Paperclip,
  Building2,
  Wrench,
  CheckCircle2,
} from 'lucide-react'
import { catalogService } from '@/services/catalogService'
import { workerService } from '@/services/workerService'
import { authService } from '@/services/authService'
import type { Society } from '@/types/federation'
import type { ServiceCategory } from '@/types/service'
import { cn } from '@/lib/utils'

const GENDER_OPTIONS = ['Male', 'Female', 'Other'] as const
type Gender = (typeof GENDER_OPTIONS)[number]

export function WorkerSignUpPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Form states
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState<Gender>('Male')
  const [otp, setOtp] = useState('123456')

  // Verification states (Mock verify options)
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false)
  const [isEshramVerified, setIsEshramVerified] = useState(false)
  const [isVerifyingEshram, setIsVerifyingEshram] = useState(false)

  // Catalog & Society states
  const [societies, setSocieties] = useState<Society[]>([])
  const [selectedSocietyId, setSelectedSocietyId] = useState('')
  const [membershipId, setMembershipId] = useState(
    () => `SOC-MEM-${Math.floor(1000 + Math.random() * 9000)}`
  )

  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [selectedSubserviceIds, setSelectedSubserviceIds] = useState<string[]>([])

  // e-Shram & Experience states
  const [uanNumber, setUanNumber] = useState('')
  const [experienceYears, setExperienceYears] = useState('4')
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null)

  // Skill Certificate states (Skill India / NCVT Certificate Code + Document)
  const [certVerificationUrl, setCertVerificationUrl] = useState('')
  const [certFileName, setCertFileName] = useState<string | null>(null)

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

  // Add category from dropdown
  const handleAddCategory = (catId: string) => {
    if (!catId || selectedCategoryIds.includes(catId)) return
    setSelectedCategoryIds((prev) => [...prev, catId])
    const cat = categories.find((c) => c.id === catId)
    if (cat?.subservices && cat.subservices.length > 0) {
      const firstSub = cat.subservices[0].id
      setSelectedSubserviceIds((prev) => (prev.includes(firstSub) ? prev : [...prev, firstSub]))
    }
  }

  // Remove category and its associated skills
  const handleRemoveCategory = (catId: string) => {
    setSelectedCategoryIds((prev) => prev.filter((id) => id !== catId))
    const cat = categories.find((c) => c.id === catId)
    const catSubIds = (cat?.subservices || []).map((s) => s.id)
    setSelectedSubserviceIds((prev) => prev.filter((id) => !catSubIds.includes(id)))
  }

  // Add skill under category from dropdown
  const handleAddSkill = (skillId: string) => {
    if (!skillId || selectedSubserviceIds.includes(skillId)) return
    setSelectedSubserviceIds((prev) => [...prev, skillId])
  }

  // Remove individual skill
  const handleRemoveSkill = (skillId: string) => {
    setSelectedSubserviceIds((prev) => prev.filter((id) => id !== skillId))
  }

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAttachedFileName(file.name)
    }
  }

  const handleCertFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCertFileName(file.name)
    }
  }

  // Mock phone verification handler
  const handleVerifyPhone = () => {
    const cleanPhone = phone.trim().replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      setFormError(t('workerSignUp.phonePlaceholder', { defaultValue: 'Enter 10-digit mobile number' }))
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

  // Mock e-Shram verification handler
  const handleVerifyEshram = () => {
    const cleanUan = uanNumber.trim().replace(/\D/g, '')
    if (cleanUan.length !== 12) {
      setFormError(t('workerSignUp.uanPlaceholder', { defaultValue: 'Please enter a 12-digit e-Shram UAN to verify.' }))
      return
    }
    setFormError(null)
    setIsVerifyingEshram(true)
    setTimeout(() => {
      setIsVerifyingEshram(false)
      setIsEshramVerified(true)
    }, 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!name.trim()) {
      setFormError(t('workerSignUp.namePlaceholder', { defaultValue: 'Please enter your full legal name.' }))
      return
    }

    const cleanPhone = phone.trim().replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      setFormError(t('workerSignUp.phonePlaceholder', { defaultValue: 'Please enter a valid 10-digit mobile number.' }))
      return
    }

    if (selectedCategoryIds.length === 0) {
      setFormError(t('workerSignUp.categoryPlaceholder', { defaultValue: 'Please select at least one service category.' }))
      return
    }

    if (selectedSubserviceIds.length === 0) {
      setFormError(t('workerSignUp.skillPlaceholder', { defaultValue: 'Please select at least one skill.' }))
      return
    }

    if (!selectedSocietyId) {
      setFormError(t('workerSignUp.societyPlaceholder', { defaultValue: 'Please select your primary cooperative society.' }))
      return
    }

    const cleanUan = uanNumber.trim().replace(/\D/g, '')
    if (cleanUan.length > 0 && cleanUan.length !== 12) {
      setFormError(t('workerSignUp.uanPlaceholder', { defaultValue: 'If provided, e-Shram UAN must be exactly 12 digits.' }))
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Ensure user account is created with WORKER role
      try {
        await authService.signup(cleanPhone, 'WORKER', otp || '123456', name.trim())
      } catch (authErr: any) {
        // If user already exists, login instead
        if (authErr?.response?.status === 409 || authErr?.message?.includes('already exists')) {
          await authService.login(cleanPhone, 'WORKER', otp || '123456', name.trim())
        } else {
          throw authErr
        }
      }

      // 2. Submit worker onboarding with all selected categories and skills
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
        ...(certFileName ? [`CERT_DOC:${certFileName}`] : []),
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

  // Find human-readable translated names
  const selectedSociety = societies.find((s) => s.id === selectedSocietyId)

  return (
    <div className="w-full bg-card sm:border sm:border-border/60 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
      {!isSubmitted ? (
        <>
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {t('workerSignUp.title', { defaultValue: 'Worker Registration' })}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t('workerSignUp.alreadyRegistered', { defaultValue: 'Already registered?' })}{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                {t('workerSignUp.signIn', { defaultValue: 'Sign In' })}
              </Link>
            </p>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Clean Single-Page Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Legal Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-foreground">
                {t('workerSignUp.nameLabel', { defaultValue: 'Full Legal Name' })} *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('workerSignUp.namePlaceholder', {
                  defaultValue: 'e.g. Arun Electrician / Kavitha',
                })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground"
              />
            </div>

            {/* Mobile Phone Number with Mock Verify */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="phone" className="font-semibold text-foreground">
                  {t('workerSignUp.phoneLabel', { defaultValue: 'Mobile Phone Number' })} *
                </label>
                {isPhoneVerified ? (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('workerSignUp.phoneVerified', { defaultValue: 'Phone Verified ✓' })}</span>
                  </span>
                ) : null}
              </div>
              <div className="flex items-center rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all">
                <div className="flex items-center gap-1.5 pl-3.5 pr-2.5 text-muted-foreground select-none shrink-0 border-r border-border/80 py-2.5">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-mono font-bold text-foreground shrink-0">+91</span>
                </div>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    if (isPhoneVerified) setIsPhoneVerified(false)
                  }}
                  placeholder={t('workerSignUp.phonePlaceholder', {
                    defaultValue: 'Enter 10-digit mobile number',
                  })}
                  required
                  className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-foreground text-sm font-mono focus:outline-none placeholder:text-muted-foreground"
                />
                {!isPhoneVerified ? (
                  <button
                    type="button"
                    onClick={handleVerifyPhone}
                    disabled={isVerifyingPhone}
                    className="mr-2 px-2.5 py-1 rounded-lg text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground transition-colors shrink-0 disabled:opacity-50"
                  >
                    {isVerifyingPhone ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      t('workerSignUp.verifyPhone', { defaultValue: 'Verify' })
                    )}
                  </button>
                ) : null}
              </div>
            </div>

            {/* Gender Selection (Slim Segmented Pill Selector) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t('workerSignUp.genderLabel', { defaultValue: 'Gender' })} *
              </label>
              <div className="grid grid-cols-3 gap-1 bg-secondary/70 p-1 rounded-xl border border-border/50 h-9">
                {GENDER_OPTIONS.map((g) => {
                  const isSelected = gender === g
                  const label =
                    g === 'Male'
                      ? t('workerSignUp.genderMale', { defaultValue: 'Male' })
                      : g === 'Female'
                      ? t('workerSignUp.genderFemale', { defaultValue: 'Female' })
                      : t('workerSignUp.genderOther', { defaultValue: 'Other' })
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={cn(
                        'h-7 flex items-center justify-center text-xs font-semibold rounded-lg transition-all select-none',
                        isSelected
                          ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Multi-Service & Skills Selection Architecture with Dropdowns & Removable Chips */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="serviceCategorySelect" className="font-semibold text-foreground flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{t('workerSignUp.categoryLabel', { defaultValue: 'Services & Skills' })} *</span>
                </label>
                {selectedCategoryIds.length > 0 && (
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {selectedCategoryIds.length} {t('workerSignUp.servicesCount', { defaultValue: 'services' })} · {selectedSubserviceIds.length} {t('workerSignUp.skillsCount', { defaultValue: 'skills' })}
                  </span>
                )}
              </div>

              {/* Service Category Dropdown */}
              <select
                id="serviceCategorySelect"
                value=""
                onChange={(e) => {
                  handleAddCategory(e.target.value)
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              >
                <option value="" disabled>
                  {selectedCategoryIds.length === 0
                    ? t('workerSignUp.selectCategoryDropdown', { defaultValue: 'Select a service category (e.g. Electrical, Plumbing)...' })
                    : t('workerSignUp.addCategoryPlaceholder', { defaultValue: '+ Add another service category...' })}
                </option>
                {categories
                  .filter((c) => !selectedCategoryIds.includes(c.id))
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {t(`services.category.${cat.code}`, { defaultValue: cat.name })}
                    </option>
                  ))}
              </select>

              {/* Selected Categories and their respective Skills dropdown + removable pills */}
              {selectedCategoryIds.length > 0 && (
                <div className="space-y-3 pt-1">
                  {selectedCategoryIds.map((catId) => {
                    const cat = categories.find((c) => c.id === catId)
                    if (!cat) return null
                    const catSubs = cat.subservices || []
                    const activeSubs = catSubs.filter((s) => selectedSubserviceIds.includes(s.id))
                    const availableSubs = catSubs.filter((s) => !selectedSubserviceIds.includes(s.id))

                    return (
                      <div
                        key={cat.id}
                        className="p-3.5 rounded-xl border border-border/80 bg-secondary/30 space-y-2.5"
                      >
                        {/* Category Header with Title & Remove Button */}
                        <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-foreground">
                              {t(`services.category.${cat.code}`, { defaultValue: cat.name })}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-background border border-border/60 text-muted-foreground">
                              {activeSubs.length} {t('workerSignUp.skillsCount', { defaultValue: 'skills' })}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(cat.id)}
                            className="text-xs text-destructive hover:text-destructive/80 font-semibold inline-flex items-center gap-1 transition-colors select-none"
                          >
                            <span>✕</span>
                            <span>{t('workerSignUp.removeCategory', { defaultValue: 'Remove service' })}</span>
                          </button>
                        </div>

                        {/* Dropdown for Sub-services / Skills under this category */}
                        {availableSubs.length > 0 ? (
                          <select
                            value=""
                            onChange={(e) => handleAddSkill(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                          >
                            <option value="" disabled>
                              {t('workerSignUp.selectSkillDropdown', {
                                defaultValue: `+ Add a skill under ${cat.name}...`,
                              })}
                            </option>
                            {availableSubs.map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {t(`services.sub.${sub.code}`, { defaultValue: sub.name })}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-[11px] text-muted-foreground italic">
                            {t('workerSignUp.allSkillsAdded', { defaultValue: 'All skills in this category added.' })}
                          </p>
                        )}

                        {/* Selected skills pills with remove button (x) */}
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {activeSubs.length === 0 ? (
                            <p className="text-[11px] text-muted-foreground italic">
                              {t('workerSignUp.noSkillsSelected', {
                                defaultValue: 'No skills selected yet. Pick from the dropdown above.',
                              })}
                            </p>
                          ) : (
                            activeSubs.map((sub) => (
                              <span
                                key={sub.id}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-background border border-border text-foreground shadow-2xs"
                              >
                                <span>{t(`services.sub.${sub.code}`, { defaultValue: sub.name })}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSkill(sub.id)}
                                  className="hover:text-destructive text-muted-foreground hover:text-destructive font-bold p-0.5 transition-colors leading-none text-xs"
                                  title={t('workerSignUp.removeSkill', { defaultValue: 'Remove' })}
                                >
                                  ✕
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Skill Certificate Code & Document */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              {/* Skill India / NCVT Certificate Code */}
              <div className="space-y-1.5">
                <label htmlFor="certVerificationUrl" className="text-xs font-semibold text-foreground">
                  {t('workerSignUp.certUrlLabel', { defaultValue: 'Skill India / NCVT Certificate Code' })}
                </label>
                <input
                  id="certVerificationUrl"
                  type="text"
                  value={certVerificationUrl}
                  onChange={(e) => setCertVerificationUrl(e.target.value)}
                  placeholder={t('workerSignUp.certUrlPlaceholder', {
                    defaultValue: 'e.g. NCVT-10492 or SC-2024-8891',
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground"
                />
                <p className="text-[11px] text-muted-foreground">
                  {t('workerSignUp.certUrlHint', {
                    defaultValue: 'Skill India Digital (SID) or NCVT certificate registration number (if available)',
                  })}
                </p>
              </div>

              {/* Certificate File Upload */}
              <div className="space-y-1.5">
                <label htmlFor="skillCertDoc" className="text-xs font-semibold text-foreground">
                  {t('workerSignUp.skillCertLabel', { defaultValue: 'Certificate*' })}
                </label>
                <div className="flex items-center gap-2.5 min-h-[42px] px-2 rounded-xl border border-input bg-background">
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:opacity-90 text-xs font-semibold transition-opacity shrink-0">
                    <span>{t('workerSignUp.chooseFile', { defaultValue: 'Choose File' })}</span>
                    <input
                      id="skillCertDoc"
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleCertFileAttach}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-muted-foreground truncate font-mono flex-1">
                    {certFileName || t('workerSignUp.noFileChosen', { defaultValue: 'No file chosen' })}
                  </span>
                  {certFileName && (
                    <button
                      type="button"
                      onClick={() => setCertFileName(null)}
                      className="text-xs text-muted-foreground hover:text-destructive font-bold p-1 transition-colors shrink-0"
                      title="Clear file"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Cooperative Society (Clean Dropdown) */}
            <div className="space-y-1.5">
              <label htmlFor="society" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{t('workerSignUp.societyLabel', { defaultValue: 'Primary Cooperative Society' })} *</span>
              </label>
              <select
                id="society"
                value={selectedSocietyId}
                onChange={(e) => setSelectedSocietyId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              >
                <option value="" disabled>
                  {t('workerSignUp.societyPlaceholder', { defaultValue: 'Select cooperative society...' })}
                </option>
                {societies.map((soc) => (
                  <option key={soc.id} value={soc.id}>
                    {soc.name} ({soc.district})
                  </option>
                ))}
              </select>
            </div>

            {/* Society Membership ID & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="membershipId" className="text-xs font-semibold text-foreground">
                  {t('workerSignUp.membershipIdLabel', { defaultValue: 'Society Membership ID' })}
                </label>
                <input
                  id="membershipId"
                  type="text"
                  value={membershipId}
                  onChange={(e) => setMembershipId(e.target.value)}
                  placeholder="e.g. SOC-MEM-1042"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="experience" className="text-xs font-semibold text-foreground">
                  {t('workerSignUp.experienceLabel', { defaultValue: 'Years of Experience' })}
                </label>
                <input
                  id="experience"
                  type="number"
                  min={0}
                  max={40}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  placeholder="4"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* e-Shram UAN with Mock Verify */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="uan" className="font-semibold text-foreground">
                  {t('workerSignUp.uanLabel', { defaultValue: 'e-Shram UAN' })}
                </label>
                {isEshramVerified ? (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('workerSignUp.eshramVerified', { defaultValue: 'e-Shram Verified · Aadhaar Linked ✓' })}</span>
                  </span>
                ) : null}
              </div>
              <div className="flex items-center rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all">
                <input
                  id="uan"
                  type="text"
                  maxLength={12}
                  value={uanNumber}
                  onChange={(e) => {
                    setUanNumber(e.target.value)
                    if (isEshramVerified) setIsEshramVerified(false)
                  }}
                  placeholder={t('workerSignUp.uanPlaceholder', { defaultValue: '12-digit e-Shram UAN' })}
                  className="flex-1 min-w-0 bg-transparent px-3.5 py-2.5 text-foreground text-sm font-mono tracking-wider focus:outline-none placeholder:text-muted-foreground"
                />
                {!isEshramVerified ? (
                  <button
                    type="button"
                    onClick={handleVerifyEshram}
                    disabled={isVerifyingEshram}
                    className="mr-2 px-2.5 py-1 rounded-lg text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground transition-colors shrink-0 disabled:opacity-50"
                  >
                    {isVerifyingEshram ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{t('workerSignUp.verifying', { defaultValue: 'Verifying...' })}</span>
                      </span>
                    ) : (
                      t('workerSignUp.verifyEshram', { defaultValue: 'Verify e-Shram' })
                    )}
                  </button>
                ) : null}
              </div>
            </div>

            {/* e-Shram Card / ID Attachment */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t('workerSignUp.attachmentLabel', { defaultValue: 'e-Shram Card / ID Attachment' })}
              </label>
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-input bg-background text-xs">
                <div className="flex items-center gap-2 text-foreground font-mono truncate">
                  <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="truncate">
                    {attachedFileName || t('workerSignUp.noDocument', { defaultValue: 'No document selected' })}
                  </span>
                </div>
                <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 text-xs font-semibold transition-colors shrink-0">
                  <span>{t('workerSignUp.attachButton', { defaultValue: 'Attach' })}</span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileAttach}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Verification OTP */}
            <div className="space-y-1.5">
              <label htmlFor="otp" className="text-xs font-semibold text-foreground">
                {t('workerSignUp.otpLabel', { defaultValue: 'Verification OTP' })} *
              </label>
              <input
                id="otp"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-semibold"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 flex items-center justify-center gap-2 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xs hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-60 mt-2"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0 text-primary-foreground" />
                  <span>{t('workerSignUp.submitting', { defaultValue: 'Submitting Application...' })}</span>
                </span>
              ) : (
                <>
                  <span>{t('workerSignUp.submitButton', { defaultValue: 'Submit Application for Verification' })}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </>
              )}
            </button>
          </form>
        </>
      ) : (
        /* ============================================================ */
        /* SUBMISSION CONFIRMATION: AWAITING FEDERATION APPROVAL        */
        /* ============================================================ */
        <div className="space-y-6 text-center py-4">
          {/* Professional Status Badge without kiddish icon */}
          <div>
            <span className="inline-block px-3 py-1 rounded-md border border-border bg-muted/80 text-foreground font-mono text-xs font-bold tracking-wider uppercase">
              {t('workerSignUp.submittedStatus', { defaultValue: 'STATUS: AWAITING FEDERATION APPROVAL' })}
            </span>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl font-black text-foreground">
              {t('workerSignUp.submittedTitle', { defaultValue: 'Registration Submitted · Under Review' })}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('workerSignUp.submittedDesc', {
                defaultValue:
                  'Your cooperative worker application has been queued for credential and society verification by the Federation Administrator. Once approved, your account will be activated.',
              })}
            </p>
          </div>

          {/* Application Summary Card */}
          <div className="p-4 sm:p-5 rounded-xl bg-secondary/40 border border-border text-left space-y-3 text-xs max-w-md mx-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="font-bold text-foreground text-sm">{name}</span>
              <span className="font-mono font-bold text-primary">{membershipId}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-muted-foreground block">
                  {t('workerSignUp.summaryPhone', { defaultValue: 'Mobile Phone' })}
                </span>
                <span className="font-mono font-semibold">+91 {phone}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">
                  {t('workerSignUp.summaryGender', { defaultValue: 'Gender' })}
                </span>
                <span className="font-semibold">
                  {gender === 'Male'
                    ? t('workerSignUp.genderMale', { defaultValue: 'Male' })
                    : gender === 'Female'
                    ? t('workerSignUp.genderFemale', { defaultValue: 'Female' })
                    : t('workerSignUp.genderOther', { defaultValue: 'Other' })}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">
                  {t('workerSignUp.summaryUan', { defaultValue: 'e-Shram UAN' })}
                </span>
                <span className="font-mono font-semibold">
                  {uanNumber.trim().length === 12
                    ? `XXXXXXXX${uanNumber.trim().slice(-4)}`
                    : t('workerSignUp.uanNotProvided', { defaultValue: 'Not Provided (Can be linked later)' })}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">
                  {t('workerSignUp.summarySociety', { defaultValue: 'Cooperative Society' })}
                </span>
                <span className="font-semibold truncate block">
                  {selectedSociety?.name || 'Cooperative Society'}
                </span>
              </div>

              {/* Registered Services & Skills (Multiple Supported) */}
              <div className="col-span-2 pt-2 border-t border-border/60 space-y-2">
                <span className="text-muted-foreground block font-bold text-[10px] uppercase tracking-wider">
                  {t('workerSignUp.summaryServicesAndSkills', { defaultValue: 'Registered Services & Skills' })} ({selectedCategoryIds.length})
                </span>
                <div className="space-y-1.5">
                  {selectedCategoryIds.map((catId) => {
                    const cat = categories.find((c) => c.id === catId)
                    if (!cat) return null
                    const subs = (cat.subservices || []).filter((s) => selectedSubserviceIds.includes(s.id))
                    return (
                      <div key={cat.id} className="p-2 rounded-lg bg-background border border-border/70 space-y-1">
                        <span className="font-bold text-foreground text-xs block">
                          {t(`services.category.${cat.code}`, { defaultValue: cat.name })}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {subs.map((sub) => (
                            <span
                              key={sub.id}
                              className="px-2 py-0.5 rounded bg-primary/20 text-foreground font-semibold text-[10px]"
                            >
                              {t(`services.sub.${sub.code}`, { defaultValue: sub.name })}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Skill Certificate Details */}
              <div className="col-span-2 pt-2 border-t border-border/60 space-y-1">
                <span className="text-muted-foreground block font-bold text-[10px] uppercase tracking-wider">
                  {t('workerSignUp.summaryCert', { defaultValue: 'Skill Certificate' })}
                </span>
                {certVerificationUrl || certFileName ? (
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-foreground">
                    {certVerificationUrl && (
                      <span className="px-2 py-0.5 rounded bg-background border border-border font-semibold truncate max-w-xs">
                        🏷️ Code: {certVerificationUrl}
                      </span>
                    )}
                    {certFileName && (
                      <span className="px-2 py-0.5 rounded bg-background border border-border font-semibold truncate max-w-xs">
                        📄 {certFileName}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground italic text-[11px]">
                    {t('workerSignUp.certNotProvided', { defaultValue: 'Not Provided (Can be verified later)' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Button: Return to Sign In */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xs hover:bg-primary/90 transition-all w-full max-w-md mx-auto"
            >
              <span>{t('workerSignUp.returnToSignIn', { defaultValue: 'Return to Sign In' })}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
