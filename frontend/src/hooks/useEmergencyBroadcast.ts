import { useState, useEffect, useCallback, useRef } from 'react'
import { useJob } from './useJob'

export function useEmergencyBroadcast(jobId?: string, timeoutSeconds: number = 60) {
  const { job, updateStatus } = useJob(jobId)
  const [prevJobId, setPrevJobId] = useState(jobId)
  const [secondsRemaining, setSecondsRemaining] = useState(timeoutSeconds)
  const [isTimedOut, setIsTimedOut] = useState(false)
  const hasTimedOutRef = useRef(false)

  if (prevJobId !== jobId) {
    setPrevJobId(jobId)
    setSecondsRemaining(timeoutSeconds)
    setIsTimedOut(false)
  }

  useEffect(() => {
    if (!job || !job.isEmergency || job.status !== 'BROADCAST') {
      return
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          if (!hasTimedOutRef.current) {
            hasTimedOutRef.current = true
            setIsTimedOut(true)
            updateStatus({ status: 'SEARCHING' }).catch(console.error)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [job, updateStatus])

  const retryBroadcast = useCallback(async () => {
    hasTimedOutRef.current = false
    setSecondsRemaining(timeoutSeconds)
    setIsTimedOut(false)
    if (jobId) {
      await updateStatus({ status: 'BROADCAST' })
    }
  }, [jobId, timeoutSeconds, updateStatus])

  const isAccepted =
    job?.status === 'ACCEPTED' ||
    job?.status === 'TRAVELLING' ||
    job?.status === 'IN_PROGRESS'

  return {
    secondsRemaining,
    isTimedOut,
    isAccepted,
    retryBroadcast,
  }
}
