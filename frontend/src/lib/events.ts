const JOB_UPDATE_EVENT = 'coop-job-updated'

export function dispatchJobUpdate(jobId?: string): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent(JOB_UPDATE_EVENT, {
      detail: { jobId, timestamp: Date.now() },
    })
  )
}

export function subscribeToJobUpdates(callback: (jobId?: string) => void): () => void {
  if (typeof window === 'undefined') return () => {}

  const handleCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent
    callback(customEvent.detail?.jobId)
  }

  window.addEventListener(JOB_UPDATE_EVENT, handleCustomEvent)

  return () => {
    window.removeEventListener(JOB_UPDATE_EVENT, handleCustomEvent)
  }
}
