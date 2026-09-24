import { useTranslation } from 'react-i18next'
import { MapPin, X } from 'lucide-react'

interface SavedAddressItem {
  id: string
  label: string
  formattedAddress: string
}

interface SavedAddressesModalProps {
  isOpen: boolean
  addresses?: SavedAddressItem[]
  onClose: () => void
}

const DEFAULT_ADDRESSES: SavedAddressItem[] = [
  {
    id: 'addr-1',
    label: 'Home Doorstep',
    formattedAddress: '7th Cross Road, Gandhipuram, Coimbatore - 641012',
  },
  {
    id: 'addr-2',
    label: 'Workspace / Studio',
    formattedAddress: 'DB Road, RS Puram, Coimbatore - 641002',
  },
]

export function SavedAddressesModal({
  isOpen,
  addresses = DEFAULT_ADDRESSES,
  onClose,
}: SavedAddressesModalProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  const displayAddresses = addresses.length > 0 ? addresses : DEFAULT_ADDRESSES

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-5 max-w-md w-full space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              {t('customer.profile.addressModal.title', { defaultValue: 'Saved Service Addresses' })}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {displayAddresses.map((addr) => (
            <div
              key={addr.id}
              className="p-3 rounded-xl border border-border bg-secondary/40 space-y-0.5"
            >
              <span className="font-bold text-foreground block">{t(addr.label, { defaultValue: addr.label })}</span>
              <span className="text-muted-foreground block text-[11px]">{addr.formattedAddress}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-secondary text-foreground font-semibold text-xs border border-border hover:bg-muted cursor-pointer"
        >
          {t('common.done', { defaultValue: 'Done' })}
        </button>
      </div>
    </div>
  )
}
