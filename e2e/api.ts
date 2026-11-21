import type { Page, Route } from '@playwright/test'

export interface UserFixture {
  readonly id: number
  readonly name: string
  readonly username: string
  readonly email: string
  readonly website: string
  readonly company: { readonly name: string }
}

export interface PostFixture {
  readonly id: number
  readonly userId: number
  readonly title: string
  readonly body: string
}

export const users: readonly UserFixture[] = [
  {
    id: 1,
    name: 'Leanne Graham',
    username: 'Bret',
    email: 'Sincere@april.biz',
    website: 'hildegard.org',
    company: { name: 'Romaguera-Crona' },
  },
  {
    id: 2,
    name: 'Ervin Howell',
    username: 'Antonette',
    email: 'Shanna@melissa.tv',
    website: 'anastasia.net',
    company: { name: 'Deckow-Crist' },
  },
  {
    id: 3,
    name: 'Clementine Bauch',
    username: 'Samantha',
    email: 'Nathan@yesenia.net',
    website: 'ramiro.info',
    company: { name: 'Romaguera-Jacobson' },
  },
]

export const postsOf = (userId: number, count: number): readonly PostFixture[] =>
  Array.from({ length: count }, (_, index) => ({
    id: userId * 100 + index + 1,
    userId,
    title: `Post ${String(index + 1)} by user ${String(userId)}`,
    body: `Body of post ${String(index + 1)}\nsecond line`,
  }))

export interface ApiOptions {
  readonly usersStatus?: number
  readonly postsStatus?: number
  readonly createStatus?: number
  readonly createDelayMs?: number
  readonly postCount?: Readonly<Record<number, number>>
}

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })

export const calls: { posts: number; users: number; creates: number } = { posts: 0, users: 0, creates: 0 }

export const mockApi = async (page: Page, options: ApiOptions = {}): Promise<void> => {
  await page.route('https://jsonplaceholder.typicode.com/**', async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname === '/users') {
      calls.users += 1
      return options.usersStatus === undefined ? json(route, users) : json(route, {}, options.usersStatus)
    }
    if (url.pathname === '/posts' && route.request().method() === 'POST') {
      calls.creates += 1
      if (options.createDelayMs !== undefined) {
        await new Promise((resolve) => setTimeout(resolve, options.createDelayMs))
      }
      const sent: unknown = route.request().postDataJSON()
      return options.createStatus === undefined
        ? json(route, { id: 101, ...(sent as object) }, 201)
        : json(route, {}, options.createStatus)
    }
    if (url.pathname === '/posts') {
      calls.posts += 1
      const userId = Number(url.searchParams.get('userId'))
      if (options.postsStatus !== undefined) {
        return json(route, {}, options.postsStatus)
      }
      return json(route, postsOf(userId, options.postCount?.[userId] ?? 3))
    }
    return route.fulfill({ status: 404, body: '' })
  })
}
