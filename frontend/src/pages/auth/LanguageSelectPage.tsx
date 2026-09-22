import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Check } from 'lucide-react'
import { useLanguageStore, type LanguageCode } from '@/store/languageStore'
import { cn } from '@/lib/utils'

interface LanguageOption {
  code: LanguageCode
  name: string
  nativeName: string
  scriptHint: string
}

const LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    scriptHint: 'Official working language',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    scriptHint: 'देवनागरी लिपि',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    scriptHint: 'தமிழ் எழுத்துமுறை',
  },
]

export function LanguageSelectPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { language, setLanguage } = useLanguageStore()

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code)
    i18n.changeLanguage(code)
  }

  const handleContinue = () => {
    navigate('/login')
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t('auth.selectLanguage', { defaultValue: 'Select Language' })}
        </h1>
      </div>

      <div className="space-y-2.5">
        {LANGUAGES.map((item) => {
          const isSelected = language === item.code
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => handleSelect(item.code)}
              className={cn(
                'w-full flex items-center justify-between p-4 rounded-lg border text-left transition-all min-h-[64px]',
                isSelected
                  ? 'border-[#F2B705] bg-[#FFFBEB] ring-1 ring-[#F2B705]'
                  : 'border-border bg-card hover:bg-slate-50/80 hover:border-slate-300'
              )}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-foreground">
                    {item.nativeName}
                  </span>
                  {item.nativeName !== item.name && (
                    <span className="text-xs text-muted-foreground font-medium">
                      ({item.name})
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground block">
                  {item.scriptHint}
                </span>
              </div>
              {isSelected ? (
                <div className="w-6 h-6 rounded-full bg-[#F2B705] text-[#0F172A] flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border border-slate-300 shrink-0" />
              )}
            </button>
          )
        })}
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-xs hover:bg-[#D99A00] active:scale-[0.99] transition-all min-h-[48px]"
        >
          <span>{t('common.confirm', { defaultValue: 'Continue' })}</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  )
}
