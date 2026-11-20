import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleProvider'
import { ThemeProvider } from '../../theme/ThemeProvider'
import { AppBar } from './AppBar'

const renderBar = () =>
  render(
    <ThemeProvider initialTheme="light">
      <LocaleProvider initialLocale="en">
        <AppBar />
      </LocaleProvider>
    </ThemeProvider>,
  )

describe('AppBar', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.lang = ''
    document.documentElement.removeAttribute('data-theme')
  })

  it('shows the title in the active language', () => {
    renderBar()
    expect(screen.getByRole('heading', { level: 1, name: 'Users & Posts' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
  })

  it('switches every text, the html lang and the stored locale when spanish is chosen', async () => {
    renderBar()
    await userEvent.click(screen.getByRole('radio', { name: 'Spanish' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Usuarios y publicaciones' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Idioma' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Español' })).toBeChecked()
    expect(document.documentElement.lang).toBe('es')
    expect(window.localStorage.getItem('locale')).toBe('es')
  })

  it('switches the theme attribute and stores the choice', async () => {
    renderBar()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    await userEvent.click(screen.getByRole('radio', { name: 'Dark theme' }))
    expect(screen.getByRole('radio', { name: 'Dark theme' })).toBeChecked()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(window.localStorage.getItem('theme')).toBe('dark')
  })

  it('moves the selection with the arrow keys inside a switch', async () => {
    renderBar()
    const english = screen.getByRole('radio', { name: 'English' })
    english.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'Español' })).toBeChecked()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'English' })).toBeChecked()
  })

  it('reads the stored locale and theme when no initial value is given', () => {
    window.localStorage.setItem('locale', 'es')
    window.localStorage.setItem('theme', 'dark')
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US'])
    render(
      <ThemeProvider>
        <LocaleProvider>
          <AppBar />
        </LocaleProvider>
      </ThemeProvider>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Usuarios y publicaciones' })).toBeInTheDocument()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('follows the browser language when nothing is stored', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-MX', 'en-US'])
    render(
      <ThemeProvider initialTheme="light">
        <LocaleProvider>
          <AppBar />
        </LocaleProvider>
      </ThemeProvider>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Usuarios y publicaciones' })).toBeInTheDocument()
  })
})
