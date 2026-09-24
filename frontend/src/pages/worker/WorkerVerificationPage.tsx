import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Clock, CheckCircle2, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useWorkerProfile } from '@/hooks/useWorkerProfile'
import { getTranslatedPersonName, getTranslatedSocietyName } from '@/lib/serviceTranslation'

export function WorkerVerificationPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { profile } = useWorkerProfile(user?.id)

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-xs text-center space-y-4 max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
          <Clock className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
            {t('worker.verification.badge', 'Verification In Progress')}
          </span>
          <h1 className="text-xl font-black tracking-tight text-foreground pt-2">
            {t('worker.verification.title', 'Checking Your Details')}
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {t(
              'worker.verification.description',
              'Your application and details have been sent to the cooperative office for checking.'
            )}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-secondary/60 border border-border/80 text-left text-xs space-y-2 max-w-md mx-auto">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('worker.verification.workerName', 'Worker Name')}:</span>
            <span className="font-bold text-foreground">
              {getTranslatedPersonName(t, user?.name || 'Arun')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('worker.verification.society', 'Society')}:</span>
            <span className="font-medium text-foreground">
              {getTranslatedSocietyName(t, profile?.societyName || 'Coimbatore City Labour & Artisans Cooperative Society')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('worker.verification.membershipRef', 'Member ID')}:</span>
            <span className="font-mono font-bold text-foreground">
              {profile?.membershipId || 'MEM-CBE-001'}
            </span>
          </div>
          <div className="flex justify-between border-t border-border/60 pt-2">
            <span className="text-muted-foreground">e-Shram Status:</span>
            <span className="font-mono text-emerald-600 font-bold">Linked</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span>{t('worker.verification.timeline', 'Verification usually takes 1-2 hours')}</span>
        </div>

        <div className="pt-2">
          <Link
            to="/worker"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary/90 min-h-[44px] transition-all"
          >
            <span>{t('worker.verification.returnHome', 'Go to Worker Home')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
