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

// Global Horizon Types
export type ForecastHorizon = '1W' | '2W' | '1M' | '3M' | '6M' | '1Y'

export interface ForecastTimeSeriesPoint {
  label: string
  date: string
  isHistorical: boolean
  historicalCompleted?: number
  predictedDemand: number
  upperCI: number // 95% Upper Bound
  lowerCI: number // 95% Lower Bound
  baselineCapacity: number
}

export interface SeasonalityRuleInfo {
  season: 'MONSOON' | 'FESTIVE' | 'STANDARD'
  title: string
  description: string
  impactNote: string
  activeMonths: number[]
  adjustedTrades: Array<{ trade: string; factor: number; note: string }>
}

export type CapacityGapAssessmentStatus = 'CRITICAL_SHORTAGE' | 'OPTIMAL_BALANCE' | 'SURPLUS_CAPACITY'

export interface TradeCapacityAssessment {
  categoryId: string
  categoryName: string
  activeVerifiedWorkers: number
  onlineAvailableWorkers: number
  projectedDemandVolume: number
  coverageRatio: number // Capacity / Demand
  gapStatus: CapacityGapAssessmentStatus
  mobilizationRecommendation: string
  targetSociety: string
  actionCount?: number
}

export interface WelfareMetrics {
  cumulativeHealthClaims: number
  accidentAidDisbursed: number
  pmsbyEnrolled: number
  pmjjbyEnrolled: number
  statutoryWageCompliancePercent: number
  stateMinWageFloorPerJob: number
  actualAvgPayoutPerJob: number
  welfareReserveBalance: number
}

export interface DispatchVelocityZone {
  zone: string
  meanTimeToDispatchMinutes: number
  fulfillmentRatePercent: number
  activeJobs: number
}
