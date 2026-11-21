import { describe, expect, it } from 'vitest'
import { parseRoute, pathOf, sameRoute } from './route'

describe('parseRoute', () => {
  it('reads the home and a user id', () => {
    expect(parseRoute('/')).toEqual({ kind: 'home' })
    expect(parseRoute('')).toEqual({ kind: 'home' })
    expect(parseRoute('/users/3')).toEqual({ kind: 'user', id: 3 })
    expect(parseRoute('/users/3/')).toEqual({ kind: 'user', id: 3 })
    expect(parseRoute('/users/000123456')).toEqual({ kind: 'user', id: 123456 })
  })

  it.each([
    '/users',
    '/users/',
    '/users/abc',
    '/users/-1',
    '/users/1.5',
    '/users/0',
    '/users/1e3',
    '/USERS/1',
    '/users/1/posts',
    '/posts/1',
    '/users/1234567890',
    '/users/%31',
    '/users/1?x=1',
  ])('treats %s as unknown', (path) => {
    expect(parseRoute(path)).toEqual({ kind: 'unknown' })
  })
})

describe('pathOf and sameRoute', () => {
  it('writes the path of every route and compares them', () => {
    expect(pathOf({ kind: 'home' })).toBe('/')
    expect(pathOf({ kind: 'unknown' })).toBe('/')
    expect(pathOf({ kind: 'user', id: 7 })).toBe('/users/7')
    expect(sameRoute({ kind: 'user', id: 7 }, { kind: 'user', id: 7 })).toBe(true)
    expect(sameRoute({ kind: 'user', id: 7 }, { kind: 'user', id: 8 })).toBe(false)
    expect(sameRoute({ kind: 'home' }, { kind: 'unknown' })).toBe(false)
  })
})
