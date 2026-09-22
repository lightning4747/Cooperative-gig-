import { useTranslation } from 'react-i18next'
import { HeartHandshake } from 'lucide-react'
import { FederationPageHeader } from '@/components/federation/FederationPageHeader'
import { WelfareAdmin } from '@/components/federation/WelfareAdmin'

export function FederationWelfarePage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <FederationPageHeader
        title={t('federation.welfarePage.title', { defaultValue: 'Cooperative Welfare & Social Security Pool' })}
        description={t('federation.welfarePage.description', { defaultValue: 'Aggregated collective protection fund accumulated entirely from customer surplus shares without touching statutory base wage floors.' })}
        badgeIcon={HeartHandshake}
        badgeText={t('federation.welfarePage.badge', { defaultValue: '100% Floor Compliant' })}
      />

      <WelfareAdmin />
    </div>
  )
}
