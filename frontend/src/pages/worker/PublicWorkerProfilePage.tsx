import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Phone, Calendar, Share2, Check, X } from 'lucide-react'
import { LanguageSelector } from '@/components/shared'
import { getTranslatedPersonName, getTranslatedSocietyName } from '@/lib/serviceTranslation'

interface VerifiedSkill {
  id: string
  category: string
  title: string
  issuer: string
  date: string
  description: string
}

const VERIFIED_SKILLS: VerifiedSkill[] = [
  {
    id: 'skill-1',
    category: 'ELECTRICAL SKILLS',
    title: 'Conduit Wiring & Mains Distribution',
    issuer: 'Coimbatore City Labour & Artisans Cooperative Society',
    date: 'Certified: Sep 14, 2026',
    description: 'Residential wiring, mains distribution boards, and safety circuits.',
  },
  {
    id: 'skill-2',
    category: 'ELECTRICAL SKILLS',
    title: 'Domestic Switchgear & Protection',
    issuer: 'Coimbatore City Labour & Artisans Cooperative Society',
    date: 'Certified: Sep 18, 2026',
    description: 'MCB/RCCB installation, surge protection, and safety testing.',
  },
  {
    id: 'skill-3',
    category: 'ELECTRICAL SKILLS',
    title: 'Inverter & Solar Backup Wiring',
    issuer: 'Coimbatore City Labour & Artisans Cooperative Society',
    date: 'Certified: Sep 22, 2026',
    description: 'Inverter installation, battery connection, and backup wiring.',
  },
]

const RECENT_SERVICE_RECORDS = [
  {
    id: 'rec-1',
    task: 'Main Breaker Trip Diagnostics & Replacement',
    locality: 'Gandhipuram Cross Cut Road',
    date: 'Sep 21, 2026',
    rating: 5.0,
  },
  {
    id: 'rec-2',
    task: '3-Phase Motor Starter Rewiring',
    locality: 'RS Puram West',
    date: 'Sep 19, 2026',
    rating: 4.8,
  },
  {
    id: 'rec-3',
    task: 'Kitchen Appliance Circuit Installation',
    locality: 'Peelamedu Main',
    date: 'Sep 16, 2026',
    rating: 4.9,
  },
]

