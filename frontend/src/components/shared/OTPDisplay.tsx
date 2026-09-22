import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OTPDisplayProps {
  otp: string
  title?: string
  instructions?: string
  className?: string
}

export function OTPDisplay({
  otp,
  title,
  instructions,
  className,
}: OTPDisplayProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const digits = otp.split('')

  const displayTitle = title || t('job.doorstepOtp', { defaultValue: 'Doorstep Verification OTP' })
  const displayInstructions =
    instructions || t('job.doorstepOtpDesc', { defaultValue: 'Share this OTP code with the worker upon arrival.' })

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(otp)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  return (
    <div className={cn('p-5 rounded-xl border border-primary/30 bg-primary/5 text-center space-y-3', className)}>
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{displayTitle}</h4>

      <div className="flex items-center justify-center gap-2">
        {digits.map((digit, idx) => (
          <div
            key={idx}
            className="w-10 h-12 sm:w-12 sm:h-14 rounded-xl border-2 border-primary/40 bg-card text-foreground font-mono text-2xl sm:text-3xl font-black flex items-center justify-center shadow-xs"
          >
            {digit}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
        {displayInstructions}
      </p>

      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{copied ? t('common.copied', { defaultValue: 'Copied' }) : t('common.copyCode', { defaultValue: 'Copy Code' })}</span>
      </button>
    </div>
  )
}
