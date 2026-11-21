import { describe, expect, it } from 'vitest'
import { parseRoute, pathOf, sameRoute } from './route'

describe('parseRoute', () => {
  it('reads the home and a user id', () => {
    expect(parseRoute('/')).toEqual({ kind: 'home' })
    expect(parseRoute('')).toEqual({ kind: 'home' })
    expect(parseRoute('/users/3')).toEqual({ kind: 'user', id: 3 })
    expect(parseRoute('/users/3/')).toEqual({ kind: 'user', id: 3 })
    expect(parseRoute('/users/000123456')).toEqual({ kind: 'user', id: 123456 })
    expect(parseRoute('/users/0')).toEqual({ kind: 'user', id: 0 })
    expect(parseRoute('/users/-1')).toEqual({ kind: 'user', id: -1 })
    expect(parseRoute('/users/1234567890')).toEqual({ kind: 'user', id: 1234567890 })
  })

  it.each(['/users', '/users/', '/USERS/1', '/posts/1', '/foo', '/users-and-posts'])('treats %s as home', (path) => {
    expect(parseRoute(path)).toEqual({ kind: 'home' })
  })

  it.each([
    '/users/abc',
    '/users/1.5',
    '/users/--1',
    '/users/1e3',
    '/users/9007199254740993',
    '/users/123456789012345678',
    '/users/1/posts',
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
