import { vi } from 'vitest'
import type { FetchFunction } from '../core/http-client'

type Route = (url: string, init: RequestInit | undefined) => Response | Promise<Response>

export const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const urlOf = (input: string | URL | Request): string =>
  typeof input === 'string' ? input : input instanceof URL ? input.href : input.url

export const fakeFetch = (route: Route) =>
  vi.fn<FetchFunction>().mockImplementation((input, init) => Promise.resolve(route(urlOf(input), init)))

export const posts = [
  { id: 21, userId: 3, title: 'asperiores ea ipsam voluptatibus modi minima quia sint', body: 'repellat aliquid praesentium dolorem quo' },
  { id: 22, userId: 3, title: 'dolor sint quo a velit explicabo quia nam', body: 'eos qui et ipsum ipsam suscipit aut' },
]

export const users = [
  { id: 1, name: 'Leanne Graham', username: 'Bret', email: 'Sincere@april.biz', website: 'hildegard.org', company: { name: 'Romaguera-Crona' } },
  { id: 2, name: 'Ervin Howell', username: 'Antonette', email: 'Shanna@melissa.tv', website: 'anastasia.net', company: { name: 'Deckow-Crist' } },
  { id: 3, name: 'Clementine Bauch', username: 'Samantha', email: 'Nathan@yesenia.net', website: 'ramiro.info', company: { name: 'Romaguera-Jacobson' } },
]
