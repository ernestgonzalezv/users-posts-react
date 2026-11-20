import { describe, expect, it, vi } from 'vitest'
import type { FetchFunction } from '../../../../core/http-client'
import { HttpClient } from '../../../../core/http-client'
import { HttpPostRepository } from './http-post-repository'

const posts = [
  { id: 1, userId: 3, title: '  sunt aut facere ', body: 'quia et suscipit\n' },
  { id: 2, userId: 3, title: 'qui est esse', body: 'est rerum tempore' },
]

const repositoryWith = (fetchFunction: FetchFunction) =>
  new HttpPostRepository(new HttpClient({ baseUrl: 'https://api.test', fetchFunction }))

describe('HttpPostRepository', () => {
  it('requests the posts of that user and trims title and body', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(new Response(JSON.stringify(posts)))
    const result = await repositoryWith(fetchFunction).getByUser(3)
    expect(fetchFunction.mock.calls[0]![0]).toBe('https://api.test/posts?userId=3')
    expect(result.ok && result.value[0]).toEqual({ id: 1, userId: 3, title: 'sunt aut facere', body: 'quia et suscipit' })
  })

  it('returns a parse failure when the list has the wrong shape', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(new Response(JSON.stringify([{ id: 1 }])))
    const result = await repositoryWith(fetchFunction).getByUser(3)
    expect(result).toEqual({ ok: false, error: { kind: 'parse' } })
  })

  it('passes the http failure through', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(new Response('{}', { status: 503 }))
    const result = await repositoryWith(fetchFunction).getByUser(3)
    expect(result).toEqual({ ok: false, error: { kind: 'http', status: 503 } })
  })

  it('posts the draft as json and maps the answer', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(
      new Response(JSON.stringify({ id: 101, userId: 3, title: 'Hello', body: 'World' }), { status: 201 }),
    )
    const result = await repositoryWith(fetchFunction).create({ userId: 3, title: 'Hello', body: 'World' })
    const [url, init] = fetchFunction.mock.calls[0]!
    expect(url).toBe('https://api.test/posts')
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe('{"userId":3,"title":"Hello","body":"World"}')
    expect(result).toEqual({ ok: true, value: { id: 101, userId: 3, title: 'Hello', body: 'World' } })
  })

  it('reports a parse failure when the created post comes back malformed', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(new Response('{"id":101}', { status: 201 }))
    const result = await repositoryWith(fetchFunction).create({ userId: 3, title: 'Hello', body: 'World' })
    expect(result).toEqual({ ok: false, error: { kind: 'parse' } })
  })

  it('forwards the abort signal', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(new Response('[]'))
    const controller = new AbortController()
    await repositoryWith(fetchFunction).getByUser(3, controller.signal)
    expect(fetchFunction.mock.calls[0]![1]?.signal).toBeInstanceOf(AbortSignal)
  })
})
