import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTheme } from './theme-context'
import { ThemeProvider } from './ThemeProvider'

function Probe() {
  const { theme, choice, setChoice } = useTheme()
  return (
    <>
      <output>
        {choice}/{theme}
      </output>
      <button
        type="button"
        onClick={() => {
          setChoice(choice === 'dark' ? 'light' : 'dark')
        }}
      >
        toggle
      </button>
      <button
        type="button"
        onClick={() => {
          setChoice('system')
        }}
      >
        system
      </button>
    </>
  )
}

const fakeScheme = (matches: boolean) => {
  const listeners = new Set<() => void>()
  const scheme = {
    matches,
    addEventListener: (_type: string, listener: () => void) => {
      listeners.add(listener)
    },
    removeEventListener: (_type: string, listener: () => void) => {
      listeners.delete(listener)
    },
  }
  vi.spyOn(window, 'matchMedia').mockImplementation((query) =>
    query.includes('prefers-color-scheme')
      ? (scheme as unknown as MediaQueryList)
      : ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as MediaQueryList),
  )
  return {
    flip: (next: boolean) => {
      scheme.matches = next
      act(() => {
        for (const listener of listeners) {
          listener()
        }
      })
    },
    listeners,
  }
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')
  })

  it('starts from the stored choice and writes the theme on the root element', () => {
    window.localStorage.setItem('theme', 'dark')
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('dark/dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('follows the system preference when nothing valid is stored', () => {
    window.localStorage.setItem('theme', 'sepia')
    fakeScheme(true)
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('system/dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('follows the system live while the choice is system, and stops when it is explicit', async () => {
    const scheme = fakeScheme(false)
    render(
      <ThemeProvider initialChoice="system">
        <Probe />
      </ThemeProvider>,
    )
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    scheme.flip(true)
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    await userEvent.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByRole('status')).toHaveTextContent('dark/dark')
    scheme.flip(false)
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    await userEvent.click(screen.getByRole('button', { name: 'system' }))
    expect(screen.getByRole('status')).toHaveTextContent('system/light')
    expect(window.localStorage.getItem('theme')).toBe('system')
  })

  it('persists an explicit change and updates the root element', async () => {
    render(
      <ThemeProvider initialChoice="light">
        <Probe />
      </ThemeProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'toggle' }))
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(window.localStorage.getItem('theme')).toBe('dark')
  })

  it('stops listening to the system on unmount', () => {
    const scheme = fakeScheme(false)
    const view = render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    expect(scheme.listeners.size).toBe(1)
    view.unmount()
    expect(scheme.listeners.size).toBe(0)
  })

  it('works with a media query list that cannot be listened to', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(() => ({ matches: true }) as MediaQueryList)
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('system/dark')
  })

  it('works without matchMedia', () => {
    Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: undefined })
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('system/light')
  })

  it('refuses to work outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => render(<Probe />)).toThrow('useTheme must be used inside a ThemeProvider')
  })
})
