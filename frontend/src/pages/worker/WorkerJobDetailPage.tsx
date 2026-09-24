import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useJob } from '@/hooks/useJob'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { JobDetailWorker } from '@/components/worker'

export function WorkerJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const targetId = jobId || ''
  const { job, isLoading, refetch } = useJob(targetId)

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!job) {
    return (
      <EmptyState
        title="Job Not Found"
        description={`The requested task #${targetId} could not be retrieved from the cooperative database.`}
        action={
          <Link
            to="/worker/jobs"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
          >
            Back to Jobs
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/worker/jobs"
          className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black tracking-tight text-foreground">
            Cooperative Job Execution
          </h1>

        </div>
      </div>

      <JobDetailWorker job={job} onStatusUpdated={() => refetch()} />
    </div>
  )
}
