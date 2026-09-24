import { useTranslation } from 'react-i18next'
import { FederationPageHeader } from '@/components/federation/FederationPageHeader'
import { SocietyList } from '@/components/federation/SocietyList'
import { useFederationDashboard } from '@/hooks/useFederationDashboard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export function FederationSocietiesPage() {
  const { t } = useTranslation()
  const { societies, isLoading } = useFederationDashboard()

  if (isLoading) return <LoadingSpinner size="lg" className="py-24" />

  return (
    <div className="space-y-6">
      <FederationPageHeader
        title={t('federation.societiesPage.title', { defaultValue: 'Member Cooperatives' })}
        description={t('federation.societiesPage.description', { defaultValue: 'Directory of primary labour and artisan cooperative societies.' })}
        badgeText={t('federation.societiesPage.badge', { count: societies.length, defaultValue: `${societies.length} Societies` })}
      />

      <SocietyList societies={societies} />
    </div>
  )
}
