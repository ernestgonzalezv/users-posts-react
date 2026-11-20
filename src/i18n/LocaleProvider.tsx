import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { readStorage, writeStorage } from '../core/storage'
import { dictionaries } from './dictionaries'
import type { LocaleContextValue } from './locale-context'
import { LocaleContext } from './locale-context'
import type { Locale } from './locale'
import { LOCALE_STORAGE_KEY, detectLocale } from './locale'
import { createTranslate } from './translate'

interface LocaleProviderProps {
  readonly initialLocale?: Locale
  readonly children: ReactNode
}

const resolveInitialLocale = (): Locale => detectLocale(readStorage(LOCALE_STORAGE_KEY), navigator.languages)

export function LocaleProvider({ initialLocale, children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => initialLocale ?? resolveInitialLocale())

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    writeStorage(LOCALE_STORAGE_KEY, next)
  }, [])

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: createTranslate(dictionaries, locale) }),
    [locale, setLocale],
  )

  return <LocaleContext value={value}>{children}</LocaleContext>
}
