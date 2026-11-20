import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { FetchFunction } from '../../../core/http-client'
import { createContainer } from '../../../di/container'
import { ContainerProvider } from '../../../di/ContainerProvider'
import { LocaleProvider } from '../../../i18n/LocaleProvider'
import { fakeFetch, json, posts } from '../../../test/fake-fetch'
import type { User } from '../../users/domain/model/user'
import { PostList } from './PostList'

const user = (id: number, name: string): User => ({ id, name, username: name, email: 'a@b.c', website: '', company: '' })

const renderPosts = (fetchFunction: FetchFunction, who = user(3, 'Clementine Bauch')) => {
  const container = createContainer({ fetchFunction })
  const ui = (current: User) => (
    <ContainerProvider container={container}>
      <LocaleProvider initialLocale="en">
        <PostList user={current} />
      </LocaleProvider>
    </ContainerProvider>
  )
  const view = render(ui(who))
  return {
    ...view,
    switchTo: (next: User) => {
      view.rerender(ui(next))
    },
  }
}

describe('PostList', () => {
  it('shows a spinner while the posts load', () => {
    renderPosts(fakeFetch(() => new Promise(() => undefined)))
    expect(screen.getByRole('status')).toHaveTextContent('Loading posts…')
    expect(screen.getByRole('region', { name: 'Posts' })).toHaveAttribute('aria-busy', 'true')
  })

  it('asks for the posts of that user and lists them in order with a count', async () => {
    const fetchFunction = fakeFetch((url) => json(url.endsWith('/posts?userId=3') ? posts : []))
    renderPosts(fetchFunction)
    const list = await screen.findByRole('list')
    const titles = within(list).getAllByRole('heading', { level: 4 })
    expect(titles.map((h) => h.textContent)).toEqual([posts[0]!.title, posts[1]!.title])
    expect(screen.getByText('2 posts')).toBeInTheDocument()
  })

  it('shows the empty state with the name when the user has no posts', async () => {
    renderPosts(fakeFetch(() => json([])))
    expect(await screen.findByRole('heading', { level: 3, name: 'No posts yet' })).toBeInTheDocument()
    expect(screen.getByText('Clementine Bauch has not written anything so far.')).toBeInTheDocument()
  })

  it('shows the http error and retries on demand', async () => {
    let calls = 0
    renderPosts(
      fakeFetch(() => {
        calls += 1
        return calls === 1 ? json({}, 500) : json(posts)
      }),
    )
    expect(await screen.findByRole('alert')).toHaveTextContent('The server answered with an error (500).')
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByText('2 posts')).toBeInTheDocument()
  })

  it('drops the answer of a previous user that lands after switching', async () => {
    let releaseFirst: (response: Response) => void = () => undefined
    const first = new Promise<Response>((resolve) => {
      releaseFirst = resolve
    })
    const fetchFunction = fakeFetch((url) => (url.endsWith('userId=3') ? first : json([posts[1]!])))
    const { switchTo } = renderPosts(fetchFunction)
    switchTo(user(4, 'Patricia Lebsack'))
    expect(await screen.findByText('1 posts')).toBeInTheDocument()
    releaseFirst(json(posts))
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(screen.getByText('1 posts')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(1)
  })
})
