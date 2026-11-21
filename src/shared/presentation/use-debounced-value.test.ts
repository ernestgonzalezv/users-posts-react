import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedValue } from './use-debounced-value'

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with the first value', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 300))
    expect(result.current).toBe('a')
  })

  it('only settles after the delay has passed without changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), { initialProps: { value: 'a' } })
    rerender({ value: 'ab' })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current).toBe('a')
    rerender({ value: 'abc' })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current).toBe('a')
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe('abc')
  })

  it('drops a pending value when unmounted', () => {
    const { result, rerender, unmount } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'a' },
    })
    rerender({ value: 'b' })
    unmount()
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current).toBe('a')
  })
})

describe('useDebouncedValue with an immediate predicate', () => {
  it('settles at once when the predicate says so', () => {
    vi.useFakeTimers()
    try {
      const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300, (v) => v === ''), {
        initialProps: { value: 'abc' },
      })
      rerender({ value: '' })
      act(() => {
        vi.advanceTimersByTime(0)
      })
      expect(result.current).toBe('')
    } finally {
      vi.useRealTimers()
    }
  })
})
