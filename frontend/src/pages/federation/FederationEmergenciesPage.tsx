import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { FederationPageHeader } from '@/components/federation/FederationPageHeader'
import { EmergencyDispatchPanel } from '@/components/federation/EmergencyDispatchPanel'
import { useFederationDashboard, useFederationWorkers } from '@/hooks/useFederationDashboard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export function FederationEmergenciesPage() {
  const { t } = useTranslation()
  const { emergencies, isLoading } = useFederationDashboard()
  const { workers } = useFederationWorkers()

  if (isLoading) return <LoadingSpinner size="lg" className="py-24" />

  const availableWorkers = workers.filter(
    (w) => w.status === 'ACTIVE' && w.availability === 'AVAILABLE'
  )

  return (
    <div className="space-y-6">
      <FederationPageHeader
        title={t('federation.emergenciesPage.title', { defaultValue: 'Emergency Priority Distress Desk' })}
        description={t('federation.emergenciesPage.description', { defaultValue: 'Active monitoring of unfulfilled emergency broadcasts across municipal clusters with manual phone/radio dispatch override.' })}
        badgeIcon={AlertTriangle}
        badgeText={t('federation.emergenciesPage.badge', { count: emergencies.length, defaultValue: `${emergencies.length} Urgent Alerts` })}
      />

      <EmergencyDispatchPanel
        emergencies={emergencies}
        availableWorkers={availableWorkers}
      />
    </div>
  )
}
