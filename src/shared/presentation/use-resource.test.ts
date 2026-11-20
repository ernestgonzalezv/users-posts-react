import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { httpError } from '../../core/app-error'
import type { Result } from '../../core/result'
import { failure, success } from '../../core/result'
import type { Loader } from './use-resource'
import { useResource } from './use-resource'

interface Deferred<T> {
  readonly loader: Loader<T>
  readonly resolve: (result: Result<T>) => void
  readonly signals: AbortSignal[]
}

const deferred = <T>(): Deferred<T> => {
  const signals: AbortSignal[] = []
  let resolve: (result: Result<T>) => void = () => undefined
  const promise = new Promise<Result<T>>((done) => {
    resolve = done
  })
  const loader: Loader<T> = (signal) => {
    signals.push(signal)
    return promise
  }
  return { loader, resolve, signals }
}

const flush = () => act(async () => Promise.resolve())

const settleWith = <T>(request: Deferred<T>, result: Result<T>) =>
  act(async () => {
    request.resolve(result)
    await Promise.resolve()
  })

describe('useResource', () => {
  it('is idle when there is nothing to load', () => {
    const { result } = renderHook(() => useResource<string[]>(null))
    expect(result.current.state).toEqual({ status: 'idle' })
  })

  it('is loading until the loader settles, then success', async () => {
    const request = deferred<string[]>()
    const { result } = renderHook(() => useResource(request.loader))
    expect(result.current.state).toEqual({ status: 'loading' })
    await settleWith(request, success(['a']))
    expect(result.current.state).toEqual({ status: 'success', data: ['a'] })
  })

  it('reports empty for an empty list', async () => {
    const request = deferred<string[]>()
    const { result } = renderHook(() => useResource(request.loader))
    await settleWith(request, success([]))
    expect(result.current.state).toEqual({ status: 'empty' })
  })

  it('reports the error of a failure', async () => {
    const request = deferred<string[]>()
    const { result } = renderHook(() => useResource(request.loader))
    await settleWith(request, failure(httpError(503)))
    expect(result.current.state).toEqual({ status: 'error', error: { kind: 'http', status: 503 } })
  })

  it('aborts the previous request and ignores its late answer when the loader changes', async () => {
    const first = deferred<string[]>()
    const second = deferred<string[]>()
    const { result, rerender } = renderHook(({ loader }) => useResource(loader), { initialProps: { loader: first.loader } })
    rerender({ loader: second.loader })
    expect(first.signals[0]?.aborted).toBe(true)
    expect(result.current.state).toEqual({ status: 'loading' })
    await settleWith(first, success(['stale']))
    expect(result.current.state).toEqual({ status: 'loading' })
    await settleWith(second, success(['fresh']))
    expect(result.current.state).toEqual({ status: 'success', data: ['fresh'] })
  })

  it('goes back to loading and calls the loader again on reload', async () => {
    let calls = 0
    const loader: Loader<string[]> = () => {
      calls += 1
      return Promise.resolve(calls === 1 ? failure(httpError(500)) : success(['ok']))
    }
    const { result } = renderHook(() => useResource(loader))
    await flush()
    expect(result.current.state.status).toBe('error')
    act(() => {
      result.current.reload()
    })
    expect(result.current.state).toEqual({ status: 'loading' })
    await flush()
    expect(result.current.state).toEqual({ status: 'success', data: ['ok'] })
    expect(calls).toBe(2)
  })

  it('aborts the request on unmount', () => {
    const request = deferred<string[]>()
    const { unmount } = renderHook(() => useResource(request.loader))
    unmount()
    expect(request.signals[0]?.aborted).toBe(true)
  })

  it('uses a custom emptiness check', async () => {
    const request = deferred<{ items: number[] }>()
    const { result } = renderHook(() => useResource(request.loader, (value) => value.items.length === 0))
    await settleWith(request, success({ items: [] }))
    expect(result.current.state).toEqual({ status: 'empty' })
  })
})
