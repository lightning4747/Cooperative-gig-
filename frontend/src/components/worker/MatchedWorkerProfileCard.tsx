import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTranslatedPersonName, getTranslatedSocietyName } from '@/lib/serviceTranslation'

export interface MatchedWorkerProfileCardProps {
  workerId?: string
  name?: string
  phone?: string
  photoUrl?: string
  societyName?: string
  societyRegistration?: string
  membershipId?: string
  rating?: number
  totalJobs?: number
  otpCompliance?: number
  eShramUan?: string
  skillCertification?: string
  skillLevel?: string
  baseRateFloor?: number
  welfarePercent?: number
  workerSharePercent?: number
  platformPercent?: number
  isPublicView?: boolean
  showContactAction?: boolean
  className?: string
}

export function MatchedWorkerProfileCard({
  workerId = 'bb97f076-d171-48df-9982-68bc3e9cfee5',
  name = 'Arun',
  phone = '+91 98765 43211',
  photoUrl: _photoUrl,
  societyName = 'Coimbatore City Labour & Artisans Cooperative Society',
  societyRegistration: _societyRegistration = 'TN-CBE-2023-011',
  membershipId: _membershipId = 'MEM-CBE-001',
  rating = 4.9,
  totalJobs = 48,
  otpCompliance: _otpCompliance,
  eShramUan: _eShramUan = 'XXXXXXXX9011',
  skillCertification = 'Skill India Certified · Senior Electrician',
  skillLevel = 'Grade A Certified',
  workerSharePercent: _workerSharePercent = 90,
  welfarePercent: _welfarePercent = 5,
  platformPercent: _platformPercent = 5,
  isPublicView = false,
  showContactAction = true,
  className,
}: MatchedWorkerProfileCardProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const publicUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/workers/${workerId}`
      : `/workers/${workerId}`

  const handleShare = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4',
        className
      )}
    >
      {/* Header: Authentic Initials Avatar, Name, Society & Phone Action */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/70">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-secondary border border-border text-foreground flex items-center justify-center font-bold text-base shrink-0 select-none">
            {initials}
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-foreground truncate">
                {getTranslatedPersonName(t, name)}
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                {t('worker.card.verifiedMember', 'Verified Member')}
              </span>
            </div>

            <p className="text-xs text-muted-foreground truncate">
              {getTranslatedSocietyName(t, societyName)}
            </p>
          </div>
        </div>

        {/* Quick Call Action (if customer view with phone) */}
        {showContactAction && phone && (
          <a
            href={`tel:${phone}`}
            className="p-2.5 rounded-xl border border-border hover:bg-muted text-foreground transition-colors shrink-0"
            title={t('job.callWorker', 'Call Worker')}
          >
            <Phone className="w-4 h-4 text-primary" />
          </a>
        )}
      </div>

      {/* Performance Summary Line */}
      <div className="flex items-center gap-2.5 text-xs text-muted-foreground flex-wrap">
        <span className="font-bold text-foreground">{rating} ★</span>
        <span>·</span>
        <span>
          {totalJobs} {t('worker.card.completedJobs', 'completed tasks')}
        </span>
      </div>

      {/* Verified Qualifications */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
          {t('worker.card.govVerification', 'Verified Skills & Credentials')}
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-secondary/40 border border-border/60 space-y-0.5">
            <div className="font-bold text-foreground">
              {t('worker.card.eShramVerified', 'e-Shram Verified')}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t('worker.card.eShramDesc', 'National unorganized worker registry checked')}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-secondary/40 border border-border/60 space-y-0.5">
            <div className="font-bold text-foreground">
              {t('worker.card.skillIndiaCertified', 'Skill Certified')}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {skillCertification}
            </p>
            <div className="text-[10px] text-muted-foreground font-semibold">
              {skillLevel}
            </div>
          </div>
        </div>
      </div>

      {/* Actions: View Public Profile & Share Button */}
      {!isPublicView && (
        <div className="pt-2 flex items-center justify-between text-xs border-t border-border/60">
          <Link
            to={`/workers/${workerId}`}
            className="font-bold text-primary hover:underline"
          >
            {t('worker.card.viewDigitalPassport', 'View Public Profile →')}
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground text-xs font-semibold transition-colors cursor-pointer"
          >
            {copied ? t('common.copied', 'Link Copied!') : t('worker.card.shareProfile', 'Share Profile')}
          </button>
        </div>
      )}
    </div>
  )
}
