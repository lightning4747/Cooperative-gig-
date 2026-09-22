import { useTranslation } from 'react-i18next'
import { User, X } from 'lucide-react'

interface EditProfileModalProps {
  isOpen: boolean
  name: string
  phone: string
  onNameChange: (val: string) => void
  onPhoneChange: (val: string) => void
  onSave: (e: React.FormEvent) => void
  onClose: () => void
}

export function EditProfileModal({
  isOpen,
  name,
  phone,
  onNameChange,
  onPhoneChange,
  onSave,
  onClose,
}: EditProfileModalProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              {t('customer.profile.editModal.title', { defaultValue: 'Edit Profile' })}
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

        <form onSubmit={onSave} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              {t('customer.profile.editModal.fullName', { defaultValue: 'Full Name' })}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-input text-xs font-medium bg-background"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              {t('customer.profile.editModal.phone', { defaultValue: 'Mobile Phone' })}
            </label>
            <input
              type="tel"
              maxLength={10}
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-input text-xs font-mono bg-background"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary/90 transition-all min-h-[44px]"
          >
            {t('customer.profile.editModal.save', { defaultValue: 'Save Changes' })}
          </button>
        </form>
      </div>
    </div>
  )
}
