import { describe, expect, it } from 'vitest'
import { dictionaries } from './dictionaries'
import { counted, createTranslate, format } from './translate'

describe('format', () => {
  it('replaces every placeholder with its value', () => {
    expect(format('{count} posts by {name}', { count: 3, name: 'Leanne' })).toBe('3 posts by Leanne')
  })

  it('leaves a placeholder in place when no value is given', () => {
    expect(format('{count} posts', {})).toBe('{count} posts')
  })

  it('returns a template without placeholders untouched', () => {
    expect(format('Users')).toBe('Users')
  })
})

describe('createTranslate', () => {
  it('reads from the dictionary of the given locale', () => {
    expect(createTranslate(dictionaries, 'en')('language.es')).toBe('Spanish')
    expect(createTranslate(dictionaries, 'es')('language.es')).toBe('Español')
  })
})

describe('counted', () => {
  it('picks the singular form only for exactly one', () => {
    const t = createTranslate(dictionaries, 'en')
    expect(counted(t, 'posts.count', 0)).toBe('0 posts')
    expect(counted(t, 'posts.count', 1)).toBe('1 post')
    expect(counted(t, 'users.count', 2)).toBe('2 users')
    expect(counted(createTranslate(dictionaries, 'es'), 'posts.count', 1)).toBe('1 publicación')
  })
})
