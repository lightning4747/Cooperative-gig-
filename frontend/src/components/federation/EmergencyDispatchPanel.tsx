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
import { formatDate, formatPhone } from '@/lib/utils'
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
      setSuccessMessage(`Emergency job successfully dispatched!`)
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
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <div className="p-3.5 bg-muted/30 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-500 shrink-0" />
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  {t('federation.emergencyDispatch.deskTitle', { count: emergencies.length, defaultValue: `Emergency Dispatch Desk (${emergencies.length})` })}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {t('federation.emergencyDispatch.deskSubtitle', { defaultValue: 'Distress requests requiring apex cooperative phone or radio dispatch' })}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                  <th className="px-4 py-2.5">{t('federation.emergencyDispatch.colCategoryDistress', { defaultValue: 'Category & Service' })}</th>
                  <th className="px-4 py-2.5">{t('federation.emergencyDispatch.colLocation', { defaultValue: 'Location' })}</th>
                  <th className="px-4 py-2.5">{t('federation.emergencyDispatch.colLoggedTime', { defaultValue: 'Logged Time' })}</th>
                  <th className="px-4 py-2.5">{t('federation.emergencyDispatch.colBroadcastStatus', { defaultValue: 'Status' })}</th>
                  <th className="px-4 py-2.5 text-right">{t('federation.emergencyDispatch.colApexOverride', { defaultValue: 'Action' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {emergencies.map((job) => (
                  <tr key={job.id} className="hover:bg-muted/30 transition-colors">

                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <span className="font-medium text-foreground block">
                          {job.subserviceName}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                          {job.serviceCategoryName}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="text-muted-foreground flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="truncate">{job.location.formattedAddress}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-muted-foreground font-mono text-[11px]">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span>{formatDate(job.createdAt)}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[11px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400" />
                        {t('federation.emergencyDispatch.broadcastPending', { defaultValue: 'BROADCAST PENDING' })}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDispatch(job)}
                        className="h-7 px-2.5 rounded-md border border-border bg-background hover:bg-muted text-foreground text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span>{t('federation.emergencyDispatch.manualDispatch', { defaultValue: 'Dispatch' })}</span>
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in"
          onClick={() => !isSubmitting && setSelectedJob(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-lg border border-border bg-card p-5 shadow-lg space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
              <div className="space-y-0.5">
                <span className="font-medium text-rose-600 dark:text-rose-400 text-[10px] uppercase tracking-wider block">
                  {t('federation.emergencyDispatch.modalBadge', { defaultValue: 'Emergency Override' })}
                </span>
                <h3 className="text-sm font-semibold text-foreground">
                  {t('federation.emergencyDispatch.modalTitle', {
                    id: selectedJob.subserviceName || selectedJob.id.slice(0, 8).toUpperCase(),
                    defaultValue: `Dispatch Member: ${selectedJob.subserviceName}`,
                  })}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                disabled={isSubmitting}
                className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {successMessage ? (
              <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-medium text-xs text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleRecordDispatch} className="space-y-3.5 text-xs">
                {/* Job Summary Banner */}
                <div className="p-3 rounded-md bg-muted/40 border border-border space-y-1">
                  <div className="font-semibold text-foreground">
                    {selectedJob.subserviceName} ({selectedJob.serviceCategoryName})
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1 font-mono text-[11px]">
                    <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span>{selectedJob.location.formattedAddress}</span>
                  </div>
                </div>

                {/* Worker Selector */}
                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground block uppercase tracking-wider text-[10px]">
                    {t('federation.emergencyDispatch.selectWorker', { defaultValue: 'Select Available Certified Worker' })}
                  </label>
                  <select
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-md border border-border bg-background text-xs font-normal text-foreground focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                    required
                  >
                    {availableWorkers.length > 0 ? (
                      availableWorkers.map((w) => (
                        <option key={w.userId} value={w.userId}>
                          {w.name} ({formatPhone(w.phone)}) - {w.societyName}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="bb97f076-d171-48df-9982-68bc3e9cfee5">
                          Arun Electrician (+91 98765 43211) - Coimbatore City Labour & Artisans Cooperative Society
                        </option>
                        <option value="a1111111-1111-1111-1111-111111111112">
                          Karthik Plumber (+91 98765 43212) - RS Puram Cooperative Workers Union
                        </option>
                        <option value="a1111111-1111-1111-1111-111111111113">
                          Selvam Carpenter (+91 98765 43213) - Peelamedu Cooperative Services Guild
                        </option>
                      </>
                    )}
                  </select>
                </div>

                {/* Dispatch Method */}
                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground block uppercase tracking-wider text-[10px]">
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
                          className={`h-8 px-2 rounded-md border flex items-center justify-center gap-1.5 transition-colors text-xs ${
                            isSelected
                              ? 'border-zinc-900 dark:border-zinc-100 bg-muted font-medium text-foreground'
                              : 'border-border bg-background text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-[11px]">{m.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Dispatch Notes */}
                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground block uppercase tracking-wider text-[10px]">
                    {t('federation.emergencyDispatch.notesLabel', { defaultValue: 'Intervention Notes / Log Entry' })}
                  </label>
                  <textarea
                    rows={2}
                    value={dispatchNotes}
                    onChange={(e) => setDispatchNotes(e.target.value)}
                    placeholder={t('federation.emergencyDispatch.notesPlaceholder', { defaultValue: 'E.g. Called worker directly via mobile; confirmed rapid departure...' })}
                    className="w-full p-2 rounded-md border border-border bg-background text-xs font-normal text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                    required
                  />
                </div>

                {/* Submit button */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedJob(null)}
                    disabled={isSubmitting}
                    className="h-8 px-3 rounded-md border border-border text-foreground font-medium hover:bg-muted text-xs transition-colors"
                  >
                    {t('federation.emergencyDispatch.cancel', { defaultValue: 'Cancel' })}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-8 px-3 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        <span>{t('federation.emergencyDispatch.confirmLock', { defaultValue: 'Confirm Dispatch' })}</span>
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
