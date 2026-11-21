import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useContainer } from './container-context'

function Probe() {
  useContainer()
  return null
}

describe('useContainer', () => {
  it('refuses to work outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => render(<Probe />)).toThrow('useContainer must be used inside a ContainerProvider')
  })
})
