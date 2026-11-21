import { describe, expect, it, vi } from 'vitest'
import type { FetchFunction } from '../../../../core/http-client'
import { HttpClient } from '../../../../core/http-client'
import { LocalWrittenPostStore } from '../store/local-written-post-store'
import { HttpPostRepository } from './http-post-repository'

const posts = [
  { id: 1, userId: 3, title: '  sunt aut facere ', body: 'quia et suscipit\n' },
  { id: 2, userId: 3, title: 'qui est esse', body: 'est rerum tempore' },
]

const memoryStore = () => {
  let raw: string | null = null
  return new LocalWrittenPostStore(
    () => raw,
    (value) => {
      raw = value
    },
  )
}

const repositoryWith = (fetchFunction: FetchFunction, written = memoryStore()) =>
  new HttpPostRepository(new HttpClient({ baseUrl: 'https://api.test', fetchFunction }), written)

describe('HttpPostRepository', () => {
  it('requests the posts of that user and trims title and body', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(new Response(JSON.stringify(posts)))
    const result = await repositoryWith(fetchFunction).getByUser(3)
    expect(fetchFunction.mock.calls[0]![0]).toBe('https://api.test/posts?userId=3')
    expect(result.ok && result.value[0]).toEqual({
      id: 1,
      userId: 3,
      title: 'sunt aut facere',
      body: 'quia et suscipit',
      source: 'remote',
    })
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
    const fetchFunction = vi
      .fn<FetchFunction>()
      .mockResolvedValue(new Response(JSON.stringify({ id: 101, userId: 3, title: 'Hello', body: 'World' }), { status: 201 }))
    const result = await repositoryWith(fetchFunction).create({ userId: 3, title: 'Hello', body: 'World' })
    const [url, init] = fetchFunction.mock.calls[0]!
    expect(url).toBe('https://api.test/posts')
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe('{"userId":3,"title":"Hello","body":"World"}')
    expect(result).toEqual({ ok: true, value: { id: -1, userId: 3, title: 'Hello', body: 'World', source: 'written' } })
  })

  it('lists the written posts of that user before the remote ones, newest first', async () => {
    const written = memoryStore()
    written.add({ userId: 3, title: 'Older', body: 'a' })
    written.add({ userId: 3, title: 'Newer', body: 'b' })
    written.add({ userId: 4, title: 'Someone else', body: 'c' })
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(new Response(JSON.stringify(posts)))
    const result = await repositoryWith(fetchFunction, written).getByUser(3)
    expect(result.ok && result.value.map((post) => post.title)).toEqual(['Newer', 'Older', 'sunt aut facere', 'qui est esse'])
    expect(result.ok && result.value.map((post) => post.source)).toEqual(['written', 'written', 'remote', 'remote'])
  })

  it('drops a repeated id and strips control characters from the server text', async () => {
    const fetchFunction = vi
      .fn<FetchFunction>()
      .mockResolvedValue(
        new Response(
          JSON.stringify([
            ...posts,
            { id: 2, userId: 3, title: 'dup', body: 'x' },
            { id: 3, userId: 3, title: 'a\u0000b', body: 'c\r\nd' },
          ]),
        ),
      )
    const result = await repositoryWith(fetchFunction).getByUser(3)
    expect(result.ok && result.value.map((post) => post.title)).toEqual(['sunt aut facere', 'qui est esse', 'ab'])
    expect(result.ok && result.value[2]?.body).toBe('c\nd')
  })

  it('keeps nothing when the server refuses the post', async () => {
    const written = memoryStore()
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(new Response('{}', { status: 500 }))
    const result = await repositoryWith(fetchFunction, written).create({ userId: 3, title: 'Lost', body: 'x' })
    expect(result.ok).toBe(false)
    expect(written.list(3)).toEqual([])
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
