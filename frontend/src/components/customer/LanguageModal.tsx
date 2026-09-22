import { useTranslation } from 'react-i18next'
import { Globe, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type LanguageCode, LANGUAGES } from '@/store/languageStore'

interface LanguageModalProps {
  isOpen: boolean
  currentLanguage: LanguageCode
  onSelectLanguage: (code: LanguageCode) => void
  onClose: () => void
}

export function LanguageModal({
  isOpen,
  currentLanguage,
  onSelectLanguage,
  onClose,
}: LanguageModalProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              {t('customer.profile.languageModal.title', { defaultValue: 'Select Interface Language' })}
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

        <div className="space-y-2">
          {LANGUAGES.map((lang) => {
            const isSelected = currentLanguage === lang.code
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => onSelectLanguage(lang.code)}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all',
                  isSelected
                    ? 'border-primary bg-primary/10 text-foreground font-bold'
                    : 'border-border hover:bg-muted/50 text-muted-foreground'
                )}
              >
                <span>
                  {lang.nativeName} ({lang.label})
                </span>
                {isSelected && <Check className="w-4 h-4 text-primary" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
