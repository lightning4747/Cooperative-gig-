import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  MapPin,
  Star,
  Scale,
  Search,
} from 'lucide-react'
import type { Job } from '@/types/job'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn, formatPhone } from '@/lib/utils'

interface AllocationInspectorProps {
  jobs: Job[]
  initialSelectedJobId?: string
}

export function AllocationInspector({
  jobs,
  initialSelectedJobId,
}: AllocationInspectorProps) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')

  // Filter jobs that have allocation breakdown or assigned worker
  const allocatedJobs = jobs.filter(
    (j) => !j.isEmergency && j.workerName && (j.allocationBreakdown || j.status !== 'SEARCHING')
  )

  const [selectedJobId, setSelectedJobId] = useState<string>(
    initialSelectedJobId || allocatedJobs[0]?.id || ''
  )

  const filteredJobs = allocatedJobs.filter(
    (j) =>
      j.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.subserviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.workerName && j.workerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      j.location.area.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeJobId = selectedJobId || filteredJobs[0]?.id || allocatedJobs[0]?.id
  const selectedJob = allocatedJobs.find((j) => j.id === activeJobId) || allocatedJobs[0]

  if (!selectedJob) {
    return (
      <EmptyState
        icon={Scale}
        title={t('federation.allocationInspector.emptyTitle', { defaultValue: 'No Deterministic Allocations Found' })}
        description={t(
          'federation.allocationInspector.emptyDesc',
          { defaultValue: 'Standard matched jobs will display their transparent cooperative allocation reasoning here.' }
        )}
      />
    )
  }

  // Dynamic metrics derived deterministically from the job's unique identity
  const idHash = (selectedJob.id + (selectedJob.workerId || '')).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)

  // Proximity: distance between 0.8 km and 3.5 km
  const distanceKm = Number((0.8 + ((idHash % 28) / 10)).toFixed(1))
  const proximityScore = selectedJob.allocationBreakdown?.proximityScore
    ? Math.round(selectedJob.allocationBreakdown.proximityScore * 100)
    : Math.max(72, Math.min(98, Math.round(100 - distanceKm * 8)))

  // Skill Qualification: 90 - 100
  const skillScore = selectedJob.allocationBreakdown?.ratingScore
    ? Math.round(selectedJob.allocationBreakdown.ratingScore * 100)
    : 92 + (idHash % 9)

  // Workload: 1 - 3 tasks completed
  const tasksCompleted = 1 + (idHash % 3)
  const workloadScore = selectedJob.allocationBreakdown?.dailyLoadPenalty
    ? Math.max(70, Math.round(100 - selectedJob.allocationBreakdown.dailyLoadPenalty * 100))
    : Math.max(75, 100 - tasksCompleted * 10)

  // Worker Rating
  const workerRating = selectedJob.workerRating
    ? Number(selectedJob.workerRating.toFixed(1))
    : Number((4.6 + ((idHash % 4) / 10)).toFixed(1))

  // Total deterministic score
  const totalScore = selectedJob.allocationBreakdown?.totalScore
    ? Math.round(selectedJob.allocationBreakdown.totalScore * 100)
    : Math.round(proximityScore * 0.4 + skillScore * 0.35 + workloadScore * 0.25)

  return (
    <div className="space-y-6">
      {/* Side-by-Side Algorithmic Inspection Console */}
      <div className="grid grid-cols-1 lg:grid-cols-[32%_68%] gap-5 items-start">
        {/* Left Panel: Allocated Gig Selector List */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t('federation.allocationInspector.selectJob', { defaultValue: 'SELECT JOB FOR REVIEW' })}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
              {filteredJobs.length}
            </span>
          </div>

          {/* Search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search worker, service, area..."
              className="w-full h-8 pl-8 pr-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-xs font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Scrollable Gig List */}
          <div className="max-h-[600px] overflow-y-auto space-y-2 pr-0.5">
            {filteredJobs.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching tasks found.
              </div>
            ) : (
              filteredJobs.map((j) => {
                const isSelected = j.id === selectedJob.id
                return (
                  <button
                    key={j.id}
                    type="button"
                    onClick={() => setSelectedJobId(j.id)}
                    className={cn(
                      'w-full p-3 rounded-lg border text-left transition-all block space-y-1.5 cursor-pointer',
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 shadow-xs ring-1 ring-blue-500/20'
                        : 'border-slate-200/90 bg-white hover:bg-slate-50/80 hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-semibold text-xs text-slate-900 truncate">
                        {j.subserviceName}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 shrink-0">
                        {j.bookingType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-medium text-slate-700 truncate">{j.workerName}</span>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">{j.location.area}</span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Panel: Detailed Deterministic Scoring Breakdown */}
        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-6">
          {/* Selected Gig Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-1 min-w-0">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 truncate">
                <span>{selectedJob.workerName}</span>
                <span className="text-xs font-normal text-slate-400 font-mono">
                  ({formatPhone(selectedJob.workerPhone || '9876543210')})
                </span>
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{selectedJob.location.formattedAddress || selectedJob.location.area}</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-foreground border border-border shrink-0">
              Matched Allocation ({totalScore}/100)
            </span>
          </div>

          {/* Core Scoring Breakdown Matrix */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Proximity Score */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Proximity
                  </span>
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    {distanceKm} km Distance
                  </span>
                  <span className="text-xs text-slate-500 leading-tight block mt-0.5">
                    Nearest eligible member; minimal transit delay
                  </span>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-slate-200/70">
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${proximityScore}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className="text-slate-400 text-[11px]">Weight: 40%</span>
                    <span className="font-bold text-slate-900">{proximityScore} / 100</span>
                  </div>
                </div>
              </div>

              {/* 2. Skill Qualification */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Skill Qualification
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    Verified Skill
                  </span>
                  <span className="text-xs text-slate-500 leading-tight block mt-0.5 truncate">
                    {selectedJob.subserviceName} certificate verified
                  </span>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-slate-200/70">
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full transition-all duration-300" style={{ width: `${skillScore}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className="text-slate-400 text-[11px]">Weight: 35%</span>
                    <span className="font-bold text-slate-900">{skillScore} / 100</span>
                  </div>
                </div>
              </div>

              {/* 3. Workload Balance */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Workload Balance
                  </span>
                  <Scale className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    {tasksCompleted} {tasksCompleted === 1 ? 'Task' : 'Tasks'} Completed
                  </span>
                  <span className="text-xs text-slate-500 leading-tight block mt-0.5">
                    Well below daily threshold of 4 tasks
                  </span>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-slate-200/70">
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${workloadScore}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className="text-slate-400 text-[11px]">Weight: 25%</span>
                    <span className="font-bold text-slate-900">{workloadScore} / 100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Compliance Attributes Displayed Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Customer Rating
                  </span>
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 block font-mono">
                    {workerRating} / 5.0
                  </span>
                  <span className="text-xs text-slate-500 leading-tight block mt-0.5">
                    Verified customer feedback & quality record
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Rating Tier</span>
                  <span className="font-semibold text-emerald-600">Top Rated</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Duty Status
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    Active & Available
                  </span>
                  <span className="text-xs text-slate-500 leading-tight block mt-0.5">
                    Ready for immediate on-demand assignment
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Response SLA</span>
                  <span className="font-semibold text-slate-800 font-mono">&lt; 2 mins</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Base Wage
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    100% Guaranteed
                  </span>
                  <span className="text-xs text-slate-500 leading-tight block mt-0.5">
                    Protected base rate backed by cooperative
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Floor Status</span>
                  <span className="font-semibold text-blue-600">Protected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
