export const THEMES = ['light', 'dark'] as const
export type Theme = (typeof THEMES)[number]
export const THEME_CHOICES = ['light', 'dark', 'system'] as const
export type ThemeChoice = (typeof THEME_CHOICES)[number]
export const THEME_STORAGE_KEY = 'theme'
export const THEME_ATTRIBUTE = 'data-theme'
export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)'

export const isTheme = (value: unknown): value is Theme =>
  typeof value === 'string' && (THEMES as readonly string[]).includes(value)

export const isThemeChoice = (value: unknown): value is ThemeChoice =>
  typeof value === 'string' && (THEME_CHOICES as readonly string[]).includes(value)

export const choiceFrom = (stored: string | null): ThemeChoice => (isThemeChoice(stored) ? stored : 'system')

export const resolveTheme = (choice: ThemeChoice, prefersDark: boolean): Theme =>
  choice === 'system' ? (prefersDark ? 'dark' : 'light') : choice
