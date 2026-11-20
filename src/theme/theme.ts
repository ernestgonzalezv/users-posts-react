export const THEMES = ['light', 'dark'] as const
export type Theme = (typeof THEMES)[number]
export const THEME_STORAGE_KEY = 'theme'
export const THEME_ATTRIBUTE = 'data-theme'
export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)'

export const isTheme = (value: unknown): value is Theme =>
  typeof value === 'string' && (THEMES as readonly string[]).includes(value)

export const resolveTheme = (stored: string | null, prefersDark: boolean): Theme => {
  if (isTheme(stored)) {
    return stored
  }
  return prefersDark ? 'dark' : 'light'
}
