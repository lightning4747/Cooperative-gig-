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
import { cn } from '@/lib/utils'

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

  return (
    <div className="space-y-6">
      {/* Header Info Banner: Crisp institutional card */}


      {/* Side-by-Side Algorithmic Inspection Console */}
      <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-6 items-start">
        {/* Left Panel (35% width): Allocated Gig Selector List */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">
              {t('federation.allocationInspector.selectJob', { defaultValue: 'Dispatched Gig Selector' })}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-secondary text-secondary-foreground border border-border">
              {filteredJobs.length} Gigs
            </span>
          </div>

          {/* Search input with institutional focus ring */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search gig ID, worker, trade..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-input text-xs font-medium bg-background min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Scrollable Gig List */}
          <div className="max-h-[640px] overflow-y-auto space-y-2 pr-1">
            {filteredJobs.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No matching gigs found.
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
                      'w-full p-3.5 rounded-xl border text-left transition-all min-h-[52px] block space-y-1',
                      isSelected
                        ? 'border-l-4 border-l-blue-600 bg-blue-50/50 dark:bg-blue-950/20 border-border shadow-xs'
                        : 'border-border bg-background hover:bg-muted/40'
                    )}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono font-bold text-xs text-foreground">
                        {j.id}
                      </span>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-secondary text-secondary-foreground border border-border/80">
                        {j.bookingType}
                      </span>
                    </div>
                    <div className="font-bold text-foreground text-xs truncate">
                      {j.subserviceName}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="truncate">Worker: {j.workerName}</span>
                      <span className="font-mono text-[10px] shrink-0">{j.location.area}</span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Panel (65% width): Detailed Deterministic Scoring Breakdown */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-6">
          {/* Selected Gig Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
            <div className="space-y-1 min-w-0">
              <h2 className="text-xl font-black text-foreground flex items-center gap-2 truncate">
                <span>Worker: {selectedJob.workerName}</span>
                <span className="text-xs font-normal text-muted-foreground font-mono">
                  (+91 {selectedJob.workerPhone || '9876543210'})
                </span>
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{selectedJob.location.formattedAddress || selectedJob.location.area}</span>
              </div>
            </div>

          </div>

          {/* Core Scoring Breakdown Matrix - Side by Side High Density */}
          <div className="space-y-3">

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* 1. Proximity Score */}
              <div className="p-4 rounded-xl border border-border/80 bg-secondary/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">
                    Proximity Score
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50 flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <span className="text-base font-black text-foreground block">
                    1.2 km Distance
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Nearest eligible member; zero deadhead surcharge
                  </span>
                </div>
                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-muted-foreground">Weight: 40%</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">Score: 94 / 100</span>
                </div>
              </div>

              {/* 2. Trade Qualification */}
              <div className="p-4 rounded-xl border border-border/80 bg-secondary/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">
                    Trade Skill Vetting
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <span className="text-base font-black text-foreground block">
                    Verified Trade Skill
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {selectedJob.subserviceName} certificate verified
                  </span>
                </div>
                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-muted-foreground">Weight: 35%</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Score: 100 / 100</span>
                </div>
              </div>

              {/* 3. Load Leveling Index */}
              <div className="p-4 rounded-xl border border-border/80 bg-secondary/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">
                    Load Leveling Index
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 flex items-center justify-center">
                    <Scale className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <span className="text-base font-black text-foreground block">
                    1 Task Completed
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Well below daily fatigue threshold of 4 tasks
                  </span>
                </div>
                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-muted-foreground">Weight: 25%</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">Score: 90 / 100</span>
                </div>
              </div>
            </div>

            {/* Secondary Compliance Attributes Displayed Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="p-3 rounded-xl bg-secondary/40 border border-border/70 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block">Customer Rating</span>
                  <span className="text-[11px] text-muted-foreground">4.8 / 5.0 (Consistently Verified)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-secondary/40 border border-border/70 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block">Duty Status</span>
                  <span className="text-[11px] text-muted-foreground">Active & Available On-Grid</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-secondary/40 border border-border/70 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block">Statutory Floor</span>
                  <span className="text-[11px] text-muted-foreground">100% Floor Wage Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
