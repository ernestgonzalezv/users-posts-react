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

  it('honours a custom base url', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(new Response('[]'))
    await createContainer({ baseUrl: 'http://localhost:9999/', fetchFunction }).getUsers.execute()
    expect(fetchFunction.mock.calls[0]![0]).toBe('http://localhost:9999/users')
  })
})
