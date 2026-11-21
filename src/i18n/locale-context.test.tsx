import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useLocale } from './locale-context'

function Probe() {
  useLocale()
  return null
}

describe('useLocale', () => {
  it('refuses to work outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => render(<Probe />)).toThrow('useLocale must be used inside a LocaleProvider')
  })
})
