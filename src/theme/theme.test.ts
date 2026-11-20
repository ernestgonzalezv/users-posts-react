import { describe, expect, it } from 'vitest'
import { isTheme, resolveTheme } from './theme'

describe('resolveTheme', () => {
  it('honours a stored choice over the system preference', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('follows the system when nothing valid is stored', () => {
    expect(resolveTheme(null, true)).toBe('dark')
    expect(resolveTheme('sepia', false)).toBe('light')
  })

  it('recognises only the two themes', () => {
    expect(isTheme('dark')).toBe(true)
    expect(isTheme('auto')).toBe(false)
    expect(isTheme(1)).toBe(false)
  })
})
