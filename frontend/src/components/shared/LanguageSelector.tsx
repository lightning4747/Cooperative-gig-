import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { useLanguageStore, type LanguageCode } from '@/store/languageStore'
import { cn } from '@/lib/utils'

interface LanguageSelectorProps {
  className?: string
  showIcon?: boolean
}

const LANGUAGES: { code: LanguageCode; label: string; shortLabel: string; nativeName: string }[] = [
  { code: 'en', label: 'English', shortLabel: 'EN', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', shortLabel: 'हि', nativeName: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', shortLabel: 'த', nativeName: 'தமிழ்' },
]

export function LanguageSelector({
  className,
  showIcon = false,
}: LanguageSelectorProps) {
  const { i18n } = useTranslation()
  const { language, setLanguage } = useLanguageStore()

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code)
    i18n.changeLanguage(code)
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 p-0.5 sm:p-1 rounded-xl bg-secondary/80 border border-border shrink-0',
        className
      )}
    >
      {showIcon && <Globe className="w-3.5 h-3.5 mx-1 text-muted-foreground shrink-0 hidden xs:block" />}
      {LANGUAGES.map((lang) => {
        const isActive = language === lang.code
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => handleSelect(lang.code)}
            className={cn(
              'px-2 py-1 rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-1 focus:ring-primary shrink-0 min-w-[28px]',
              isActive
                ? 'bg-card text-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title={lang.label}
          >
            <span className="inline sm:hidden">{lang.shortLabel}</span>
            <span className="hidden sm:inline">{lang.nativeName}</span>
          </button>
        )
      })}
    </div>
  )
}