export function PublicWorkerProfilePage() {
  const { workerId = 'wrk-ramesh-kumar' } = useParams<{ workerId: string }>()
  const { t } = useTranslation()

  const [selectedCert, setSelectedCert] = useState<VerifiedSkill | null>(null)
  const [selectedDetails, setSelectedDetails] = useState<VerifiedSkill | null>(null)
  const [copied, setCopied] = useState(false)

  const workerName = 'Arun'
  const phone = '+91 98765 43211'
  const societyName = 'Coimbatore City Labour & Artisans Cooperative Society'

  const handleShare = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const initials = workerName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
      {/* Top Public Header */}
      <header className="h-14 bg-card border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            to="/customer"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title={t('common.back', 'Back')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black tracking-tight leading-tight truncate text-foreground">
              {t('app.title', 'Cooperative Gig Services Platform')}
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight truncate font-mono">
              Official Cooperative Worker Digital Credential
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSelector />
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6 pb-20">
        {/* 1. Hero Digital Worker Identity Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 sm:p-7 space-y-6">
            {/* Header Row: Avatar, Name, Badges, Status & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                {/* Clean Authentic Monogram Avatar */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 font-black text-2xl sm:text-3xl flex items-center justify-center shrink-0 shadow-xs select-none">
                  {initials}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                      {getTranslatedPersonName(t, workerName)}
                    </h1>
                  </div>

                  <p className="text-sm font-semibold text-foreground/85">
                    Electrician &amp; Wireman
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {getTranslatedSocietyName(t, societyName)}
                  </p>

                  {/* Badges Strip */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                    <span className="px-2.5 py-0.5 rounded-md bg-secondary border border-border text-[11px] font-semibold text-foreground">
                      e-Shram Verified
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                      Cooperative Certified
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Quick Customer Actions */}
              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold text-xs self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Available for Booking
                </span>

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`tel:${phone}`}
                    className="px-3.5 py-2 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span>Call</span>
                  </a>

                  <Link
                    to={`/customer/booking?workerId=${workerId}`}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Service</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Share Profile"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Member Statement */}
            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/70 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Registered member with {getTranslatedSocietyName(t, societyName)} since 2026. Specialises in residential wiring, electrical repairs, and maintenance.
            </div>

            {/* 3-Stat Metric Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/70">
              <div className="p-3 rounded-xl bg-secondary/30 space-y-0.5">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Completed Tasks
                </span>
                <div className="text-xl sm:text-2xl font-black font-mono text-foreground">184</div>
                <span className="text-[11px] text-muted-foreground block">Verified jobs</span>
              </div>

              <div className="p-3 rounded-xl bg-secondary/30 space-y-0.5">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Customer Rating
                </span>
                <div className="text-xl sm:text-2xl font-black font-mono text-foreground">4.8 ★</div>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                  Customer rating
                </span>
              </div>

              <div className="p-3 rounded-xl bg-secondary/30 space-y-0.5">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Member Status
                </span>
                <div className="text-base sm:text-lg font-bold text-foreground truncate mt-0.5">
                  Active &amp; Verified
                </div>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                  e-Shram registered
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Verified Skills & Certifications Section */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between pb-1 border-b border-border/70">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Verified Skills &amp; Certifications
              </h2>
              <p className="text-xs text-muted-foreground">
                Certified by {getTranslatedSocietyName(t, societyName)}
              </p>
            </div>
            <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg border border-border">
              3 Verified Skills
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {VERIFIED_SKILLS.map((skill) => (
              <div
                key={skill.id}
                className="bg-card border border-border rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xs hover:border-primary/50 transition-colors"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                    {skill.category}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug min-h-[44px]">
                    {skill.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {skill.issuer}
                  </p>
                  <div className="text-xs font-semibold text-foreground/80 pt-1">
                    {skill.date}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => setSelectedDetails(skill)}
                    className="py-2 px-2.5 rounded-lg border border-border bg-secondary/60 hover:bg-secondary text-foreground text-xs font-semibold transition-colors cursor-pointer text-center truncate"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCert(skill)}
                    className="py-2 px-2.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold transition-colors cursor-pointer text-center truncate shadow-xs"
                  >
                    View Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Recent Service Records */}
        <section className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border/70">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                Recent Service Records
              </h3>
              <p className="text-xs text-muted-foreground">
                Completed jobs
              </p>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              3 Recent Tasks
            </span>
          </div>

          <div className="divide-y divide-border/60 text-xs sm:text-sm">
            {RECENT_SERVICE_RECORDS.map((rec) => (
              <div
                key={rec.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-foreground block">{rec.task}</span>
                  <span className="text-xs text-muted-foreground block">
                    {rec.locality} · {rec.date}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-foreground text-xs sm:text-sm">{rec.rating} ★</span>
                  <span className="px-2.5 py-1 rounded-md bg-secondary text-muted-foreground font-semibold text-xs">
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Modal: View Certificate (Simple, Realistic, No Bogus Numbers/Scores) */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1 pb-3 border-b border-border">
              <h3 className="text-base font-black tracking-tight text-foreground">
                Skill Certificate
              </h3>
              <p className="text-xs text-muted-foreground">
                {getTranslatedSocietyName(t, societyName)}
              </p>
            </div>

            <div className="bg-secondary/40 p-3.5 rounded-xl border border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Worker:</span>
                <span className="font-semibold text-foreground">{workerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Skill:</span>
                <span className="font-semibold text-foreground text-right">{selectedCert.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verified By:</span>
                <span className="font-semibold text-foreground text-right">{selectedCert.issuer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">Verified Active</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCert(null)}
              className="w-full py-2.5 px-3 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal: View Details (Simple, Clean, No Fake Modules) */}
      {selectedDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setSelectedDetails(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 pb-2 border-b border-border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                {selectedDetails.category}
              </span>
              <h3 className="text-base font-bold text-foreground">
                {selectedDetails.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {selectedDetails.issuer}
              </p>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {selectedDetails.description}
            </p>

            <button
              type="button"
              onClick={() => setSelectedDetails(null)}
              className="w-full py-2.5 px-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
