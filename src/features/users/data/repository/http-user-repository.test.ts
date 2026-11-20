import { describe, expect, it, vi } from 'vitest'
import type { FetchFunction } from '../../../../core/http-client'
import { HttpClient } from '../../../../core/http-client'
import { HttpUserRepository } from './http-user-repository'

const users = [
  { id: 1, name: 'Leanne Graham', username: 'Bret', email: 'Sincere@april.biz', website: 'hildegard.org', company: { name: 'Romaguera-Crona' } },
  { id: 2, name: 'Ervin Howell', username: 'Antonette', email: 'Shanna@melissa.tv', website: 'anastasia.net', company: { name: 'Deckow-Crist' } },
]

const repositoryWith = (fetchFunction: FetchFunction) =>
  new HttpUserRepository(new HttpClient({ baseUrl: 'https://api.test', fetchFunction }))

describe('HttpUserRepository', () => {
  it('requests /users and maps every dto to a user', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(new Response(JSON.stringify(users)))
    const result = await repositoryWith(fetchFunction).getAll()
    expect(fetchFunction.mock.calls[0]![0]).toBe('https://api.test/users')
    expect(result.ok && result.value.map((user) => user.company)).toEqual(['Romaguera-Crona', 'Deckow-Crist'])
  })

  it('returns a parse failure when the list has the wrong shape', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(new Response(JSON.stringify([{ id: 'x' }])))
    const result = await repositoryWith(fetchFunction).getAll()
    expect(result).toEqual({ ok: false, error: { kind: 'parse' } })
  })

  it('passes the http failure through', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(new Response('{}', { status: 500 }))
    const result = await repositoryWith(fetchFunction).getAll()
    expect(result).toEqual({ ok: false, error: { kind: 'http', status: 500 } })
  })

  it('forwards the abort signal to the request', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(new Response('[]'))
    const controller = new AbortController()
    await repositoryWith(fetchFunction).getAll(controller.signal)
    const [, init] = fetchFunction.mock.calls[0]!
    expect(init?.signal).toBeInstanceOf(AbortSignal)
  })
})
