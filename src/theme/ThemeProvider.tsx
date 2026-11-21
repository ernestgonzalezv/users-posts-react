import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { readStorage, writeStorage } from '../core/storage'
import type { ThemeContextValue } from './theme-context'
import { ThemeContext } from './theme-context'
import type { ThemeChoice } from './theme'
import { DARK_SCHEME_QUERY, THEME_ATTRIBUTE, THEME_STORAGE_KEY, choiceFrom, resolveTheme } from './theme'

interface ThemeProviderProps {
  readonly initialChoice?: ThemeChoice
  readonly children: ReactNode
}

const darkScheme = (): MediaQueryList | null =>
  typeof window.matchMedia === 'function' ? window.matchMedia(DARK_SCHEME_QUERY) : null

const readPrefersDark = (): boolean => darkScheme()?.matches === true

const subscribeToScheme = (listener: () => void): (() => void) => {
  const scheme = darkScheme()
  if (scheme === null || typeof scheme.addEventListener !== 'function') {
    return () => undefined
  }
  scheme.addEventListener('change', listener)
  return () => {
    scheme.removeEventListener('change', listener)
  }
}

export function ThemeProvider({ initialChoice, children }: ThemeProviderProps) {
  const [choice, setChoiceState] = useState<ThemeChoice>(() => initialChoice ?? choiceFrom(readStorage(THEME_STORAGE_KEY)))
  const prefersDark = useSyncExternalStore(subscribeToScheme, readPrefersDark, () => false)
  const theme = resolveTheme(choice, prefersDark)

  useEffect(() => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, theme)
  }, [theme])

  const setChoice = useCallback((next: ThemeChoice) => {
    setChoiceState(next)
    writeStorage(THEME_STORAGE_KEY, next)
  }, [])

  const value = useMemo<ThemeContextValue>(() => ({ theme, choice, setChoice }), [theme, choice, setChoice])

  return <ThemeContext value={value}>{children}</ThemeContext>
}
