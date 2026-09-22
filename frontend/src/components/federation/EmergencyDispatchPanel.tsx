import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  Phone,
  Radio,
  MapPin,
  Clock,
  Send,
  UserCheck,
  CheckCircle2,
  X,
} from 'lucide-react'
import type { Job } from '@/types/job'
import type { WorkerProfile } from '@/types/worker'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils'
import { federationService } from '@/services/federationService'

interface EmergencyDispatchPanelProps {
  emergencies: Job[]
  availableWorkers?: WorkerProfile[]
  onDispatched?: () => void
}

export function EmergencyDispatchPanel({
  emergencies,
  availableWorkers = [],
  onDispatched,
}: EmergencyDispatchPanelProps) {
  const { t } = useTranslation()
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('')
  const [dispatchMethod, setDispatchMethod] = useState<'PHONE' | 'RADIO' | 'IN_PERSON'>('PHONE')
  const [dispatchNotes, setDispatchNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleOpenDispatch = (job: Job) => {
    setSelectedJob(job)
    setSelectedWorkerId(availableWorkers[0]?.userId || '')
    setDispatchNotes('')
    setSuccessMessage(null)
  }

  const handleRecordDispatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedJob) return

    setIsSubmitting(true)
    try {
      const notes = `[Apex ${dispatchMethod}] ${dispatchNotes || 'Manual emergency dispatch assigned via cooperative hotline.'}`
      await federationService.recordManualDispatch(
        selectedJob.id,
        selectedWorkerId || 'wrk-ramesh-kumar',
        notes
      )
      setSuccessMessage(`Emergency job ${selectedJob.id} successfully dispatched!`)
      setTimeout(() => {
        setSelectedJob(null)
        setSuccessMessage(null)
        onDispatched?.()
      }, 1200)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {emergencies.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={t('federation.emergencyDispatch.emptyTitle', { defaultValue: 'All Emergencies Fulfilled' })}
          description={t(
            'federation.emergencyDispatch.emptyDesc',
            { defaultValue: 'No urgent safety or infrastructure distress requests currently awaiting manual apex intervention.' }
          )}
        />
      ) : (
        <div className="rounded-2xl border border-destructive/30 bg-card shadow-xs overflow-hidden">
          <div className="p-4 bg-destructive/10 border-b border-destructive/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5 animate-pulse shrink-0" />
              <div>
                <h3 className="text-sm font-black tracking-tight">
                  {t('federation.emergencyDispatch.deskTitle', { count: emergencies.length, defaultValue: `High-Priority Emergency Distress Desk (${emergencies.length})` })}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {t('federation.emergencyDispatch.deskSubtitle', { defaultValue: 'Unfulfilled emergency broadcasts requiring apex cooperative phone or radio dispatch' })}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-secondary/30 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">{t('federation.emergencyDispatch.colRef', { defaultValue: 'Emergency Ref' })}</th>
                  <th className="p-4">{t('federation.emergencyDispatch.colCategoryDistress', { defaultValue: 'Category & Distress' })}</th>
                  <th className="p-4">{t('federation.emergencyDispatch.colLocation', { defaultValue: 'Location' })}</th>
                  <th className="p-4">{t('federation.emergencyDispatch.colLoggedTime', { defaultValue: 'Logged Time' })}</th>
                  <th className="p-4">{t('federation.emergencyDispatch.colBroadcastStatus', { defaultValue: 'Broadcast Status' })}</th>
                  <th className="p-4 text-right">{t('federation.emergencyDispatch.colApexOverride', { defaultValue: 'Apex Override' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {emergencies.map((job) => (
                  <tr key={job.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-foreground">
                        {job.id}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-foreground block">
                          {job.subserviceName}
                        </span>
                        <span className="text-[10px] text-destructive font-black uppercase tracking-wider">
                          {job.serviceCategoryName}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 max-w-[200px]">
                      <div className="text-muted-foreground flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                        <span className="truncate">{job.location.formattedAddress}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1 text-muted-foreground font-mono">
                        <Clock className="w-3 h-3 text-destructive" />
                        <span>{formatDate(job.createdAt)}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-destructive/15 text-destructive font-bold text-[10px] border border-destructive/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-ping" />
                        {t('federation.emergencyDispatch.broadcastPending', { defaultValue: 'BROADCAST PENDING' })}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDispatch(job)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold text-xs shadow-xs min-h-[36px] transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{t('federation.emergencyDispatch.manualDispatch', { defaultValue: 'Manual Dispatch' })}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Dispatch Modal */}
      {selectedJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in"
          onClick={() => !isSubmitting && setSelectedJob(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border border-destructive/30 bg-card p-6 shadow-xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="font-bold text-destructive text-xs uppercase tracking-wider">
                    {t('federation.emergencyDispatch.modalBadge', { defaultValue: 'Apex Emergency Override' })}
                  </span>
                </div>
                <h3 className="text-base font-black text-foreground">
                  {t('federation.emergencyDispatch.modalTitle', { id: selectedJob.id, defaultValue: `Dispatch Member to ${selectedJob.id}` })}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {successMessage ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-sm text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{successMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleRecordDispatch} className="space-y-4 text-xs">
                {/* Job Summary Banner */}
                <div className="p-3 rounded-xl bg-secondary/50 border border-border/80 space-y-1">
                  <div className="font-bold text-foreground">
                    {selectedJob.subserviceName} ({selectedJob.serviceCategoryName})
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                    <span>{selectedJob.location.formattedAddress}</span>
                  </div>
                </div>

                {/* Worker Selector */}
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground block uppercase tracking-wider text-[10px]">
                    {t('federation.emergencyDispatch.selectWorker', { defaultValue: 'Select Available Certified Worker' })}
                  </label>
                  <select
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  >
                    {availableWorkers.length > 0 ? (
                      availableWorkers.map((w) => (
                        <option key={w.userId} value={w.userId}>
                          {w.name} (+91 {w.phone}) - {w.societyName}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="wrk-ramesh-kumar">
                          Ramesh Kumar (+91 9876543210) - Bengaluru South Society
                        </option>
                        <option value="wrk-suresh-gowda">
                          Suresh Gowda (+91 9876543211) - Bengaluru South Society
                        </option>
                        <option value="wrk-anand-verma">
                          Anand Verma (+91 9876543212) - Indiranagar Society
                        </option>
                      </>
                    )}
                  </select>
                </div>

                {/* Dispatch Method */}
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground block uppercase tracking-wider text-[10px]">
                    {t('federation.emergencyDispatch.channelLabel', { defaultValue: 'Dispatch Communication Channel' })}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'PHONE', label: t('federation.emergencyDispatch.phoneCall', { defaultValue: 'Phone Call' }), icon: Phone },
                      { id: 'RADIO', label: t('federation.emergencyDispatch.vhfRadio', { defaultValue: 'VHF Radio' }), icon: Radio },
                      { id: 'IN_PERSON', label: t('federation.emergencyDispatch.inPerson', { defaultValue: 'In-Person Desk' }), icon: UserCheck },
                    ].map((m) => {
                      const Icon = m.icon
                      const isSelected = dispatchMethod === m.id
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setDispatchMethod(m.id as any)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 min-h-[44px] transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-primary font-bold'
                              : 'border-border bg-background text-muted-foreground hover:border-border/80'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[10px]">{m.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Dispatch Notes */}
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground block uppercase tracking-wider text-[10px]">
                    {t('federation.emergencyDispatch.notesLabel', { defaultValue: 'Intervention Notes / Log Entry' })}
                  </label>
                  <textarea
                    rows={3}
                    value={dispatchNotes}
                    onChange={(e) => setDispatchNotes(e.target.value)}
                    placeholder={t('federation.emergencyDispatch.notesPlaceholder', { defaultValue: 'E.g. Called worker directly via mobile; confirmed rapid departure with plumbing toolkit...' })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                {/* Submit button */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedJob(null)}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl border border-border text-foreground font-semibold hover:bg-muted min-h-[44px]"
                  >
                    {t('federation.emergencyDispatch.cancel', { defaultValue: 'Cancel' })}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold shadow-xs min-h-[44px] flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{t('federation.emergencyDispatch.confirmLock', { defaultValue: 'Confirm & Lock Dispatch' })}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
