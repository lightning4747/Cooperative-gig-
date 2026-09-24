// @ts-nocheck
import { useState, useMemo, useId } from 'react'
import { useTranslation } from 'react-i18next'
import {
  TrendingUp,
  Cpu,
  Layers,
} from 'lucide-react'
import type {
  ForecastHorizon,
  HistoricalAnalyticsResponse,
  ForecastTimeSeriesPoint,
} from '@/types/analytics'
import type { DemandForecast } from '@/types/forecast'
import {
  generateForecastSeries,
  evaluateTradeCapacityMatrix,
} from '@/utils/mockForecastEngine'

interface ForecastDashboardProps {
  horizon?: ForecastHorizon
  selectedCategory?: string
  analyticsData?: HistoricalAnalyticsResponse
  forecasts?: DemandForecast[]
}

export function ForecastDashboard({
  horizon = '1W',
  selectedCategory = 'ALL',
  analyticsData,
}: ForecastDashboardProps) {
  const { t } = useTranslation()
  const gradientId = useId()
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null)

  const forecastData = useMemo(() => {
    return generateForecastSeries(horizon, selectedCategory, analyticsData)
  }, [horizon, selectedCategory, analyticsData])

  const { points, totalProjectedVolume, modelScore, overallCapacity } = forecastData

  const capacityMatrix = useMemo(() => {
    return evaluateTradeCapacityMatrix(horizon, analyticsData)
  }, [horizon, analyticsData])

  const shortageTrades = capacityMatrix.filter((c) => c.gapStatus === 'CRITICAL_SHORTAGE')
  const surplusTrades = capacityMatrix.filter((c) => c.gapStatus === 'SURPLUS_CAPACITY')

  // Compact dimensions
  const svgWidth = 800
  const svgHeight = 200
  const padding = { top: 16, right: 24, bottom: 28, left: 44 }
  const plotWidth = svgWidth - padding.left - padding.right
  const plotHeight = svgHeight - padding.top - padding.bottom

  const maxYValue = useMemo(() => {
    return Math.max(
      ...points.map((p) => Math.max(p.upperCI, p.historicalCompleted || 0, p.baselineCapacity)),
      10
    ) * 1.15
  }, [points])

  const getX = (index: number) => {
    if (points.length <= 1) return padding.left
    return padding.left + (index / (points.length - 1)) * plotWidth
  }

  const getY = (val: number) => {
    return padding.top + plotHeight - (val / maxYValue) * plotHeight
  }

  // Current date index (Today represents future/forecast boundary)
  const todayIndex = points.findIndex((p) => !p.isHistorical)
  const currentIdx = todayIndex >= 0 ? todayIndex : 0

  // 1. Shaded 95% Confidence Interval Polygon (starting exactly at current date line)
  const futurePoints = points.slice(currentIdx)

  let ciPolygonPoints = ''
  let upperCIBoundary = ''
  let lowerCIBoundary = ''

  if (futurePoints.length > 0) {
    const upperPath = futurePoints.map((p, idx) => `${getX(currentIdx + idx)},${getY(p.upperCI)}`)
    const lowerPath = [...futurePoints]
      .reverse()
      .map((p, idx) => `${getX(currentIdx + futurePoints.length - 1 - idx)},${getY(p.lowerCI)}`)
    ciPolygonPoints = [...upperPath, ...lowerPath].join(' ')

    upperCIBoundary = futurePoints
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(currentIdx + idx)} ${getY(p.upperCI)}`)
      .join(' ')

    lowerCIBoundary = futurePoints
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(currentIdx + idx)} ${getY(p.lowerCI)}`)
      .join(' ')
  }

  // 2. Historical line path (up to current date)
  const historicalPoints = points.slice(0, currentIdx + 1)
  const historicalPath = historicalPoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.historicalCompleted || p.predictedDemand)}`)
    .join(' ')

  // 3. Forecast line path (from current date forward)
  const projectedPoints = points.slice(currentIdx)
  const forecastPath = projectedPoints
    .map((p, idx) => {
      const globalIdx = currentIdx + idx
      return `${idx === 0 ? 'M' : 'L'} ${getX(globalIdx)} ${getY(p.predictedDemand)}`
    })
    .join(' ')

  // 4. Baseline capacity line path
  const capacityPath = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.baselineCapacity)}`)
    .join(' ')

  const yTicks = [0, 0.5, 1].map((ratio) => Math.round(maxYValue * ratio))

  const activePoint: ForecastTimeSeriesPoint =
    (hoveredPointIndex !== null ? points[hoveredPointIndex] : points[currentIdx]) || points[0]

  const currentDateLabel = points[currentIdx]?.label || 'Sep 22'

  return (
    <div className="space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-md border border-border bg-card text-card-foreground space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              {t('federation.analytics.projectedVolume', { defaultValue: 'Projected Volume' })}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {horizon}
            </span>
          </div>
          <div className="text-2xl font-semibold font-mono tabular-nums text-foreground">
            {totalProjectedVolume.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-md border border-border bg-card text-card-foreground space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              {t('federation.analytics.deficitSurplus', { defaultValue: 'Worker Shortages' })}
            </span>
          </div>
          <div className="text-2xl font-semibold font-mono tabular-nums text-foreground">
            {shortageTrades.length} <span className="text-xs font-normal text-muted-foreground">{t('federation.analytics.defSurRatio', { def: shortageTrades.length, sur: surplusTrades.length, defaultValue: `${shortageTrades.length} skills need workers` })}</span>
          </div>
        </div>

        <div className="p-4 rounded-md border border-border bg-card text-card-foreground space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              {t('federation.analytics.modelScore', { defaultValue: 'Model Confidence' })}
            </span>
          </div>
          <div className="text-2xl font-semibold font-mono tabular-nums text-foreground">
            {modelScore.confidencePercent}%
          </div>
        </div>

        <div className="p-4 rounded-md border border-border bg-card text-card-foreground space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              {t('federation.analytics.capacity', { defaultValue: 'Daily Capacity' })}
            </span>
          </div>
          <div className="text-2xl font-semibold font-mono tabular-nums text-foreground">
            {overallCapacity} <span className="text-xs font-normal text-muted-foreground">{t('federation.analytics.jobsPerDay', { defaultValue: 'jobs/day' })}</span>
          </div>
        </div>
      </div>

      {/* Multi-Range Forecast Chart */}
      <div className="p-4 rounded-md border border-border bg-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('federation.analytics.trajectoryTitle', { defaultValue: 'Demand Forecast & Capacity' })}
          </h3>

          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-[11px]">
              <span className="w-2.5 h-0.5 bg-foreground inline-block" />
              <span>{t('federation.analytics.legendHistorical', { defaultValue: 'Historical' })}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-[11px]">
              <span className="w-2.5 h-0.5 bg-muted-foreground border-t-2 border-dashed inline-block" />
              <span>{t('federation.analytics.legendForecast', { defaultValue: 'Forecast' })}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-[11px]">
              <span className="w-2.5 h-1.5 bg-foreground/10 border border-foreground/20 inline-block" />
              <span>{t('federation.analytics.legendCI', { defaultValue: 'Expected Range' })}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-[11px]">
              <span className="w-2.5 h-0.5 bg-muted-foreground/40 inline-block" />
              <span>{t('federation.analytics.legendCapacity', { defaultValue: 'Capacity' })}</span>
            </span>
          </div>
        </div>

        {/* Stable SVG container */}
        <div className="w-full h-[200px] relative">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
            className="w-full h-full select-none"
            onMouseLeave={() => setHoveredPointIndex(null)}
          >
            {/* Grid lines */}
            {yTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={getY(tick)}
                  x2={svgWidth - padding.right}
                  y2={getY(tick)}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 6}
                  y={getY(tick) + 3}
                  textAnchor="end"
                  fontSize="10"
                  fontFamily="monospace"
                  fill="currentColor"
                  className="fill-muted-foreground"
                >
                  {tick}
                </text>
              </g>
            ))}

            {/* Baseline Capacity */}
            <path
              d={capacityPath}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              className="text-muted-foreground/50"
            />

            {/* 95% Confidence Interval Band (Solid neutral fill - strictly no gradients) */}
            {ciPolygonPoints && (
              <polygon
                points={ciPolygonPoints}
                fill="currentColor"
                fillOpacity="0.05"
                className="text-foreground"
              />
            )}

            {/* Boundary lines around confidence band extending to current date line */}
            {upperCIBoundary && (
              <path
                d={upperCIBoundary}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="3 3"
                className="text-muted-foreground/60"
              />
            )}
            {lowerCIBoundary && (
              <path
                d={lowerCIBoundary}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="3 3"
                className="text-muted-foreground/60"
              />
            )}

            {/* Current Date Vertical Dotted Line */}
            {currentIdx >= 0 && (
              <g>
                <line
                  x1={getX(currentIdx)}
                  y1={padding.top}
                  x2={getX(currentIdx)}
                  y2={padding.top + plotHeight}
                  stroke="currentColor"
                  strokeOpacity="0.45"
                  strokeDasharray="3 3"
                  strokeWidth="1.5"
                />
                <text
                  x={getX(currentIdx) + 4}
                  y={padding.top + 10}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  fill="currentColor"
                  className="fill-foreground"
                >
                  {t('federation.analytics.todayMarker', { date: currentDateLabel, defaultValue: `TODAY (${currentDateLabel})` })}
                </text>
              </g>
            )}

            {/* Historical completions line */}
            <path
              d={historicalPath}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-foreground"
            />

            {/* Forecast Projected Demand line */}
            <path
              d={forecastPath}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="4 2"
              className="text-foreground"
            />

            {/* Active Crosshair */}
            {hoveredPointIndex !== null && (
              <line
                x1={getX(hoveredPointIndex)}
                y1={padding.top}
                x2={getX(hoveredPointIndex)}
                y2={padding.top + plotHeight}
                stroke="currentColor"
                strokeWidth="1"
                strokeOpacity="0.4"
                className="text-foreground"
              />
            )}

            {/* Data Points */}
            {points.map((p, idx) => {
              const cx = getX(idx)
              const cy = getY(p.isHistorical ? (p.historicalCompleted || p.predictedDemand) : p.predictedDemand)
              const isHovered = hoveredPointIndex === idx

              return (
                <g
                  key={p.date + idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                >
                  <rect
                    x={cx - (plotWidth / points.length / 2)}
                    y={padding.top}
                    width={plotWidth / points.length}
                    height={plotHeight}
                    fill="transparent"
                  />

                  <circle
                    cx={cx}
                    cy={cy}
                    r={2.5}
                    fill="currentColor"
                    stroke={isHovered ? 'currentColor' : 'none'}
                    strokeWidth={isHovered ? 2 : 0}
                    className={p.isHistorical ? 'text-foreground' : 'text-muted-foreground'}
                  />

                  {(points.length <= 14 || idx % Math.ceil(points.length / 8) === 0 || idx === points.length - 1) && (
                    <text
                      x={cx}
                      y={padding.top + plotHeight + 16}
                      textAnchor="middle"
                      fontSize="9"
                      fontFamily="monospace"
                      fill="currentColor"
                      className="fill-muted-foreground"
                    >
                      {p.label}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Permanent Status Strip */}
        <div className="h-8 px-3 rounded-md bg-muted/30 border border-border flex items-center justify-between text-xs font-mono tabular-nums">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-foreground">{activePoint.label}</span>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              ({activePoint.isHistorical ? t('federation.analytics.statusHistorical', { defaultValue: 'Historical' }) : t('federation.analytics.statusForecast', { defaultValue: 'Forecast' })})
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-foreground">
            <div>
              <span className="text-muted-foreground mr-1">{t('federation.analytics.statusJobs', { defaultValue: 'Jobs:' })}</span>
              <span className="font-semibold">
                {activePoint.isHistorical ? activePoint.historicalCompleted : activePoint.predictedDemand}
              </span>
            </div>

            {!activePoint.isHistorical && (
              <div className="hidden md:block">
                <span className="text-muted-foreground mr-1">{t('federation.analytics.statusCI', { defaultValue: 'Expected Range:' })}</span>
                <span>[{activePoint.lowerCI}–{activePoint.upperCI}]</span>
              </div>
            )}

            <div>
              <span className="text-muted-foreground mr-1">{t('federation.analytics.statusCapacity', { defaultValue: 'Capacity:' })}</span>
              <span className="text-muted-foreground">{activePoint.baselineCapacity}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
