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

const user = (id: number, name: string): User => ({
  id,
  name,
  username: name,
  email: 'a@b.c',
  website: '',
  company: '',
})

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

  it('inserts every written post at the top with its own key, shows the badge and the toast', async () => {
    const fetchFunction = fakeFetch((url, init) =>
      init?.method === 'POST'
        ? json({ id: 101, userId: 3, title: 'Fresh', body: 'Ink' }, 201)
        : json(url.endsWith('userId=3') ? posts : []),
    )
    renderPosts(fetchFunction)
    await screen.findByText('2 posts')
    for (const title of ['First', 'Second']) {
      await userEvent.type(screen.getByLabelText('Title'), title)
      await userEvent.type(screen.getByLabelText('Body'), 'Ink')
      await userEvent.click(screen.getByRole('button', { name: 'Publish' }))
      await screen.findByText(`${String(['First', 'Second'].indexOf(title) + 3)} posts`)
    }
    const headings = screen.getAllByRole('heading', { level: 4 })
    expect(headings).toHaveLength(4)
    expect(headings[0]).toHaveTextContent('Second')
    expect(headings[1]).toHaveTextContent('First')
    expect(screen.getAllByText('New')).toHaveLength(2)
    expect(screen.getByRole('status')).toHaveTextContent('Published. Your post is at the top of the list.')
  })

  it('mounts a fresh toast on every publish so its timer restarts', async () => {
    const fetchFunction = fakeFetch((url, init) =>
      init?.method === 'POST'
        ? json({ id: 101, userId: 3, title: 'Fresh', body: 'Ink' }, 201)
        : json(url.endsWith('userId=3') ? posts : []),
    )
    renderPosts(fetchFunction)
    expect(await screen.findByText('2 posts')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Title'), 'First')
    await userEvent.type(screen.getByLabelText('Body'), 'Ink')
    await userEvent.click(screen.getByRole('button', { name: 'Publish' }))
    const first = await screen.findByRole('status')
    await userEvent.type(screen.getByLabelText('Title'), 'Second')
    await userEvent.type(screen.getByLabelText('Body'), 'Ink')
    await userEvent.click(screen.getByRole('button', { name: 'Publish' }))
    expect(await screen.findByText('4 posts')).toBeInTheDocument()
    const second = screen.getByRole('status')
    expect(second).toHaveTextContent('Published.')
    expect(second).not.toBe(first)
  })

  it('turns the empty state into a list when the first post is written', async () => {
    const fetchFunction = fakeFetch((_url, init) =>
      init?.method === 'POST' ? json({ id: 101, userId: 3, title: 'Only one', body: 'So far' }, 201) : json([]),
    )
    renderPosts(fetchFunction)
    await screen.findByRole('heading', { level: 3, name: 'No posts yet' })
    await userEvent.type(screen.getByLabelText('Title'), 'Only one')
    await userEvent.type(screen.getByLabelText('Body'), 'So far')
    await userEvent.click(screen.getByRole('button', { name: 'Publish' }))
    expect(await screen.findByText('1 post')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 3, name: 'No posts yet' })).not.toBeInTheDocument()
  })

  it('keeps the written posts of a user after switching away and back', async () => {
    const fetchFunction = fakeFetch((url, init) =>
      init?.method === 'POST'
        ? json({ id: 101, userId: 3, title: 'x', body: 'y' }, 201)
        : json(url.endsWith('userId=3') ? posts : []),
    )
    const { switchTo } = renderPosts(fetchFunction)
    await screen.findByText('2 posts')
    await userEvent.type(screen.getByLabelText('Title'), 'Kept')
    await userEvent.type(screen.getByLabelText('Body'), 'Ink')
    await userEvent.click(screen.getByRole('button', { name: 'Publish' }))
    await screen.findByText('3 posts')
    switchTo(user(4, 'Patricia Lebsack'))
    await screen.findByRole('heading', { level: 3, name: 'No posts yet' })
    switchTo(user(3, 'Clementine Bauch'))
    expect(await screen.findByText('3 posts')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 4 })[0]).toHaveTextContent('Kept')
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('shows the post at once as sending, then marks it new when the server accepts it', async () => {
    let accept: (response: Response) => void = () => undefined
    const fetchFunction = fakeFetch((url, init) =>
      init?.method === 'POST'
        ? new Promise<Response>((resolve) => {
            accept = resolve
          })
        : json(url.endsWith('userId=3') ? posts : []),
    )
    renderPosts(fetchFunction)
    await screen.findByText('2 posts')
    await userEvent.type(screen.getByLabelText('Title'), 'Eager')
    await userEvent.type(screen.getByLabelText('Body'), 'Ink')
    await userEvent.click(screen.getByRole('button', { name: 'Publish' }))
    expect(screen.getByText('3 posts')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 4 })[0]).toHaveTextContent('Eager')
    expect(screen.getByText('Sending…')).toBeInTheDocument()
    expect(screen.queryByText('New')).not.toBeInTheDocument()
    accept(json({ id: 101, userId: 3, title: 'x', body: 'y' }, 201))
    expect(await screen.findByText('New')).toBeInTheDocument()
    expect(screen.queryByText('Sending…')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Published.')
    expect(screen.getByText('3 posts')).toBeInTheDocument()
  })

  it('takes the post back out of the list when the server refuses it', async () => {
    const fetchFunction = fakeFetch((url, init) =>
      init?.method === 'POST' ? json({}, 503) : json(url.endsWith('userId=3') ? posts : []),
    )
    renderPosts(fetchFunction)
    await screen.findByText('2 posts')
    await userEvent.type(screen.getByLabelText('Title'), 'Doomed')
    await userEvent.type(screen.getByLabelText('Body'), 'Ink')
    await userEvent.click(screen.getByRole('button', { name: 'Publish' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('error (503)')
    expect(screen.getByText('2 posts')).toBeInTheDocument()
    expect(screen.queryByText('Doomed')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveValue('Doomed')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows twenty posts and the rest on demand', async () => {
    const many = Array.from({ length: 45 }, (_, index) => ({
      id: index + 1,
      userId: 3,
      title: `Post ${String(index + 1)}`,
      body: 'b',
    }))
    renderPosts(fakeFetch(() => json(many)))
    expect(await screen.findByText('45 posts')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(20)
    await userEvent.click(screen.getByRole('button', { name: 'Show 20 more' }))
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(40)
    await userEvent.click(screen.getByRole('button', { name: 'Show 5 more' }))
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(45)
    expect(screen.queryByRole('button', { name: /more$/ })).not.toBeInTheDocument()
  })

  it('drops the answer of a previous user that lands after switching', async () => {
    let releaseFirst: (response: Response) => void = () => undefined
    const first = new Promise<Response>((resolve) => {
      releaseFirst = resolve
    })
    const fetchFunction = fakeFetch((url) => (url.endsWith('userId=3') ? first : json([posts[1]!])))
    const { switchTo } = renderPosts(fetchFunction)
    switchTo(user(4, 'Patricia Lebsack'))
    expect(await screen.findByText('1 post')).toBeInTheDocument()
    releaseFirst(json(posts))
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(screen.getByText('1 post')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(1)
  })
})
