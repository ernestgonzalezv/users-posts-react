import { describe, expect, it } from 'vitest'
import { detectLocale, isLocale } from './locale'

describe('detectLocale', () => {
  it('uses the stored locale when it is valid', () => {
    expect(detectLocale('es', ['en-US'])).toBe('es')
  })

  it('ignores a stored value that is not a supported locale', () => {
    expect(detectLocale('fr', ['es-MX'])).toBe('es')
  })

  it('takes the first browser language that is supported', () => {
    expect(detectLocale(null, ['fr-FR', 'es-MX', 'en-US'])).toBe('es')
    expect(detectLocale(null, ['EN-gb', 'es'])).toBe('en')
  })

  it('falls back to english when nothing matches', () => {
    expect(detectLocale(null, ['fr-FR', 'de'])).toBe('en')
    expect(detectLocale(null, [])).toBe('en')
  })
})

describe('isLocale', () => {
  it('accepts only the supported locales', () => {
    expect(isLocale('en')).toBe(true)
    expect(isLocale('es')).toBe(true)
    expect(isLocale('pt')).toBe(false)
    expect(isLocale(3)).toBe(false)
  })
})
