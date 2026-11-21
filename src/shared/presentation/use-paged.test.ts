import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePaged } from './use-paged'

const numbers = (count: number): readonly number[] => Array.from({ length: count }, (_, index) => index + 1)

describe('usePaged', () => {
  it('shows the first page and how many are hidden', () => {
    const { result } = renderHook(() => usePaged(numbers(45), 20))
    expect(result.current.shown).toHaveLength(20)
    expect(result.current.hidden).toBe(25)
  })

  it('opens one more page at a time until nothing is hidden', () => {
    const items = numbers(45)
    const { result } = renderHook(() => usePaged(items, 20))
    act(() => {
      result.current.showMore()
    })
    expect(result.current.shown).toHaveLength(40)
    expect(result.current.hidden).toBe(5)
    act(() => {
      result.current.showMore()
    })
    expect(result.current.shown).toEqual(items)
    expect(result.current.hidden).toBe(0)
  })

  it('goes back to the first page when the items change', () => {
    const first = numbers(45)
    const { result, rerender } = renderHook(({ items }) => usePaged(items, 20), { initialProps: { items: first } })
    act(() => {
      result.current.showMore()
    })
    rerender({ items: numbers(30) })
    expect(result.current.shown).toHaveLength(20)
    expect(result.current.hidden).toBe(10)
  })

  it('handles an empty list and a list shorter than a page', () => {
    expect(renderHook(() => usePaged([], 20)).result.current).toMatchObject({ shown: [], hidden: 0 })
    expect(renderHook(() => usePaged(numbers(3), 20)).result.current).toMatchObject({ shown: [1, 2, 3], hidden: 0 })
  })
})
