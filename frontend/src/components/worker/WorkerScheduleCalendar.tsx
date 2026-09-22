import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DaySchedule {
  dayOfWeek: number // 1: Mon, 7: Sun
  dayNameKey: string
  enabled: boolean
  startTime: string
  endTime: string
}

const DEFAULT_WEEKLY_SCHEDULE: DaySchedule[] = [
  { dayOfWeek: 1, dayNameKey: 'monday', enabled: true, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 2, dayNameKey: 'tuesday', enabled: true, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 3, dayNameKey: 'wednesday', enabled: true, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 4, dayNameKey: 'thursday', enabled: true, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 5, dayNameKey: 'friday', enabled: true, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 6, dayNameKey: 'saturday', enabled: true, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 7, dayNameKey: 'sunday', enabled: false, startTime: '09:00', endTime: '14:00' },
]

const STORAGE_KEY_SCHEDULE = 'coop_worker_weekly_schedule'
const STORAGE_KEY_OFF_DAYS = 'coop_worker_off_days'

export function WorkerScheduleCalendar() {
  const { t } = useTranslation()

  // Weekly Schedule State
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCHEDULE)
      return saved ? JSON.parse(saved) : DEFAULT_WEEKLY_SCHEDULE
    } catch {
      return DEFAULT_WEEKLY_SCHEDULE
    }
  })

  // Specific Calendar Days Off (Format: 'YYYY-MM-DD')
  const [offDays, setOffDays] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OFF_DAYS)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [currentDate, setCurrentDate] = useState(new Date())
  const [saveToast, setSaveToast] = useState(false)

  // Save changes automatically
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(weeklySchedule))
    } catch {}
  }, [weeklySchedule])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_OFF_DAYS, JSON.stringify(offDays))
    } catch {}
  }, [offDays])

  // Calendar Calculations
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDay = (firstDayOfMonth.getDay() + 6) % 7

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const todayStr = new Date().toISOString().split('T')[0]

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const toggleDayOff = (dateStr: string) => {
    setOffDays((prev) => {
      const next = prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
      return next
    })
    triggerToast()
  }

  const triggerToast = () => {
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 2000)
  }

  const handleToggleWeeklyDay = (dayOfWeek: number) => {
    setWeeklySchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, enabled: !d.enabled } : d))
    )
    triggerToast()
  }

  const handleTimeChange = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    setWeeklySchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d))
    )
    triggerToast()
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleResetSchedule = () => {
    setWeeklySchedule(DEFAULT_WEEKLY_SCHEDULE)
    setOffDays([])
    triggerToast()
  }

  return (
    <div className="space-y-6">
      {/* Calendar Card */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
        {/* Month Header & Month Navigation */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-foreground">
            {monthNames[month]} {year}
          </h3>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Leave Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => toggleDayOff(todayStr)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer',
              offDays.includes(todayStr)
                ? 'bg-destructive text-destructive-foreground border-destructive'
                : 'bg-secondary/60 border-border text-foreground hover:bg-secondary'
            )}
          >
            {offDays.includes(todayStr)
              ? t('worker.schedule.cancelTodayOff', 'Cancel Today Off')
              : t('worker.schedule.markTodayOff', 'Take Today Off')}
          </button>

          <button
            type="button"
            onClick={() => toggleDayOff(tomorrowStr)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer',
              offDays.includes(tomorrowStr)
                ? 'bg-destructive text-destructive-foreground border-destructive'
                : 'bg-secondary/60 border-border text-foreground hover:bg-secondary'
            )}
          >
            {offDays.includes(tomorrowStr)
              ? t('worker.schedule.cancelTomorrowOff', 'Cancel Tomorrow Off')
              : t('worker.schedule.markTomorrowOff', 'Take Tomorrow Off')}
          </button>

          <button
            type="button"
            onClick={handleResetSchedule}
            className="ml-auto text-[11px] text-muted-foreground hover:text-foreground cursor-pointer py-1 px-2"
          >
            {t('worker.schedule.reset', 'Reset')}
          </button>
        </div>

        {/* Month Day Grid */}
        <div className="space-y-1">
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-muted-foreground py-1">
            <span>{t('calendar.mon', 'Mon')}</span>
            <span>{t('calendar.tue', 'Tue')}</span>
            <span>{t('calendar.wed', 'Wed')}</span>
            <span>{t('calendar.thu', 'Thu')}</span>
            <span>{t('calendar.fri', 'Fri')}</span>
            <span className="text-amber-600">{t('calendar.sat', 'Sat')}</span>
            <span className="text-destructive">{t('calendar.sun', 'Sun')}</span>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Empty slots before first day */}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10 sm:h-12 rounded-xl bg-transparent" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1
              const dateObj = new Date(year, month, dayNum)
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
              const isToday = dateStr === todayStr
              const isOff = offDays.includes(dateStr)

              const dayOfWeek = (dateObj.getDay() + 6) % 7 + 1
              const weeklyConfig = weeklySchedule.find((w) => w.dayOfWeek === dayOfWeek)
              const isWeeklyRestDay = !weeklyConfig?.enabled

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => toggleDayOff(dateStr)}
                  className={cn(
                    'h-11 sm:h-13 rounded-xl border p-1 sm:p-1.5 flex flex-col justify-between items-center transition-all cursor-pointer text-xs font-bold',
                    isOff
                      ? 'border-destructive/40 bg-destructive/10 text-destructive'
                      : isToday
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/10 text-foreground'
                      : isWeeklyRestDay
                      ? 'border-border/60 bg-muted/40 text-muted-foreground'
                      : 'border-border bg-card hover:bg-muted text-foreground'
                  )}
                  title={`${dateStr}: ${isOff ? 'Marked Day Off' : 'Working'}`}
                >
                  <span className="text-[11px] sm:text-xs font-mono">{dayNum}</span>

                  <div className="w-full flex justify-center pb-0.5">
                    {isOff ? (
                      <span className="text-[9px] font-bold text-destructive px-1 rounded bg-destructive/15">
                        {t('worker.schedule.offBadge', 'OFF')}
                      </span>
                    ) : isWeeklyRestDay ? (
                      <span className="text-[9px] font-semibold text-muted-foreground">
                        {t('worker.schedule.restBadge', 'Rest')}
                      </span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground pt-2 border-t border-border/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{t('worker.schedule.workingLegend', 'Working Day')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-destructive" />
            <span>{t('worker.schedule.dayOffLegend', 'Marked Day Off')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
            <span>{t('worker.schedule.restDayLegend', 'Weekly Rest')}</span>
          </div>
          <span className="ml-auto text-[10px] text-muted-foreground">
            {t('worker.schedule.tapHint', 'Tap date to toggle Day Off')}
          </span>
        </div>
      </div>

      {/* Weekly Working Hours Editor */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">
            {t('worker.schedule.weeklyHoursTitle', 'Weekly Standard Working Hours')}
          </h3>
          <span className="text-xs font-mono text-muted-foreground">
            IST
          </span>
        </div>

        <div className="space-y-2 divide-y divide-border/60">
          {weeklySchedule.map((item) => {
            const dayNames: Record<string, string> = {
              monday: t('calendar.monday', 'Monday'),
              tuesday: t('calendar.tuesday', 'Tuesday'),
              wednesday: t('calendar.wednesday', 'Wednesday'),
              thursday: t('calendar.thursday', 'Thursday'),
              friday: t('calendar.friday', 'Friday'),
              saturday: t('calendar.saturday', 'Saturday'),
              sunday: t('calendar.sunday', 'Sunday'),
            }

            return (
              <div
                key={item.dayOfWeek}
                className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
              >
                {/* Day Toggle Switch */}
                <div className="flex items-center gap-2.5 min-w-[130px]">
                  <button
                    type="button"
                    onClick={() => handleToggleWeeklyDay(item.dayOfWeek)}
                    className={cn(
                      'w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer',
                      item.enabled ? 'bg-emerald-600' : 'bg-muted'
                    )}
                  >
                    <span
                      className={cn(
                        'w-4 h-4 rounded-full bg-white transition-transform shadow-xs',
                        item.enabled ? 'translate-x-4' : 'translate-x-0'
                      )}
                    />
                  </button>
                  <span className={cn('font-bold', item.enabled ? 'text-foreground' : 'text-muted-foreground')}>
                    {dayNames[item.dayNameKey] || item.dayNameKey}
                  </span>
                </div>

                {/* Time Range Pickers */}
                {item.enabled ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={item.startTime}
                      onChange={(e) => handleTimeChange(item.dayOfWeek, 'startTime', e.target.value)}
                      className="px-2 py-1 rounded-lg border border-input bg-card text-foreground font-mono text-xs focus:outline-none"
                    />
                    <span className="text-muted-foreground">—</span>
                    <input
                      type="time"
                      value={item.endTime}
                      onChange={(e) => handleTimeChange(item.dayOfWeek, 'endTime', e.target.value)}
                      className="px-2 py-1 rounded-lg border border-input bg-card text-foreground font-mono text-xs focus:outline-none"
                    />
                  </div>
                ) : (
                  <span className="text-[11px] text-muted-foreground italic">
                    {t('worker.schedule.markedOffDay', 'Day Off')}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Auto-Save Toast Alert */}
      {saveToast && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 px-3.5 py-2 rounded-xl bg-slate-900 text-white shadow-lg text-xs font-medium animate-in fade-in">
          <span>{t('worker.schedule.saved', 'Schedule updated ✓')}</span>
        </div>
      )}
    </div>
  )
}
