import { describe, expect, it } from 'vitest'
import { isPostDto, isPostDtoList } from './post-dto'

describe('isPostDto', () => {
  it('accepts the JSONPlaceholder shape', () => {
    expect(isPostDto({ id: 1, userId: 1, title: 'a', body: 'b' })).toBe(true)
  })

  it('rejects a missing or mistyped field', () => {
    expect(isPostDto({ id: 1, userId: '1', title: 'a', body: 'b' })).toBe(false)
    expect(isPostDto({ id: 1, userId: 1, title: 'a' })).toBe(false)
    expect(isPostDto(null)).toBe(false)
  })

  it('checks every item of a list', () => {
    expect(isPostDtoList([{ id: 1, userId: 1, title: 'a', body: 'b' }, { id: 2 }])).toBe(false)
    expect(isPostDtoList([])).toBe(true)
  })
})
