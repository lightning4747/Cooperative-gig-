import type { HistoricalAnalyticsResponse, WelfareMetrics, DispatchVelocityZone } from '@/types/analytics'

export interface TradeBenchmark {
  categoryId: string
  categoryName: string
  verifiedWorkers: number
  onlineAvailableWorkers: number
  dailyCapacityJobs: number
  dailyDemandJobs: number
  targetSociety: string
}

export const mockTradeBenchmarks: TradeBenchmark[] = [
  {
    categoryId: 'cat-plumbing',
    categoryName: 'Plumbing',
    verifiedWorkers: 10,
    onlineAvailableWorkers: 6,
    dailyCapacityJobs: 16,
    dailyDemandJobs: 28, // Deficit (0.57x)
    targetSociety: 'RS Puram Cooperative Workers Union',
  },
  {
    categoryId: 'cat-cleaning',
    categoryName: 'House Cleaning',
    verifiedWorkers: 12,
    onlineAvailableWorkers: 7,
    dailyCapacityJobs: 20,
    dailyDemandJobs: 32, // Deficit (0.63x)
    targetSociety: 'Coimbatore City Labour & Artisans Cooperative Society',
  },
  {
    categoryId: 'cat-electrical',
    categoryName: 'Electrical',
    verifiedWorkers: 16,
    onlineAvailableWorkers: 10,
    dailyCapacityJobs: 26,
    dailyDemandJobs: 27, // Balanced (0.96x)
    targetSociety: 'Coimbatore City Labour & Artisans Cooperative Society',
  },
  {
    categoryId: 'cat-carpentry',
    categoryName: 'Carpentry',
    verifiedWorkers: 12,
    onlineAvailableWorkers: 8,
    dailyCapacityJobs: 19,
    dailyDemandJobs: 18, // Balanced (1.05x)
    targetSociety: 'Peelamedu Cooperative Services Guild',
  },
  {
    categoryId: 'cat-technician',
    categoryName: 'Appliance Repair',
    verifiedWorkers: 14,
    onlineAvailableWorkers: 9,
    dailyCapacityJobs: 22,
    dailyDemandJobs: 21, // Balanced (1.05x)
    targetSociety: 'RS Puram Cooperative Workers Union',
  },
  {
    categoryId: 'cat-caregiving',
    categoryName: 'Caregiving',
    verifiedWorkers: 18,
    onlineAvailableWorkers: 11,
    dailyCapacityJobs: 27,
    dailyDemandJobs: 26, // Balanced (1.04x)
    targetSociety: 'Saibaba Colony Cooperative Labour Guild',
  },
  {
    categoryId: 'cat-painting',
    categoryName: 'Painting',
    verifiedWorkers: 18,
    onlineAvailableWorkers: 12,
    dailyCapacityJobs: 28,
    dailyDemandJobs: 16, // Surplus (1.75x)
    targetSociety: 'Saibaba Colony Cooperative Labour Guild',
  },
  {
    categoryId: 'cat-gardening',
    categoryName: 'Gardening',
    verifiedWorkers: 15,
    onlineAvailableWorkers: 9,
    dailyCapacityJobs: 22,
    dailyDemandJobs: 12, // Surplus (1.83x)
    targetSociety: 'Peelamedu Cooperative Services Guild',
  },
  {
    categoryId: 'cat-domestic',
    categoryName: 'Domestic Help',
    verifiedWorkers: 14,
    onlineAvailableWorkers: 9,
    dailyCapacityJobs: 22,
    dailyDemandJobs: 21, // Balanced (1.05x)
    targetSociety: 'Coimbatore City Labour & Artisans Cooperative Society',
  },
  {
    categoryId: 'cat-technician-svc',
    categoryName: 'Technician Services',
    verifiedWorkers: 11,
    onlineAvailableWorkers: 7,
    dailyCapacityJobs: 18,
    dailyDemandJobs: 17, // Balanced (1.06x)
    targetSociety: 'RS Puram Cooperative Workers Union',
  },
]

