export interface StatusStyleConfig {
  labelKey: string
  bgClass: string
  dotClass: string
  textClass: string
}

export interface StatusHeadline {
  titleKey: string
  defaultTitle: string
  descKey: string
  defaultDesc: string
}

export const JOB_STATUS_CONFIG: Record<string, StatusStyleConfig> = {
  SEARCHING: {
    labelKey: 'job.status.searching',
    bgClass: 'bg-amber-50',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-700',
  },
  OFFERED: {
    labelKey: 'job.status.offered',
    bgClass: 'bg-blue-50',
    dotClass: 'bg-blue-500',
    textClass: 'text-blue-700',
  },
  BROADCAST: {
    labelKey: 'job.status.broadcast',
    bgClass: 'bg-red-50',
    dotClass: 'bg-red-500',
    textClass: 'text-red-700',
  },
  ACCEPTED: {
    labelKey: 'job.status.accepted',
    bgClass: 'bg-indigo-50',
    dotClass: 'bg-indigo-500',
    textClass: 'text-indigo-700',
  },
  TRAVELLING: {
    labelKey: 'job.status.travelling',
    bgClass: 'bg-amber-50',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-700',
  },
  ARRIVED: {
    labelKey: 'job.status.arrived',
    bgClass: 'bg-purple-50',
    dotClass: 'bg-purple-500',
    textClass: 'text-purple-700',
  },
  IN_PROGRESS: {
    labelKey: 'job.status.in_progress',
    bgClass: 'bg-amber-50',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-700',
  },
  COMPLETED: {
    labelKey: 'job.status.completed',
    bgClass: 'bg-green-50',
    dotClass: 'bg-green-500',
    textClass: 'text-green-700',
  },
  CANCELLED: {
    labelKey: 'job.status.cancelled',
    bgClass: 'bg-slate-100',
    dotClass: 'bg-slate-400',
    textClass: 'text-slate-600',
  },
  EXPIRED: {
    labelKey: 'job.status.expired',
    bgClass: 'bg-slate-100',
    dotClass: 'bg-slate-400',
    textClass: 'text-slate-600',
  },
  // Worker statuses
  ACTIVE: {
    labelKey: 'worker.status.active',
    bgClass: 'bg-green-50',
    dotClass: 'bg-green-500',
    textClass: 'text-green-700',
  },
  PENDING_VERIFICATION: {
    labelKey: 'worker.status.pending_verification',
    bgClass: 'bg-blue-50',
    dotClass: 'bg-blue-500',
    textClass: 'text-blue-700',
  },
  SUSPENDED: {
    labelKey: 'worker.status.suspended',
    bgClass: 'bg-red-50',
    dotClass: 'bg-red-500',
    textClass: 'text-red-700',
  },
  AVAILABLE: {
    labelKey: 'worker.availability.available',
    bgClass: 'bg-green-50',
    dotClass: 'bg-green-500',
    textClass: 'text-green-700',
  },
  OFFLINE: {
    labelKey: 'worker.availability.offline',
    bgClass: 'bg-slate-100',
    dotClass: 'bg-slate-400',
    textClass: 'text-slate-600',
  },
  BUSY: {
    labelKey: 'worker.availability.busy',
    bgClass: 'bg-amber-50',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-700',
  },
}

export const JOB_STATUS_HEADLINES: Record<string, StatusHeadline> = {
  SEARCHING: {
    titleKey: 'job.statusSearchingTitle',
    defaultTitle: 'Locating Cooperative Partner',
    descKey: 'job.statusSearchingDesc',
    defaultDesc: 'Matching with the nearest available verified member in your district.',
  },
  BROADCAST: {
    titleKey: 'job.statusBroadcastTitle',
    defaultTitle: 'Emergency Broadcast Active',
    descKey: 'job.statusBroadcastDesc',
    defaultDesc: 'Broadcasting priority dispatch to all nearby qualified cooperative workers.',
  },
  OFFERED: {
    titleKey: 'job.statusOfferedTitle',
    defaultTitle: 'Worker Notified',
    descKey: 'job.statusOfferedDesc',
    defaultDesc: 'Awaiting member confirmation for immediate deployment.',
  },
  ACCEPTED: {
    titleKey: 'job.statusAcceptedTitle',
    defaultTitle: 'Worker Confirmed',
    descKey: 'job.statusAcceptedDesc',
    defaultDesc: 'Your cooperative service worker has accepted the gig and is preparing.',
  },
  TRAVELLING: {
    titleKey: 'job.statusTravellingTitle',
    defaultTitle: 'Worker in Transit',
    descKey: 'job.statusTravellingDesc',
    defaultDesc: 'Your service worker is travelling to your doorstep.',
  },
  ARRIVED: {
    titleKey: 'job.statusArrivedTitle',
    defaultTitle: 'Worker Has Arrived',
    descKey: 'job.statusArrivedDesc',
    defaultDesc: 'Worker is at your doorstep. Please share the 6-digit mutual OTP below to begin work.',
  },
  IN_PROGRESS: {
    titleKey: 'job.statusInProgressTitle',
    defaultTitle: 'Service In Progress',
    descKey: 'job.statusInProgressDesc',
    defaultDesc: 'Cooperative service delivery is currently underway.',
  },
  COMPLETED: {
    titleKey: 'job.statusCompletedTitle',
    defaultTitle: 'Work Completed',
    descKey: 'job.statusCompletedDesc',
    defaultDesc: 'Service completed satisfactorily. Please proceed to payment and settlement.',
  },
  CANCELLED: {
    titleKey: 'job.statusCancelledTitle',
    defaultTitle: 'Job Cancelled',
    descKey: 'job.statusCancelledDesc',
    defaultDesc: 'This gig request was cancelled.',
  },
  EXPIRED: {
    titleKey: 'job.statusExpiredTitle',
    defaultTitle: 'No Cooperative Worker Available',
    descKey: 'job.statusExpiredDesc',
    defaultDesc: 'All verified cooperative members in this skill category are currently engaged or outside the dispatch radius.',
  },
}

export function getStatusHeadlineConfig(status: string): StatusHeadline {
  return (
    JOB_STATUS_HEADLINES[status] || {
      titleKey: 'job.statusGenericTitle',
      defaultTitle: 'Active Service Booking',
      descKey: 'job.statusGenericDesc',
      defaultDesc: 'Tracking verified cooperative service delivery.',
    }
  )
}
