import { describe, expect, it } from 'vitest'
import { uniqueById } from './unique'

describe('uniqueById', () => {
  it('keeps the first item of each id in order', () => {
    expect(
      uniqueById([
        { id: 2, n: 'a' },
        { id: 1, n: 'b' },
        { id: 2, n: 'c' },
        { id: 1, n: 'd' },
      ]),
    ).toEqual([
      { id: 2, n: 'a' },
      { id: 1, n: 'b' },
    ])
    expect(uniqueById([])).toEqual([])
  })
})
