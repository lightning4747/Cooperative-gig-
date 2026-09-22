export interface AnalyticsSummary {
  totalBookings: number
  completedBookings: number
  emergencyBookings: number
  grossRevenue: number
  welfareFund: number
  averageRating: number
}

export interface CapacitySummary {
  totalRegisteredWorkers: number
  verifiedWorkers: number
  pendingWorkers: number
  activeOnlineWorkers: number
}

export interface DailyTrend {
  date: string
  totalJobs: number
  completedJobs: number
  cancelledJobs: number
  emergencyJobs: number
  revenue: number
  welfare: number
}

export interface CategoryMetric {
  categoryId: string
  categoryName: string
  totalJobs: number
  completedJobs: number
  avgRating: number
  totalRevenue: number
  verifiedWorkers: number
}

export interface HistoricalAnalyticsResponse {
  days: number
  summary: AnalyticsSummary
  capacity: CapacitySummary
  dailyTrends: DailyTrend[]
  categories: CategoryMetric[]
}
