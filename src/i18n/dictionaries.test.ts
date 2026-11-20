import { describe, expect, it } from 'vitest'
import { dictionaries } from './dictionaries'
import { en } from './en'
import type { MessageKey } from './translate'
import { PLACEHOLDER_PATTERN } from './translate'

const placeholdersOf = (template: string): string[] => [...template.matchAll(PLACEHOLDER_PATTERN)].map((m) => m[1] ?? '').sort()

describe('dictionaries', () => {
  const keys = Object.keys(en) as MessageKey[]

  it('has the same keys in every language', () => {
    expect(Object.keys(dictionaries.es).sort()).toEqual([...keys].sort())
  })

  it('uses the same placeholders in every language', () => {
    for (const key of keys) {
      expect(placeholdersOf(dictionaries.es[key]), key).toEqual(placeholdersOf(en[key]))
    }
  })

  it('has no empty message', () => {
    for (const key of keys) {
      expect(dictionaries.en[key].trim(), key).not.toBe('')
      expect(dictionaries.es[key].trim(), key).not.toBe('')
    }
  })
})
