import { createContext, useContext } from 'react'
import type { Locale } from './locale'
import type { Translate } from './translate'

export interface LocaleContextValue {
  readonly locale: Locale
  readonly setLocale: (locale: Locale) => void
  readonly t: Translate
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

export const useLocale = (): LocaleContextValue => {
  const value = useContext(LocaleContext)
  if (value === null) {
    throw new Error('useLocale must be used inside a LocaleProvider')
  }
  return value
}

export const useT = (): Translate => useLocale().t
