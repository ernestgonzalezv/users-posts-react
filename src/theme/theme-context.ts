import { createContext, useContext } from 'react'
import type { Theme, ThemeChoice } from './theme'

export interface ThemeContextValue {
  readonly theme: Theme
  readonly choice: ThemeChoice
  readonly setChoice: (choice: ThemeChoice) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export const useTheme = (): ThemeContextValue => {
  const value = useContext(ThemeContext)
  if (value === null) {
    throw new Error('useTheme must be used inside a ThemeProvider')
  }
  return value
}
