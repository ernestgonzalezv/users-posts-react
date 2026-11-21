import { describe, expect, it, vi } from 'vitest'
import { readStorage, writeStorage } from './storage'

describe('storage', () => {
  it('reads and writes local storage', () => {
    writeStorage('k', 'v')
    expect(readStorage('k')).toBe('v')
    expect(readStorage('missing')).toBeNull()
  })

  it('swallows a storage that throws, reading null and writing nothing', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    expect(readStorage('k')).toBeNull()
    expect(() => {
      writeStorage('k', 'v')
    }).not.toThrow()
  })
})
