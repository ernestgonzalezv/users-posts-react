import { describe, expect, it } from 'vitest'
import { resolveTheme } from './theme'

describe('resolveTheme', () => {
  it('uses the stored theme when it is valid', () => {
    expect(resolveTheme('dark', false)).toBe('dark')
    expect(resolveTheme('light', true)).toBe('light')
  })

  it('follows the system preference when nothing valid is stored', () => {
    expect(resolveTheme(null, true)).toBe('dark')
    expect(resolveTheme('blue', false)).toBe('light')
  })
})
