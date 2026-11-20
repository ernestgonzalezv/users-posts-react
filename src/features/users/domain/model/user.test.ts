import { describe, expect, it } from 'vitest'
import { initialsOf } from './user'

describe('initialsOf', () => {
  it('takes the first letter of the first two words', () => {
    expect(initialsOf('Leanne Graham')).toBe('LG')
    expect(initialsOf('Mrs. Dennis Schulist')).toBe('MD')
  })

  it('skips parts that do not start with a letter and upper-cases', () => {
    expect(initialsOf('  élodie   de-la-cruz ')).toBe('ÉD')
    expect(initialsOf('123 Ervin')).toBe('E')
  })

  it('returns an empty string for an empty name', () => {
    expect(initialsOf('   ')).toBe('')
  })
})