export const mockHistoricalAnalytics: HistoricalAnalyticsResponse = {
  days: 30,
  summary: {
    totalBookings: 514,
    completedBookings: 486,
    emergencyBookings: 42,
    grossRevenue: 312800,
    welfareFund: 78200,
    averageRating: 4.82,
  },
  capacity: {
    totalRegisteredWorkers: 142,
    verifiedWorkers: 118,
    pendingWorkers: 14,
    activeOnlineWorkers: 52,
  },
  dailyTrends: [
    { date: '2026-09-09', totalJobs: 28, completedJobs: 26, cancelledJobs: 2, emergencyJobs: 2, revenue: 16800, welfare: 4200 },
    { date: '2026-09-10', totalJobs: 36, completedJobs: 34, cancelledJobs: 2, emergencyJobs: 3, revenue: 21600, welfare: 5400 },
    { date: '2026-09-11', totalJobs: 24, completedJobs: 22, cancelledJobs: 2, emergencyJobs: 1, revenue: 14400, welfare: 3600 },
    { date: '2026-09-12', totalJobs: 32, completedJobs: 30, cancelledJobs: 2, emergencyJobs: 3, revenue: 19200, welfare: 4800 },
    { date: '2026-09-13', totalJobs: 42, completedJobs: 40, cancelledJobs: 2, emergencyJobs: 4, revenue: 25200, welfare: 6300 },
    { date: '2026-09-14', totalJobs: 45, completedJobs: 42, cancelledJobs: 3, emergencyJobs: 5, revenue: 27000, welfare: 6750 },
    { date: '2026-09-15', totalJobs: 38, completedJobs: 36, cancelledJobs: 2, emergencyJobs: 3, revenue: 22800, welfare: 5700 },
    { date: '2026-09-16', totalJobs: 30, completedJobs: 28, cancelledJobs: 2, emergencyJobs: 2, revenue: 18000, welfare: 4500 },
    { date: '2026-09-17', totalJobs: 35, completedJobs: 33, cancelledJobs: 2, emergencyJobs: 3, revenue: 21000, welfare: 5250 },
    { date: '2026-09-18', totalJobs: 44, completedJobs: 42, cancelledJobs: 2, emergencyJobs: 4, revenue: 26400, welfare: 6600 },
    { date: '2026-09-19', totalJobs: 39, completedJobs: 37, cancelledJobs: 2, emergencyJobs: 3, revenue: 23400, welfare: 5850 },
    { date: '2026-09-20', totalJobs: 48, completedJobs: 45, cancelledJobs: 3, emergencyJobs: 5, revenue: 28800, welfare: 7200 },
    { date: '2026-09-21', totalJobs: 52, completedJobs: 49, cancelledJobs: 3, emergencyJobs: 6, revenue: 31200, welfare: 7800 },
    { date: '2026-09-22', totalJobs: 41, completedJobs: 39, cancelledJobs: 2, emergencyJobs: 4, revenue: 24600, welfare: 6150 },
  ],
  categories: [
    { categoryId: 'cat-plumbing', categoryName: 'Plumbing', totalJobs: 78, completedJobs: 73, avgRating: 4.8, totalRevenue: 62400, verifiedWorkers: 10 },
    { categoryId: 'cat-cleaning', categoryName: 'House Cleaning', totalJobs: 92, completedJobs: 87, avgRating: 4.7, totalRevenue: 73600, verifiedWorkers: 12 },
    { categoryId: 'cat-electrical', categoryName: 'Electrical', totalJobs: 62, completedJobs: 59, avgRating: 4.9, totalRevenue: 49600, verifiedWorkers: 16 },
    { categoryId: 'cat-carpentry', categoryName: 'Carpentry', totalJobs: 46, completedJobs: 44, avgRating: 4.8, totalRevenue: 41400, verifiedWorkers: 12 },
    { categoryId: 'cat-technician', categoryName: 'Appliance Repair', totalJobs: 51, completedJobs: 48, avgRating: 4.7, totalRevenue: 45900, verifiedWorkers: 14 },
    { categoryId: 'cat-caregiving', categoryName: 'Caregiving', totalJobs: 56, completedJobs: 54, avgRating: 4.9, totalRevenue: 67200, verifiedWorkers: 18 },
    { categoryId: 'cat-painting', categoryName: 'Painting', totalJobs: 38, completedJobs: 35, avgRating: 4.6, totalRevenue: 53200, verifiedWorkers: 18 },
    { categoryId: 'cat-gardening', categoryName: 'Gardening', totalJobs: 31, completedJobs: 29, avgRating: 4.6, totalRevenue: 24800, verifiedWorkers: 15 },
    { categoryId: 'cat-domestic', categoryName: 'Domestic Help', totalJobs: 48, completedJobs: 45, avgRating: 4.8, totalRevenue: 38400, verifiedWorkers: 14 },
    { categoryId: 'cat-technician-svc', categoryName: 'Technician Services', totalJobs: 34, completedJobs: 32, avgRating: 4.7, totalRevenue: 30600, verifiedWorkers: 11 },
  ],
}

export const mockWelfareMetrics: WelfareMetrics = {
  cumulativeHealthClaims: 24,
  accidentAidDisbursed: 18500,
  pmsbyEnrolled: 118,
  pmjjbyEnrolled: 112,
  statutoryWageCompliancePercent: 100,
  stateMinWageFloorPerJob: 380,
  actualAvgPayoutPerJob: 545,
  welfareReserveBalance: 78200,
}

export const mockVelocityZones: DispatchVelocityZone[] = [
  { zone: 'Central Zone (Gandhipuram)', meanTimeToDispatchMinutes: 4.2, fulfillmentRatePercent: 98.4, activeJobs: 64 },
  { zone: 'West Zone (RS Puram)', meanTimeToDispatchMinutes: 5.1, fulfillmentRatePercent: 96.8, activeJobs: 82 },
  { zone: 'East Zone (Peelamedu)', meanTimeToDispatchMinutes: 4.8, fulfillmentRatePercent: 97.2, activeJobs: 74 },
  { zone: 'North Zone (Saibaba Colony)', meanTimeToDispatchMinutes: 6.4, fulfillmentRatePercent: 94.5, activeJobs: 46 },
]
