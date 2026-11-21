import { describe, expect, it, vi } from 'vitest'
import { failFirstFetch } from './fail-first-fetch'
import type { FetchFunction } from './http-client'

describe('failFirstFetch', () => {
  it('rejects the first request to a url and lets the second through', async () => {
    const inner = vi.fn<FetchFunction>().mockResolvedValue(new Response('[]'))
    const fetchFunction = failFirstFetch(inner)
    await expect(fetchFunction('https://api.test/users')).rejects.toBeInstanceOf(TypeError)
    expect(inner).not.toHaveBeenCalled()
    await expect(fetchFunction('https://api.test/users')).resolves.toBeInstanceOf(Response)
    expect(inner).toHaveBeenCalledTimes(1)
  })

  it('uses the global fetch by default', async () => {
    const globalFetch = vi.fn<FetchFunction>().mockResolvedValue(new Response('[]'))
    vi.stubGlobal('fetch', globalFetch)
    const fetchFunction = failFirstFetch()
    await expect(fetchFunction('https://api.test/users')).rejects.toBeInstanceOf(TypeError)
    await expect(fetchFunction('https://api.test/users')).resolves.toBeInstanceOf(Response)
    vi.unstubAllGlobals()
    expect(globalFetch).toHaveBeenCalledTimes(1)
  })

  it('keys by method and url, accepting a URL or a Request', async () => {
    const inner = vi.fn<FetchFunction>().mockResolvedValue(new Response('[]'))
    const fetchFunction = failFirstFetch(inner)
    await expect(fetchFunction(new URL('https://api.test/posts'))).rejects.toBeInstanceOf(TypeError)
    await expect(fetchFunction(new Request('https://api.test/posts'))).resolves.toBeInstanceOf(Response)
    await expect(fetchFunction('https://api.test/posts', { method: 'POST' })).rejects.toBeInstanceOf(TypeError)
    await expect(fetchFunction('https://api.test/posts', { method: 'POST' })).resolves.toBeInstanceOf(Response)
    expect(inner).toHaveBeenCalledTimes(2)
  })
})
