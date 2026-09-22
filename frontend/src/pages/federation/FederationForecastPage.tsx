import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingUp, BarChart3, Users, Cpu } from 'lucide-react'
import { FederationPageHeader } from '@/components/federation/FederationPageHeader'
import { ForecastDashboard } from '@/components/federation/ForecastDashboard'
import { HistoricalAnalyticsChart } from '@/components/federation/HistoricalAnalyticsChart'
import { GapCapacityMatrix } from '@/components/federation/GapCapacityMatrix'
import { useForecast } from '@/hooks/useForecast'
import { useAnalytics } from '@/hooks/useAnalytics'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { cn } from '@/lib/utils'

export function FederationForecastPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'analytics' | 'gap' | 'forecast'>('analytics')
  const [selectedDays, setSelectedDays] = useState<number>(30)

  const { forecasts = [], isLoading: isForecastLoading, error: forecastError } = useForecast()
  const { analytics, isLoading: isAnalyticsLoading, error: analyticsError } = useAnalytics(selectedDays)

  const isLoading = isForecastLoading || isAnalyticsLoading
  const error = forecastError || analyticsError

  if (isLoading) return <LoadingSpinner size="lg" className="py-24" />
  if (error) return <ErrorState message="Failed to load analytical dashboard data." />

  const gapCount = forecasts.filter((f) => f.capacityGap === 'GAP').length

  return (
    <div className="space-y-6">
      <FederationPageHeader
        title={t('federation.forecastPage.title', { defaultValue: 'Cooperative Analytical & Forecasting Matrix' })}
        description={t('federation.forecastPage.description', {
          defaultValue: 'Unified analytical dashboard integrating factual historical records, dynamic workforce gap-capacity analysis, and deterministic demand projections.',
        })}
        badgeIcon={TrendingUp}
        badgeText={t('federation.forecastPage.badge', {
          count: forecasts.length,
          defaultValue: `${forecasts.length} Categories Processed`,
        })}
      />

      {/* Modern Tab Navigation */}
      <div className="flex border-b border-border space-x-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={cn(
            'flex items-center gap-2 pb-3 px-4 text-xs font-bold transition-all border-b-2 -mb-px',
            activeTab === 'analytics'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{t('federation.tabs.historical', { defaultValue: 'Historical Records & Trends' })}</span>
        </button>

        <button
          onClick={() => setActiveTab('gap')}
          className={cn(
            'flex items-center gap-2 pb-3 px-4 text-xs font-bold transition-all border-b-2 -mb-px',
            activeTab === 'gap'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Users className="w-4 h-4" />
          <span>{t('federation.tabs.gapAnalysis', { defaultValue: 'Gap Capacity Analysis' })}</span>
          {gapCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-destructive/15 text-destructive border border-destructive/30">
              {gapCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('forecast')}
          className={cn(
            'flex items-center gap-2 pb-3 px-4 text-xs font-bold transition-all border-b-2 -mb-px',
            activeTab === 'forecast'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Cpu className="w-4 h-4" />
          <span>{t('federation.tabs.demandModel', { defaultValue: 'Demand Forecasting Model' })}</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'analytics' && analytics && (
          <HistoricalAnalyticsChart
            data={analytics}
            selectedDays={selectedDays}
            onSelectDays={setSelectedDays}
          />
        )}

        {activeTab === 'gap' && analytics && (
          <GapCapacityMatrix
            capacity={analytics.capacity}
            categories={analytics.categories}
          />
        )}

        {activeTab === 'forecast' && (
          <ForecastDashboard forecasts={forecasts} />
        )}
      </div>
    </div>
  )
}
