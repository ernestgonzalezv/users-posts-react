import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleProvider'
import { ThemeProvider } from '../../theme/ThemeProvider'
import { AppBar } from './AppBar'

const renderBar = () =>
  render(
    <LocaleProvider initialLocale="en">
      <ThemeProvider initialTheme="light">
        <AppBar />
      </ThemeProvider>
    </LocaleProvider>,
  )

describe('AppBar', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.lang = ''
  })

  it('shows the title in the active language', () => {
    renderBar()
    expect(screen.getByRole('heading', { level: 1, name: 'Users & Posts' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
  })

  it('switches every text, the html lang and the stored locale when spanish is chosen', async () => {
    renderBar()
    await userEvent.click(screen.getByRole('radio', { name: 'Spanish' }))
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Usuarios y publicaciones',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Idioma' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Español' })).toBeChecked()
    expect(document.documentElement.lang).toBe('es')
    expect(window.localStorage.getItem('locale')).toBe('es')
  })

  it('moves the selection with the arrow keys and wraps around', async () => {
    renderBar()
    screen.getByRole('radio', { name: 'English' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'Español' })).toBeChecked()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'English' })).toBeChecked()
    await userEvent.keyboard('{ArrowLeft}')
    expect(screen.getByRole('radio', { name: 'Español' })).toBeChecked()
  })

  it('reads the stored locale when no initial value is given', () => {
    window.localStorage.setItem('locale', 'es')
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US'])
    render(
      <LocaleProvider>
        <ThemeProvider initialTheme="light">
          <AppBar />
        </ThemeProvider>
      </LocaleProvider>,
    )
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Usuarios y publicaciones',
      }),
    ).toBeInTheDocument()
  })

  it('follows the browser language when nothing is stored', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-MX', 'en-US'])
    render(
      <LocaleProvider>
        <ThemeProvider initialTheme="light">
          <AppBar />
        </ThemeProvider>
      </LocaleProvider>,
    )
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Usuarios y publicaciones',
      }),
    ).toBeInTheDocument()
  })
})
