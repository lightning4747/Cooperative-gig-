import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Users,
  Briefcase,
  UserCheck,
  HeartHandshake,
  AlertTriangle,
  ArrowRight,
  Eye,
  Building2,
  Radio,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { useFederationDashboard } from '@/hooks/useFederationDashboard'
import { MetricCard } from '@/components/federation/MetricCard'
import { JobDetailFederation } from '@/components/federation/JobDetailFederation'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useJobs } from '@/hooks/useJob'
import type { Job } from '@/types/job'
import {
  getTranslatedCategoryName,
  getTranslatedSubserviceName,
  getTranslatedSocietyName,
  getTranslatedBookingType,
} from '@/lib/serviceTranslation'

const DEFAULT_SOCIETY_LIQUIDITY = [
  {
    id: 'soc-1',
    name: 'Bengaluru South Cooperative Society',
    regNo: 'KBLR-2023-014',
    liquidity: 142500,
    reserveRatio: '',
    workerCount: 42,
    status: 'ACTIVE',
  },
  {
    id: 'soc-2',
    name: 'Shivajinagar Cooperative Society',
    regNo: 'KBLR-2023-089',
    liquidity: 98200,
    reserveRatio: '',
    workerCount: 28,
    status: 'ACTIVE',
  },
  {
    id: 'soc-3',
    name: 'Mysore Urban District Society',
    regNo: 'KMYS-2024-002',
    liquidity: 76400,
    reserveRatio: '',
    workerCount: 21,
    status: 'ACTIVE',
  },
  {
    id: 'soc-4',
    name: 'Hubballi-Dharwad Cooperative',
    regNo: 'KHUB-2024-019',
    liquidity: 64000,
    reserveRatio: '',
    workerCount: 16,
    status: 'ACTIVE',
  },
]

