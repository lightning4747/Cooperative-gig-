import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import {
  StatusBadge,
  ServiceCategoryCard,
  JobProgressBar,
  PriceBreakdownCard,
  MapView,
  LanguageSelector,
  OTPDisplay,
  OTPInput,
  StarRating,
  InvoiceCard,
} from '@/components/shared'
import { useServiceCatalog } from '@/hooks/useServiceCatalog'
import type { JobStatus } from '@/types/job'

const sampleInvoice = {
  id: 'sample-inv-1',
  invoiceNumber: 'INV-2026-0001',
  jobId: 'sample-job-1',
  paymentId: 'sample-pay-1',
  serviceCategory: 'Plumbing',
  subservice: 'Tap & Valve Repair',
  customerName: 'Ravi Kumar',
  workerName: 'Arun',
  societyName: 'Coimbatore City Labour & Artisans Cooperative Society',
  societyRegistrationNumber: 'TN-CBE-2023-011',
  workerEShramRef: 'XXXXXXXX9011',
  servicePrice: 500,
  basePrice: 500,
  surplus: 0,
  welfareContribution: 0,
  workerEarning: 500,
  paymentStatus: 'PAID' as const,
  issuedAt: new Date().toISOString(),
}

export function ShowcasePage() {
  const { t } = useTranslation()
  const { categories } = useServiceCatalog()
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || 'plumbing')
  const [jobStatus, setJobStatus] = useState<JobStatus>('TRAVELLING')
  const [otpValue, setOtpValue] = useState('482910')
  const [starRating, setStarRating] = useState(5)

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* Platform Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-sm shadow-xs">
                CS
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight leading-tight">{t('app.title')}</h1>
                <p className="text-[10px] text-muted-foreground leading-none">{t('app.subtitle')}</p>
              </div>
            </div>
          </div>
          <LanguageSelector />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Banner */}
        <section className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                {t('app.showcaseTitle', { defaultValue: 'Live Platform Showcase' })}
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">{t('app.tagline')}</h2>
              <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                {t('app.showcaseDesc', { defaultValue: 'Demonstrating interactive shared components adhering to the national cooperative design system, guaranteed wage floors, and bilingual contracts.' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status="ACTIVE" />
              <StatusBadge status="AVAILABLE" />
            </div>
          </div>
        </section>

        {/* Section 1: Service Catalog Selection */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {t('services.sectionTitle', { defaultValue: 'Household & Community Service Categories' })}
            </h3>
            <span className="text-xs text-muted-foreground">
              {categories.length} {t('common.categoriesCount', { defaultValue: 'Categories' })}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <ServiceCategoryCard
                key={cat.id}
                category={cat}
                isSelected={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
              />
            ))}
          </div>
        </section>

        {/* Section 2: Job Lifecycle Tracker & Emergency Broadcast */}
        <section className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div>
              <h3 className="text-base font-bold text-foreground">
                {t('job.lifecycleTitle', { defaultValue: 'Job Lifecycle Stepper' })}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t('job.lifecycleSubtitle', { defaultValue: 'Interactive status switcher to preview all lifecycle states' })}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['SEARCHING', 'ACCEPTED', 'TRAVELLING', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'] as JobStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setJobStatus(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    jobStatus === st
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t(`job.status.${st.toLowerCase()}`, { defaultValue: st })}
                </button>
              ))}
            </div>
          </div>

          <JobProgressBar status={jobStatus} isEmergency={false} />
        </section>

        {/* Section 3: Financial Transparency & GIS Map */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {t('payment.title', { defaultValue: 'Structural Wage Floor & Welfare' })}
            </h3>
            <PriceBreakdownCard
              customerPrice={800}
              basePrice={600}
              welfareRate={0.5}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {t('gis.title', { defaultValue: 'Cooperative Geo-Location Service (GIS)' })}
            </h3>
            <MapView
              latitude={11.0183}
              longitude={76.9644}
              label="Gandhipuram, Coimbatore"
              markers={[
                { id: '1', latitude: 11.0195, longitude: 76.9655, title: 'Arun (0.4 km)', isWorker: true },
                { id: '2', latitude: 11.0160, longitude: 76.9620, title: 'Karthik Plumber (0.7 km)', isWorker: true },
              ]}
            />
          </div>
        </section>

        {/* Section 4: Doorstep Mutual OTP & Rating */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {t('job.doorstepOtp', { defaultValue: 'Doorstep Mutual Verification (Customer View)' })}
            </h3>
            <OTPDisplay otp={otpValue} />
          </div>

          <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">
                {t('job.workerOtpTitle', { defaultValue: 'Worker OTP Entry & Rating' })}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t('job.workerOtpSubtitle', { defaultValue: 'Enter code provided at doorstep' })}
              </p>
            </div>

            <OTPInput value={otpValue} onChange={setOtpValue} />

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                {t('job.customerRating', { defaultValue: 'Customer Service Rating' })}
              </span>
              <StarRating value={starRating} onChange={setStarRating} />
            </div>
          </div>
        </section>

        {/* Section 5: Official Digital Invoice */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {t('payment.invoiceTitle', { defaultValue: 'Cooperative Digital Receipt & Invoice' })}
          </h3>
          <InvoiceCard invoice={sampleInvoice} />
        </section>
      </main>
    </div>
  )
}
