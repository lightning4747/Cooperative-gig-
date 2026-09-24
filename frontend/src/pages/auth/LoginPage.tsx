import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Phone,
  ArrowRight,
  AlertCircle,
  Loader2,
  KeyRound,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types/user'
import { loginSchema, type LoginFormData } from '@/lib/schemas'
import { cn } from '@/lib/utils'

interface RoleOption {
  role: UserRole
  titleKey: string
  defaultTitle: string
}

const ROLES: RoleOption[] = [
  {
    role: 'CUSTOMER',
    titleKey: 'auth.customer',
    defaultTitle: 'Customer',
  },
  {
    role: 'WORKER',
    titleKey: 'auth.worker',
    defaultTitle: 'Worker',
  },
  {
    role: 'FEDERATION_ADMIN',
    titleKey: 'auth.federationAdmin',
    defaultTitle: 'Admin',
  },
]

const DEMO_ACCOUNTS: Record<UserRole, { phone: string; name: string }> = {
  CUSTOMER: { phone: '9000000001', name: 'Meena' },
  WORKER: { phone: '9000000011', name: 'Arun' },
  FEDERATION_ADMIN: { phone: '9000000000', name: 'Federation Administrator' },
}

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading } = useAuth()

  const [selectedRole, setSelectedRole] = useState<UserRole>('CUSTOMER')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'CUSTOMER',
      phone: DEMO_ACCOUNTS.CUSTOMER.phone,
      otp: '123456',
    },
  })

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role)
    setValue('role', role, { shouldValidate: true })
    setValue('phone', DEMO_ACCOUNTS[role].phone, { shouldValidate: true })
    setValue('otp', '123456', { shouldValidate: true })
    setSubmitError(null)
  }

  const parseAuthError = (err: any): string => {
    const status = err?.response?.status
    const code = err?.response?.data?.code
    const detail = err?.response?.data?.detail || err?.response?.data?.message || err?.message || ''

    if (status === 404 || code === 'USER_NOT_FOUND' || detail.toLowerCase().includes('user not found')) {
      return 'User not found. Please verify the mobile number.'
    }
    if (code === 'ROLE_MISMATCH' || detail.toLowerCase().includes('different role')) {
      return 'This mobile number is registered under a different role.'
    }
    if (code === 'INVALID_OTP' || detail.toLowerCase().includes('otp') || detail.toLowerCase().includes('code')) {
      return 'Invalid verification code. Please check and retry.'
    }
    return detail || 'Sign-in failed. Please verify credentials and retry.'
  }

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null)
    try {
      const user = await login(data.phone, data.role, data.otp || '123456')

      const roleHome =
        user.role === 'CUSTOMER'
          ? '/customer'
          : user.role === 'WORKER'
          ? '/worker'
          : '/federation'

      const fromPath = (location.state as { from?: { pathname: string } })?.from?.pathname
      const targetPath =
        fromPath &&
        ((user.role === 'CUSTOMER' && fromPath.startsWith('/customer')) ||
          (user.role === 'WORKER' && fromPath.startsWith('/worker')) ||
          (user.role === 'FEDERATION_ADMIN' && fromPath.startsWith('/federation')))
          ? fromPath
          : roleHome

      navigate(targetPath, { replace: true })
    } catch (err: unknown) {
      setSubmitError(parseAuthError(err))
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-5 max-w-full">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
          {t('auth.signIn', { defaultValue: 'Sign In' })}
        </h1>
        <p className="text-xs text-muted-foreground">
          {t('auth.signInSubtitle', { defaultValue: 'Enter your details below to sign in' })}
        </p>
      </div>

      {/* Slim Segmented Role Bar (Matches Student | Faculty from Reference Image) */}
      <div className="grid grid-cols-3 gap-1 bg-secondary/70 p-1 rounded-xl border border-border/50">
        {ROLES.map((item) => {
          const isSelected = selectedRole === item.role
          return (
            <button
              key={item.role}
              type="button"
              onClick={() => handleSelectRole(item.role)}
              className={cn(
                'h-9 flex items-center justify-center px-2 text-[11px] sm:text-xs font-semibold rounded-lg transition-all select-none',
                isSelected
                  ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t(item.titleKey, { defaultValue: item.defaultTitle })}
            </button>
          )
        })}
      </div>

      {/* Error Banner */}
      {submitError && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Clean Single-Screen Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Mobile Input */}
        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-xs font-semibold text-foreground">
            {t('auth.phoneLabel', { defaultValue: 'Mobile Number' })}
          </label>
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
              {...register('phone')}
              placeholder={t('auth.phonePlaceholder', {
                defaultValue: 'Enter 10-digit mobile number',
              })}
              className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-foreground text-sm font-mono focus:outline-none placeholder:text-muted-foreground"
            />
          </div>
          {errors.phone && (
            <p className="text-[11px] text-destructive font-medium mt-0.5">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Verification OTP */}
        <div className="space-y-1.5">
          <label htmlFor="otp" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{t('auth.otpLabel', { defaultValue: 'Verification OTP' })}</span>
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            {...register('otp')}
            placeholder="123456"
            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-semibold placeholder:text-muted-foreground/50"
          />
          {errors.otp && (
            <p className="text-[11px] text-destructive font-medium mt-0.5">
              {errors.otp.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 flex items-center justify-center gap-2 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xs hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-60"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin shrink-0 text-primary-foreground" />
              <span>Signing In...</span>
            </span>
          ) : (
            <>
              <span>{t('auth.signIn', { defaultValue: 'Sign In' })}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </>
          )}
        </button>
      </form>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
        <div>
          {selectedRole === 'WORKER' && (
            <Link
              to="/register/worker"
              className="text-foreground font-semibold hover:underline inline-flex items-center gap-1 transition-colors"
            >
              <span>Worker Sign Up</span>
            </Link>
          )}
        </div>
        <Link
          to="/language"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium transition-colors ml-auto"
        >
          <span>Change language</span>
        </Link>
      </div>
    </div>
  )
}
