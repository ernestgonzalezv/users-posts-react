import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { readStorage, writeStorage } from '../core/storage'
import type { ThemeContextValue } from './theme-context'
import { ThemeContext } from './theme-context'
import type { Theme } from './theme'
import { DARK_SCHEME_QUERY, THEME_ATTRIBUTE, THEME_STORAGE_KEY, resolveTheme } from './theme'

interface ThemeProviderProps {
  readonly initialTheme?: Theme
  readonly children: ReactNode
}

const prefersDark = (): boolean => typeof window.matchMedia === 'function' && window.matchMedia(DARK_SCHEME_QUERY).matches

export function ThemeProvider({ initialTheme, children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => initialTheme ?? resolveTheme(readStorage(THEME_STORAGE_KEY), prefersDark()))

  useEffect(() => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, theme)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    writeStorage(THEME_STORAGE_KEY, next)
  }, [])

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme }), [theme, setTheme])

  return <ThemeContext value={value}>{children}</ThemeContext>
}
