import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, MapPin, Clock, Briefcase, AlertTriangle, CheckCircle2, List, Map } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { MapView } from '@/components/shared/MapView'
import { useJobs, useWorkerOffers } from '@/hooks/useJob'
import { useAuth } from '@/hooks/useAuth'
import { JobOfferCard } from '@/components/worker'
import { WorkerScheduleCalendar } from '@/components/worker/WorkerScheduleCalendar'
import { jobService } from '@/services/jobService'
import type { Job } from '@/types/job'
import {
  getTranslatedCategoryName,
  getTranslatedSubserviceName,
  getTranslatedBookingType,
} from '@/lib/serviceTranslation'
import { cn } from '@/lib/utils'

export function WorkerJobsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const workerId = user?.id || 'wrk-ramesh-kumar'
  const [searchParams, setSearchParams] = useSearchParams()
  const viewMode = searchParams.get('tab') === 'schedule' ? 'schedule' : 'jobs'

  const setViewMode = (mode: 'jobs' | 'schedule') => {
    if (mode === 'jobs') {
      setSearchParams({})
    } else {
      setSearchParams({ tab: 'schedule' })
    }
  }

  const [activeFilter, setActiveFilter] = useState<'all' | 'offers' | 'active' | 'completed'>('all')
  const [displayMode, setDisplayMode] = useState<'list' | 'map'>('list')

  const { data: jobs = [], isLoading, refetch: refetchJobs } = useJobs({ workerId })
  const { data: offers = [], refetch: refetchOffers } = useWorkerOffers(workerId)

  const handleAcceptOffer = async (job: Job) => {
    await jobService.updateStatus(job.id, 'ACCEPTED', workerId)
    await refetchOffers()
    await refetchJobs()
  }

  const handleDeclineOffer = async (job: Job) => {
    if (job.status !== 'BROADCAST') {
      await jobService.updateStatus(job.id, 'CANCELLED')
    }
    await refetchOffers()
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  const activeJobs = jobs.filter(
    (j) =>
      j.status === 'ACCEPTED' ||
      j.status === 'TRAVELLING' ||
      j.status === 'ARRIVED' ||
      j.status === 'IN_PROGRESS'
  )

  const completedJobs = jobs.filter((j) => j.status === 'COMPLETED')

  const displayedJobs =
    activeFilter === 'offers'
      ? []
      : activeFilter === 'active'
      ? activeJobs
      : activeFilter === 'completed'
      ? completedJobs
      : jobs

  const jobMarkers = displayedJobs.map((j, idx) => ({
    id: j.id,
    latitude: j.location?.latitude || 11.0183 + idx * 0.012,
    longitude: j.location?.longitude || 76.9644 + (idx % 2 === 0 ? 0.008 : -0.008),
    stopNumber: idx + 1,
    title: getTranslatedSubserviceName(t, j.subserviceId, j.subserviceName),
    subtitle: `${j.location?.area || j.location?.formattedAddress || 'Coimbatore'} · ₹${j.basePrice}`,
    actionUrl: `/worker/jobs/${j.id}`,
    actionLabel: j.status === 'COMPLETED' ? 'View Details →' : 'Open Job →',
  }))

  const mapCenterLat = jobMarkers[0]?.latitude || 11.0183
  const mapCenterLng = jobMarkers[0]?.longitude || 76.9644

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            {viewMode === 'schedule' ? 'Working Hours & Schedule' : t('worker.jobs.title', 'Assigned Jobs & Offers')}
          </h1>
          <p className="text-xs text-slate-600">
            {viewMode === 'schedule'
              ? 'Mark your working shifts and days off'
              : 'Real-time job dispatches and upcoming service calls'}
          </p>
        </div>

        {/* 2-Button Toggle: Jobs / Schedule */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('jobs')}
            className={cn(
              'py-1.5 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              viewMode === 'jobs'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Jobs ({jobs.length})
          </button>
          <button
            type="button"
            onClick={() => setViewMode('schedule')}
            className={cn(
              'py-1.5 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              viewMode === 'schedule'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Schedule
          </button>
        </div>
      </div>

      {viewMode === 'schedule' ? (
        <div className="space-y-4">
          <WorkerScheduleCalendar />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Sub Filter Tabs & List/Map View Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold overflow-x-auto w-fit">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={cn(
                  'min-h-[36px] px-3.5 py-1 rounded-lg transition-all cursor-pointer',
                  activeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {t('worker.jobs.tabAll', 'All')} ({jobs.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('offers')}
                className={cn(
                  'min-h-[36px] px-3.5 py-1 rounded-lg transition-all cursor-pointer',
                  activeFilter === 'offers'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <span>{t('worker.jobs.tabOffers', 'Offers')} ({offers.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('active')}
                className={cn(
                  'min-h-[36px] px-3.5 py-1 rounded-lg transition-all cursor-pointer',
                  activeFilter === 'active'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {t('worker.jobs.tabActive', 'Active')} ({activeJobs.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('completed')}
                className={cn(
                  'min-h-[36px] px-3.5 py-1 rounded-lg transition-all cursor-pointer',
                  activeFilter === 'completed'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {t('worker.jobs.tabCompleted', 'Completed')} ({completedJobs.length})
              </button>
            </div>

            {/* List vs City Map View Switcher */}
            {activeFilter !== 'offers' && (
              <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDisplayMode('list')}
                  className={cn(
                    'py-1 px-3 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer min-h-[34px]',
                    displayMode === 'list'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode('map')}
                  className={cn(
                    'py-1 px-3 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer min-h-[34px]',
                    displayMode === 'map'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <Map className="w-3.5 h-3.5 text-amber-600" />
                  <span>City Map</span>
                </button>
              </div>
            )}
          </div>

          {/* Offers Tab Content */}
          {(activeFilter === 'offers' || (activeFilter === 'all' && offers.length > 0)) && (
            <div className="space-y-3">
              {offers.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    {t('worker.jobs.pendingOffers', { count: offers.length, defaultValue: 'Pending Offers ({{count}})' })}
                  </span>
                </div>
              )}

              {offers.map((offer) => (
                <JobOfferCard
                  key={offer.id}
                  job={offer}
                  onAccept={handleAcceptOffer}
                  onDecline={handleDeclineOffer}
                />
              ))}
            </div>
          )}

          {/* CITY MAP VIEW */}
          {activeFilter !== 'offers' && displayMode === 'map' && (
            <div className="space-y-4">
              {displayedJobs.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title={t('worker.jobs.emptyTitle', 'No jobs in this view')}
                  description={t('worker.jobs.emptyDesc', 'New jobs will appear here in real time.')}
                />
              ) : (
                <div className="space-y-4">
                  {/* Interactive Multi-Job Map */}
                  <div className="h-80 sm:h-96 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs relative">
                    <MapView
                      latitude={mapCenterLat}
                      longitude={mapCenterLng}
                      zoom={12}
                      showCenterMarker={false}
                      showCoordinatesBanner={false}
                      autoFitBounds={jobMarkers.length > 1}
                      markers={jobMarkers}
                      className="h-full"
                    />
                    <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/95 border border-slate-200 shadow-sm text-xs font-bold text-slate-900 pointer-events-none">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>{jobMarkers.length} Scheduled Jobs in Coimbatore</span>
                    </div>
                  </div>

                  {/* Numbered Stops Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {displayedJobs.map((j, idx) => (
                      <Link
                        key={j.id}
                        to={`/worker/jobs/${j.id}`}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs space-y-2 group cursor-pointer block"
                      >
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <StatusBadge status={j.status} />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-amber-700 truncate">
                            {getTranslatedSubserviceName(t, j.subserviceId, j.subserviceName)}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">
                            {j.location?.formattedAddress || 'Coimbatore'}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                          <span className="font-mono font-bold text-slate-900">₹{j.basePrice}</span>
                          <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1 group-hover:underline">
                            Open Job <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Regular Jobs List */}
          {activeFilter !== 'offers' && displayMode === 'list' && (
            <div>
              {displayedJobs.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title={t('worker.jobs.emptyTitle', 'No jobs in this view')}
                  description={t('worker.jobs.emptyDesc', 'New jobs will appear here in real time.')}
                />
              ) : (
                <div className="space-y-3">
                  {displayedJobs.map((j) => (
                    <Link
                      key={j.id}
                      to={`/worker/jobs/${j.id}`}
                      className="block p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs space-y-3 group cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-700">
                            {getTranslatedCategoryName(t, j.serviceCategoryId, j.serviceCategoryName)}
                          </span>
                          {j.isEmergency && (
                            <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-wider border border-red-200">
                              {getTranslatedBookingType(t, 'EMERGENCY')}
                            </span>
                          )}
                        </div>
                        <StatusBadge status={j.status} />
                      </div>

                      <div className="space-y-1">
                        <span className="text-sm sm:text-base font-bold text-slate-900 block group-hover:text-amber-700 transition-colors">
                          {getTranslatedSubserviceName(t, j.subserviceId, j.subserviceName)}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{j.location.formattedAddress}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between pt-2.5 border-t border-slate-100 gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1 text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {t('common.baseWage', 'Base Pay')}:{' '}
                              <strong className="font-mono text-slate-900 font-bold">
                                ₹{j.basePrice}
                              </strong>
                            </span>
                          </span>

                          {/* Amount Customer Paid */}
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <span>{t('worker.jobs.customerPaid', 'Customer Paid')}:</span>
                            {j.isPaid || j.paidAmount || j.status === 'COMPLETED' ? (
                              <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                ₹{j.paidAmount || j.grossAmount || j.basePrice}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Pending (₹{j.grossAmount || j.basePrice})
                              </span>
                            )}
                          </span>
                        </div>

                        {j.status !== 'COMPLETED' && j.status !== 'CANCELLED' && j.status !== 'EXPIRED' ? (
                          <span className="font-bold text-slate-900 group-hover:text-amber-700 flex items-center gap-1 ml-auto">
                            {t('worker.jobs.executeTask', 'Open Job')} <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-500 flex items-center gap-1 ml-auto group-hover:text-slate-900 transition-colors">
                            {t('common.viewDetails', 'View Job')} <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
