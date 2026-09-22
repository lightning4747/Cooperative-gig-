import { useTranslation } from 'react-i18next'

export interface PaymentSettlementItem {
  id: string
  jobId: string
  basePrice: number
  workerEarning: number
  grossAmount?: number
  welfareContribution?: number
  subserviceName?: string
  bookingType?: string
  createdAt?: string
  status?: string
}

export interface EarningsSummaryProps {
  todayEarnings?: number
  weeklyEarnings?: number
  dailyTasksCount?: number
  weeklyTasksCount?: number
  jobsCount?: number
  surplusShare?: number
  recentSettlements?: PaymentSettlementItem[]
}

export function EarningsSummary({
  todayEarnings = 1850,
  weeklyEarnings = 8200,
  dailyTasksCount = 4,
  weeklyTasksCount = 18,
  jobsCount: _jobsCount = 4,
  surplusShare = 410,
  recentSettlements = [],
}: EarningsSummaryProps) {
  const { t } = useTranslation()

  // Fallback demo settlements if empty
  const displaySettlements: PaymentSettlementItem[] =
    recentSettlements.length > 0
      ? recentSettlements
      : [
          {
            id: 'set-01',
            jobId: 'JOB-8841-01',
            subserviceName: 'Fan repair & wiring',
            basePrice: 450,
            grossAmount: 500,
            welfareContribution: 25,
            workerEarning: 475,
            bookingType: 'STANDARD',
            createdAt: new Date(Date.now() - 42 * 60000).toISOString(),
            status: 'PAID',
          },
          {
            id: 'set-02',
            jobId: 'JOB-8841-02',
            subserviceName: 'Short circuit & MCB diagnosis',
            basePrice: 550,
            grossAmount: 650,
            welfareContribution: 50,
            workerEarning: 600,
            bookingType: 'EMERGENCY',
            createdAt: new Date(Date.now() - 145 * 60000).toISOString(),
            status: 'PAID',
          },
          {
            id: 'set-03',
            jobId: 'JOB-8841-03',
            subserviceName: 'Switchboard replacement',
            basePrice: 400,
            grossAmount: 450,
            welfareContribution: 25,
            workerEarning: 425,
            bookingType: 'STANDARD',
            createdAt: new Date(Date.now() - 320 * 60000).toISOString(),
            status: 'PAID',
          },
          {
            id: 'set-04',
            jobId: 'JOB-8841-04',
            subserviceName: 'Appliance power socket repair',
            basePrice: 350,
            grossAmount: 350,
            welfareContribution: 0,
            workerEarning: 350,
            bookingType: 'STANDARD',
            createdAt: new Date(Date.now() - 480 * 60000).toISOString(),
            status: 'PAID',
          },
        ]

  // 7-day cooperative earnings trend
  const weeklyTrend = [
    { day: 'Mon', amount: 1100, jobs: 3 },
    { day: 'Tue', amount: 1450, jobs: 3 },
    { day: 'Wed', amount: 950, jobs: 2 },
    { day: 'Thu', amount: 1600, jobs: 4 },
    { day: 'Fri', amount: 1250, jobs: 3 },
    { day: 'Sat', amount: todayEarnings || 1850, jobs: dailyTasksCount || 4, isToday: true },
    { day: 'Sun', amount: 0, jobs: 0 },
  ]

  const maxAmount = Math.max(...weeklyTrend.map((d) => d.amount), 2000)

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {/* Today's Earnings */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
            {t('worker.earnings.todayNet', "Today")}
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-foreground truncate">
            ₹{todayEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
            {dailyTasksCount} {t('worker.earnings.dailyTasksLabel', 'tasks today')}
          </p>
        </div>

        {/* Weekly Earnings */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
            {t('worker.earnings.thisWeek', 'This Week')}
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-foreground truncate">
            ₹{weeklyEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
            {weeklyTasksCount} {t('worker.earnings.weeklyTasksLabel', 'tasks')}
          </p>
        </div>

        {/* Collective Surplus Welfare Share */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
            {t('worker.earnings.surplusShare', 'Welfare')}
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-foreground truncate">
            ₹{surplusShare.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
            {t('worker.earnings.surplusHealthAid', 'Accrued fund')}
          </p>
        </div>
      </div>

      {/* Business Growth */}
      <section className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-2.5">
        <div className="pb-1.5 border-b border-border/70">
          <h3 className="text-xs sm:text-sm font-bold text-foreground">
            {t('worker.growth.sectionTitle', 'Business Growth')}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-muted-foreground block text-[11px]">
              {t('worker.growth.taskGrowthTitle', 'Completed Tasks')}
            </span>
            <div className="text-base font-bold font-mono text-foreground">
              184 {t('worker.growth.tasksTotal', 'tasks')}
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-muted-foreground block text-[11px]">
              {t('worker.growth.retentionTitle', 'Customer Rating')}
            </span>
            <div className="text-base font-bold font-mono text-foreground">
              4.8 ★
            </div>
          </div>
        </div>
      </section>

      {/* 7-Day Cooperative Wage Flow */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs sm:text-sm font-bold text-foreground">
            {t('worker.earnings.weeklyFlowTitle', '7-Day Wage Flow')}
          </h3>
          <span className="font-mono text-xs font-bold text-muted-foreground">
            {t('worker.earnings.dailyAverage', 'Avg ₹600/day')}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2.5 pt-2 items-end h-28 sm:h-32">
          {weeklyTrend.map((d) => {
            const heightPercent = Math.max(10, Math.round((d.amount / maxAmount) * 100))
            return (
              <div key={d.day} className="flex flex-col items-center gap-1 h-full justify-end min-w-0">
                <span className="font-mono text-[10px] font-bold text-muted-foreground truncate w-full text-center">
                  {d.amount > 0 ? `₹${d.amount}` : '-'}
                </span>
                <div className="w-full bg-secondary/50 rounded-t-md h-16 sm:h-20 flex items-end overflow-hidden">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-all ${
                      d.isToday ? 'bg-primary' : 'bg-primary/30'
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] font-bold ${
                    d.isToday ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {d.day}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Payment History */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
        <div className="pb-2 border-b border-border/70">
          <h3 className="text-sm font-bold text-foreground">
            {t('worker.earnings.paymentHistoryTitle', 'Payment History')}
          </h3>
        </div>

        <div className="divide-y divide-border/60">
          {displaySettlements.map((p) => {
            const formattedTime = p.createdAt
              ? new Date(p.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''
            const formattedDate = p.createdAt
              ? new Date(p.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                })
              : ''

            return (
              <div
                key={p.id}
                className="py-2.5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground truncate">
                      {p.subserviceName || 'Cooperative Service'}
                    </span>
                    {p.bookingType === 'EMERGENCY' && (
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">
                        Priority
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-muted-foreground block">
                    {formattedDate} {formattedTime}
                  </span>
                </div>

                <div className="text-right shrink-0 space-y-0.5">
                  <span className="font-mono font-bold text-sm text-foreground block">
                    ₹{p.workerEarning || p.basePrice}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-600">
                    {t('worker.earnings.paid', 'Paid')}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
