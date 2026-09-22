import { useTranslation } from 'react-i18next'
import { Sliders } from 'lucide-react'
import { FederationPageHeader } from '@/components/federation/FederationPageHeader'
import { ConfigurationPanel } from '@/components/federation/ConfigurationPanel'

export function FederationConfigPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <FederationPageHeader
        title={t('federation.configPage.title', { defaultValue: 'Federation Statutory Configuration' })}
        description={t('federation.configPage.description', { defaultValue: 'Democratic apex parameters strictly limited to statutory wage floors and surplus welfare allocation rules. Free of algorithmic surge modifiers.' })}
        badgeIcon={Sliders}
        badgeText={t('federation.configPage.badge', { defaultValue: 'Democratic Governance' })}
      />

      <ConfigurationPanel />
    </div>
  )
}
