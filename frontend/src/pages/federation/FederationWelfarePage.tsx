import { useTranslation } from 'react-i18next'
import { FederationPageHeader } from '@/components/federation/FederationPageHeader'
import { WelfareAdmin } from '@/components/federation/WelfareAdmin'

export function FederationWelfarePage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <FederationPageHeader
        title={t('federation.welfarePage.title', { defaultValue: 'Worker Welfare Fund' })}
        description={t('federation.welfarePage.description', { defaultValue: 'Worker welfare reserves, insurance cover, and surplus contribution records.' })}
      />

      <WelfareAdmin />
    </div>
  )
}
