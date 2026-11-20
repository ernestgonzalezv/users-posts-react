export const LOCALES = ['en', 'es'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_STORAGE_KEY = 'locale'

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value)

export const detectLocale = (stored: string | null, browserLanguages: readonly string[]): Locale => {
  if (isLocale(stored)) {
    return stored
  }
  const spanishFirst = browserLanguages.find((language) => isLocale(language.slice(0, 2).toLowerCase()))
  return spanishFirst === undefined ? DEFAULT_LOCALE : (spanishFirst.slice(0, 2).toLowerCase() as Locale)
}
