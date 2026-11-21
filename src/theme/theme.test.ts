import { describe, expect, it } from 'vitest'
import { choiceFrom, isTheme, isThemeChoice, resolveTheme } from './theme'

describe('choiceFrom', () => {
  it('keeps a stored choice and falls back to system for anything else', () => {
    expect(choiceFrom('light')).toBe('light')
    expect(choiceFrom('dark')).toBe('dark')
    expect(choiceFrom('system')).toBe('system')
    expect(choiceFrom(null)).toBe('system')
    expect(choiceFrom('sepia')).toBe('system')
  })
})

describe('resolveTheme', () => {
  it('honours an explicit choice over the system preference', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('follows the system when the choice is system', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
  })

  it('recognises the two themes and the three choices', () => {
    expect(isTheme('dark')).toBe(true)
    expect(isTheme('system')).toBe(false)
    expect(isThemeChoice('system')).toBe(true)
    expect(isThemeChoice('auto')).toBe(false)
    expect(isTheme(1)).toBe(false)
  })
})
