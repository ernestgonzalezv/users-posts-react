import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTheme } from './theme-context'
import { ThemeProvider } from './ThemeProvider'

function Probe() {
  const { theme, setTheme } = useTheme()
  return (
    <button
      type="button"
      onClick={() => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
      }}
    >
      {theme}
    </button>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('starts from the stored theme and writes it on the root element', () => {
    window.localStorage.setItem('theme', 'dark')
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    expect(screen.getByRole('button')).toHaveTextContent('dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('follows the system preference when nothing is stored', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValueOnce({ matches: true } as MediaQueryList)
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('persists a change and updates the root element', async () => {
    render(
      <ThemeProvider initialTheme="light">
        <Probe />
      </ThemeProvider>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(window.localStorage.getItem('theme')).toBe('dark')
  })

  it('refuses to work outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => render(<Probe />)).toThrow('useTheme must be used inside a ThemeProvider')
  })
})
