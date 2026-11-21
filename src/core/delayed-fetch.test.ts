import { describe, expect, it, vi } from 'vitest'
import { delayedFetch } from './delayed-fetch'
import type { FetchFunction } from './http-client'

describe('delayedFetch', () => {
  it('waits before calling the real fetch', async () => {
    vi.useFakeTimers()
    const inner = vi.fn<FetchFunction>().mockResolvedValue(new Response('[]'))
    const promise = delayedFetch(500, inner)('https://api.test/users')
    expect(inner).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(500)
    expect(inner).toHaveBeenCalledWith('https://api.test/users', undefined)
    await expect(promise).resolves.toBeInstanceOf(Response)
    vi.useRealTimers()
  })

  it('rejects with an abort error and never fetches when aborted while waiting', async () => {
    vi.useFakeTimers()
    const inner = vi.fn<FetchFunction>()
    const controller = new AbortController()
    const promise = delayedFetch(500, inner)('https://api.test/users', { signal: controller.signal })
    controller.abort()
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' })
    await vi.advanceTimersByTimeAsync(500)
    expect(inner).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('uses the global fetch by default', async () => {
    vi.useFakeTimers()
    const globalFetch = vi.fn<FetchFunction>().mockResolvedValue(new Response('[]'))
    vi.stubGlobal('fetch', globalFetch)
    const promise = delayedFetch(10)('https://api.test/users')
    await vi.advanceTimersByTimeAsync(10)
    await expect(promise).resolves.toBeInstanceOf(Response)
    expect(globalFetch).toHaveBeenCalledWith('https://api.test/users', undefined)
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('rejects at once when the signal is already aborted', async () => {
    const inner = vi.fn<FetchFunction>()
    const controller = new AbortController()
    controller.abort()
    await expect(delayedFetch(500, inner)('https://api.test/users', { signal: controller.signal })).rejects.toMatchObject({
      name: 'AbortError',
    })
    expect(inner).not.toHaveBeenCalled()
  })
})
