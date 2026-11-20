import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleProvider'
import { ThemeProvider } from '../../theme/ThemeProvider'
import { ThemeSwitch } from './ThemeSwitch'

const renderSwitch = (locale: 'en' | 'es' = 'en') =>
  render(
    <LocaleProvider initialLocale={locale}>
      <ThemeProvider initialTheme="light">
        <ThemeSwitch />
      </ThemeProvider>
    </LocaleProvider>,
  )

describe('ThemeSwitch', () => {
  it('is a radiogroup with light checked and dark available', () => {
    renderSwitch()
    expect(screen.getByRole('radiogroup', { name: 'Theme' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Dark' })).not.toBeChecked()
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
  })
})
