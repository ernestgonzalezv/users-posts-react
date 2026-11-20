import { describe, expect, it } from 'vitest'
import type { User } from '../model/user'
import { normalizeText, searchUsers } from './search-users'

const user = (id: number, name: string, username: string): User => ({
  id,
  name,
  username,
  email: `${username.toLowerCase()}@example.com`,
  website: 'example.com',
  company: 'Example',
})

const users = [user(1, 'Leanne Graham', 'Bret'), user(2, 'Ervin Howell', 'Antonette'), user(3, 'Clémentine Bauch', 'Samantha')]

describe('searchUsers', () => {
  it('returns every user for an empty or blank query', () => {
    expect(searchUsers(users, '')).toBe(users)
    expect(searchUsers(users, '   ')).toBe(users)
  })

  it('matches a fragment of the name ignoring case', () => {
    expect(searchUsers(users, 'LEANNE').map((u) => u.id)).toEqual([1])
    expect(searchUsers(users, 'ow').map((u) => u.id)).toEqual([2])
  })

  it('ignores accents on both sides', () => {
    expect(searchUsers(users, 'clementine').map((u) => u.id)).toEqual([3])
    expect(searchUsers(users, 'Érvin').map((u) => u.id)).toEqual([2])
  })

  it('matches the username too', () => {
    expect(searchUsers(users, 'antonette').map((u) => u.id)).toEqual([2])
  })

  it('collapses inner whitespace and trims the query', () => {
    expect(searchUsers(users, '  leanne   graham ').map((u) => u.id)).toEqual([1])
  })

  it('returns nothing when no one matches', () => {
    expect(searchUsers(users, 'zzz')).toEqual([])
  })

  it('normalizes text deterministically', () => {
    expect(normalizeText('  Clémentine   BAUCH ')).toBe('clementine bauch')
  })
})
