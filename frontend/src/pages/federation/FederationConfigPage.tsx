import { useTranslation } from 'react-i18next'
import { FederationPageHeader } from '@/components/federation/FederationPageHeader'
import { ConfigurationPanel } from '@/components/federation/ConfigurationPanel'

export function FederationConfigPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <FederationPageHeader
        title={t('federation.configPage.title', { defaultValue: 'Rates & Welfare Settings' })}
        description={t('federation.configPage.description', { defaultValue: 'Minimum service rates and welfare fund contribution rules.' })}
      />

      <ConfigurationPanel />
    </div>
  )
}
