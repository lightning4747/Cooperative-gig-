import { create } from 'zustand'

export type LanguageCode = 'en' | 'hi' | 'ta'

export interface LanguageOption {
  code: LanguageCode
  label: string
  nativeName: string
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்' },
]

interface LanguageState {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: (localStorage.getItem('coop_language') as LanguageCode) || 'en',
  setLanguage: (lang) => {
    localStorage.setItem('coop_language', lang)
    set({ language: lang })
  },
}))