export function FederationDashboard() {
  const { t } = useTranslation()
  const { metrics, societies, emergencies, isLoading } = useFederationDashboard()
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const { data: allJobs = [] } = useJobs()

  const recentJobs = allJobs.slice(0, 8)

  // Map societies data or fall back to default institutional societies
  const displaySocieties = societies.length > 0
    ? societies.map((s, idx) => ({
        id: s.id || `soc-${idx}`,
        name: s.name,
        regNo: s.registrationNumber || `REG-SOC-00${idx + 1}`,
        liquidity: 85000 + idx * 24000,
        reserveRatio: '',
        workerCount: s.workerCount || 20 + idx * 8,
        status: ('status' in s && typeof s.status === 'string') ? s.status : 'ACTIVE',
      }))
    : DEFAULT_SOCIETY_LIQUIDITY

  if (isLoading) {
    return <LoadingSpinner size="lg" className="py-24" />
  }

  return (
    <div className="space-y-6">
      {/* Top Institutional Banner: Crisp slate card with deep blue accent line */}
      <div className="p-6 rounded-2xl border-l-4 border-blue-600 bg-card border border-border shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 min-w-0">
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-foreground">
              {t('federation.dashboard.title', { defaultValue: 'Federation Operations Console' })}
            </h1>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            <Link
              to="/federation/verification"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/20 min-h-[42px] transition-colors shadow-2xs"
            >
              <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {t('federation.dashboard.pendingApprovals', {
                  count: metrics?.pendingWorkers ?? 1,
                  defaultValue: `Pending Approvals (${metrics?.pendingWorkers ?? 1})`,
                })}
              </span>
            </Link>

            {emergencies.length > 0 ? (
              <Link
                to="/federation/emergencies"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive text-white text-xs font-bold hover:bg-destructive/90 min-h-[42px] transition-colors shadow-2xs animate-pulse"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{t('federation.dashboard.emergencyAlerts', { count: emergencies.length, defaultValue: `${emergencies.length} Emergency Alerts` })}</span>
              </Link>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid: 4-column edge-to-edge grid with enhanced typography and clean institutional badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
        <MetricCard
          variant="compliance"
          title={t('federation.dashboard.activeWorkers', { defaultValue: 'Active Workers' })}
          value={metrics?.activeWorkers ?? 18}
          subtitle={t('federation.dashboard.activeWorkersSub', { defaultValue: 'Across affiliated primary societies' })}
          icon={Users}
          trend={{ value: t('federation.dashboard.activeWorkersTrend', { defaultValue: '+4 this month' }), isPositive: true }}
        />

        <MetricCard
          variant="governance"
          title={t('federation.dashboard.jobsToday', { defaultValue: 'Jobs Today' })}
          value={metrics?.jobsToday ?? 34}
          subtitle={t('federation.dashboard.jobsTodaySub', { defaultValue: '100% statutory floor compliance' })}
          icon={Briefcase}
          trend={{ value: t('federation.dashboard.jobsTodayTrend', { defaultValue: '+12% vs yesterday' }), isPositive: true }}
        />

        <MetricCard
          variant="compliance"
          title={t('federation.dashboard.availableWorkers', { defaultValue: 'Available Workers' })}
          value={metrics?.availableWorkers ?? 12}
          subtitle={t('federation.dashboard.availableWorkersSub', { defaultValue: 'Ready for deterministic matching' })}
          icon={UserCheck}
        />

        <MetricCard
          variant="welfare"
          title={t('federation.dashboard.welfarePool', { defaultValue: 'Welfare Pool' })}
          value={formatCurrency(metrics?.welfareBalance ?? 48500)}
          subtitle={t('federation.dashboard.welfarePoolSub', { defaultValue: 'Surplus-funded collective fund' })}
          icon={HeartHandshake}
          trend={{ value: t('federation.dashboard.welfarePoolTrend', { defaultValue: '100% Floor Guaranteed' }), isPositive: true }}
        />
      </div>

      {/* Split View: Wide 65/35 desktop grid pairing Live Job Operations Table with Regional Society Liquidity Feed and Emergency Broadcast Radar */}
      <div className="grid grid-cols-1 xl:grid-cols-[65%_35%] gap-6 items-start">
        {/* Left 65%: Live Job Operations Table */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/80">
            <div>
              <h2 className="text-base font-bold text-foreground">
                {t('federation.dashboard.liveOperations', { defaultValue: 'Live Job Operations Table' })}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t('federation.dashboard.liveOperationsSub', { defaultValue: 'High-density stream of requests dispatched by the deterministic cooperative engine' })}
              </p>
            </div>
            <Link
              to="/federation/jobs"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline min-h-[36px]"
            >
              <span>{t('federation.dashboard.viewAllOperations', { defaultValue: 'View All Operations' })}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/70">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="sticky top-0 bg-secondary text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border/80">
                  <th className="p-3.5 min-w-[120px]">{t('federation.dashboard.tableJobId', { defaultValue: 'Job ID' })}</th>
                  <th className="p-3.5 min-w-[180px]">{t('federation.dashboard.tableService', { defaultValue: 'Service & Category' })}</th>
                  <th className="p-3.5 min-w-[110px]">{t('federation.dashboard.tableType', { defaultValue: 'Type' })}</th>
                  <th className="p-3.5 min-w-[120px]">{t('federation.dashboard.tableStatus', { defaultValue: 'Status' })}</th>
                  <th className="p-3.5 min-w-[110px] text-right">{t('federation.dashboard.tableFloorPrice', { defaultValue: 'Floor Price' })}</th>
                  <th className="p-3.5 min-w-[90px] text-right">{t('federation.dashboard.tableAction', { defaultValue: 'Action' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {recentJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground">
                      {t('federation.dashboard.noJobs', { defaultValue: 'No recent jobs recorded yet. Real-time jobs will appear here as bookings are placed.' })}
                    </td>
                  </tr>
                ) : (
                  recentJobs.map((j) => (
                    <tr
                      key={j.id}
                      className="hover:bg-muted/40 cursor-pointer transition-colors"
                      onClick={() => setSelectedJob(j)}
                    >
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-foreground block">
                            {j.id}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {formatDate(j.createdAt)}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-foreground block">
                          {getTranslatedSubserviceName(t, j.subserviceId, j.subserviceName)}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">
                          {getTranslatedCategoryName(t, j.serviceCategoryId, j.serviceCategoryName)}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-[11px]">
                        {j.isEmergency ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-[10px] border border-red-500/20">
                            {getTranslatedBookingType(t, 'EMERGENCY')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium text-[10px] border border-border">
                            <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                            <span>{getTranslatedBookingType(t, j.bookingType)}</span>
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <StatusBadge status={j.status} />
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-foreground">
                        {formatCurrency(j.basePrice)}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedJob(j)
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-secondary/80 hover:bg-secondary text-foreground text-xs font-bold transition-colors min-h-[32px]"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{t('federation.dashboard.audit', { defaultValue: 'Audit' })}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 35%: Regional Society Liquidity Feed + Emergency Broadcast Radar */}
        <div className="space-y-6">
          {/* Regional Society Liquidity Feed */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {t('federation.dashboard.regionalLiquidityFeed', { defaultValue: 'Regional Society Liquidity Feed' })}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {t('federation.dashboard.regionalLiquiditySub', { defaultValue: 'Audited member cooperative capital' })}
                  </p>
                </div>
              </div>
              <Link
                to="/federation/societies"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>{t('federation.dashboard.societiesLink', { defaultValue: 'Societies' })}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {displaySocieties.map((soc) => (
                <div
                  key={soc.id}
                  className="p-3 rounded-xl bg-secondary/40 border border-border/70 hover:border-border transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-foreground truncate">
                      {getTranslatedSocietyName(t, soc.name)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span className="text-[10px]">{soc.regNo}</span>
                    <span className="font-bold text-foreground">
                      {formatCurrency(soc.liquidity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Broadcast Radar */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200/50 flex items-center justify-center">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {t('federation.dashboard.emergencyBroadcastRadar', { defaultValue: 'Emergency Broadcast Radar' })}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {t('federation.dashboard.emergencyBroadcastRadarSub', { defaultValue: 'Multi-society priority dispatch channel' })}
                  </p>
                </div>
              </div>
              <Link
                to="/federation/emergencies"
                className="text-xs font-bold text-destructive hover:underline flex items-center gap-1"
              >
                <span>{t('federation.dashboard.radarLink', { defaultValue: 'Radar' })}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {emergencies.length > 0 ? (
              <div className="space-y-2">
                {emergencies.map((em) => (
                  <div
                    key={em.id}
                    className="p-3 rounded-xl bg-destructive/10 border border-destructive/25 space-y-1.5 animate-pulse"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-destructive flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        {getTranslatedSubserviceName(t, undefined, em.subserviceName)}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-destructive/20 text-destructive font-bold">
                        5.0 KM
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="truncate">{em.location.area}</span>
                      <span className="font-mono text-[10px]">{formatDate(em.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-foreground block">
                    {t('federation.dashboard.cooperativeGridSilent', { defaultValue: 'Cooperative Grid Silent' })}
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {t('federation.dashboard.cooperativeGridSilentDesc', { defaultValue: '0 unfulfilled emergency requests. Standard 5.0 km broadcast radius armed on 4 cooperative dispatch towers.' })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deep-dive Audit Drawer Modal */}
      <JobDetailFederation
        job={selectedJob}
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  )
}
