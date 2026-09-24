import { useTranslation } from 'react-i18next'
import { HeartHandshake } from 'lucide-react'
import { FederationPageHeader } from '@/components/federation/FederationPageHeader'
import { WelfareAdmin } from '@/components/federation/WelfareAdmin'

export function FederationWelfarePage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <FederationPageHeader
        title={t('federation.welfarePage.title', { defaultValue: 'Worker Welfare Fund' })}
        description={t('federation.welfarePage.description', { defaultValue: 'Collective protection fund supported by extra customer payments while keeping base worker wages 100% protected.' })}
        badgeIcon={HeartHandshake}
        badgeText={t('federation.welfarePage.badge', { defaultValue: 'Protected Wage Guarantee' })}
      />

      <WelfareAdmin />
    </div>
  )
}
