import { describe, expect, it, vi } from 'vitest'
import type { FetchFunction } from '../core/http-client'
import { createContainer } from './container'

describe('createContainer', () => {
  it('wires the users use case to the JSONPlaceholder base url by default', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(new Response('[]'))
    await createContainer({ fetchFunction }).getUsers.execute()
    expect(fetchFunction.mock.calls[0]![0]).toBe('https://jsonplaceholder.typicode.com/users')
  })

  it('wires the posts use case to the same client', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(new Response('[]'))
    await createContainer({ fetchFunction }).getUserPosts.execute(4)
    expect(fetchFunction.mock.calls[0]![0]).toBe('https://jsonplaceholder.typicode.com/posts?userId=4')
  })

  it('falls back to the global fetch', async () => {
    const globalFetch = vi.fn<FetchFunction>().mockResolvedValue(new Response('[]'))
    vi.stubGlobal('fetch', globalFetch)
    const result = await createContainer().getUsers.execute()
    vi.unstubAllGlobals()
    expect(result).toEqual({ ok: true, value: [] })
    expect(globalFetch.mock.calls[0]![0]).toBe('https://jsonplaceholder.typicode.com/users')
  })

  it('honours a custom timeout', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'))
          })
        }),
    )
    const result = await createContainer({ fetchFunction, timeoutMs: 5 }).getUsers.execute()
    expect(result).toEqual({ ok: false, error: { kind: 'timeout' } })
  })

  it('honours a custom base url', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(new Response('[]'))
    await createContainer({ baseUrl: 'http://localhost:9999/', fetchFunction }).getUsers.execute()
    expect(fetchFunction.mock.calls[0]![0]).toBe('http://localhost:9999/users')
  })
})
