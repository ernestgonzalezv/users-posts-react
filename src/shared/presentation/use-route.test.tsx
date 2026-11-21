import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useRoute } from './use-route'

describe('useRoute', () => {
  it('starts from the current address', () => {
    window.history.replaceState(null, '', '/users/2')
    const { result } = renderHook(() => useRoute())
    expect(result.current.route).toEqual({ kind: 'user', id: 2 })
  })

  it('pushes a history entry on navigate and replaces when asked', () => {
    const { result } = renderHook(() => useRoute())
    const before = window.history.length
    act(() => {
      result.current.navigate({ kind: 'user', id: 5 })
    })
    expect(window.location.pathname).toBe('/users/5')
    expect(result.current.route).toEqual({ kind: 'user', id: 5 })
    expect(window.history.length).toBe(before + 1)
    act(() => {
      result.current.navigate({ kind: 'home' }, { replace: true })
    })
    expect(window.location.pathname).toBe('/')
    expect(window.history.length).toBe(before + 1)
  })

  it('ignores a navigation to the address already shown', () => {
    const { result } = renderHook(() => useRoute())
    const before = window.history.length
    act(() => {
      result.current.navigate({ kind: 'home' })
    })
    expect(window.history.length).toBe(before)
  })

  it('follows the browser back and forward buttons', () => {
    const { result } = renderHook(() => useRoute())
    act(() => {
      result.current.navigate({ kind: 'user', id: 9 })
    })
    act(() => {
      window.history.replaceState(null, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(result.current.route).toEqual({ kind: 'home' })
  })
})
