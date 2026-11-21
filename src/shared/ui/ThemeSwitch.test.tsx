import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleProvider'
import { ThemeProvider } from '../../theme/ThemeProvider'
import { ThemeSwitch } from './ThemeSwitch'

const renderSwitch = (locale: 'en' | 'es' = 'en') =>
  render(
    <LocaleProvider initialLocale={locale}>
      <ThemeProvider initialChoice="light">
        <ThemeSwitch />
      </ThemeProvider>
    </LocaleProvider>,
  )

describe('ThemeSwitch', () => {
  it('is a radiogroup with light checked and dark and system available', () => {
    renderSwitch()
    expect(screen.getByRole('radiogroup', { name: 'Theme' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Dark' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'System' })).not.toBeChecked()
  })

  it('follows the system when that option is chosen', async () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query) =>
        ({
          matches: query.includes('prefers-color-scheme'),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    )
    renderSwitch()
    await userEvent.click(screen.getByRole('radio', { name: 'System' }))
    expect(screen.getByRole('radio', { name: 'System' })).toBeChecked()
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(window.localStorage.getItem('theme')).toBe('system')
  })

  it('switches to dark on click and on arrow keys', async () => {
    renderSwitch()
    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }))
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    await userEvent.keyboard('{ArrowLeft}')
    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked()
  })

  it('names the options in Spanish', () => {
    renderSwitch('es')
    expect(screen.getByRole('radiogroup', { name: 'Tema' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Oscuro' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Sistema' })).toBeInTheDocument()
  })
})
