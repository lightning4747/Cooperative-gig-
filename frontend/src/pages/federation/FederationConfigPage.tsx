import { useTranslation } from 'react-i18next'
import { Sliders } from 'lucide-react'
import { FederationPageHeader } from '@/components/federation/FederationPageHeader'
import { ConfigurationPanel } from '@/components/federation/ConfigurationPanel'

export function FederationConfigPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <FederationPageHeader
        title={t('federation.configPage.title', { defaultValue: 'Rates & Welfare Settings' })}
        description={t('federation.configPage.description', { defaultValue: 'Manage minimum service rates and welfare fund contribution rules across member cooperatives.' })}
        badgeIcon={Sliders}
        badgeText={t('federation.configPage.badge', { defaultValue: 'Fair Wage Rules' })}
      />

      <ConfigurationPanel />
    </div>
  )
}
