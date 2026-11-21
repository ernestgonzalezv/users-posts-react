import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from './App'
import type { FetchFunction } from './core/http-client'
import { createContainer } from './di/container'
import { fakeFetch, json, posts, users } from './test/fake-fetch'

const created = { id: 101, userId: 3, title: 'Fresh', body: 'Ink' }

const byRoute = (url: string, init: RequestInit | undefined) =>
  init?.method === 'POST' ? json(created, 201) : json(url.includes('/posts') ? (url.endsWith('userId=3') ? posts : []) : users)

const renderApp = (fetchFunction: FetchFunction = fakeFetch(byRoute), timeoutMs?: number) =>
  render(
    <App
      container={createContainer({
        fetchFunction,
        ...(timeoutMs === undefined ? {} : { timeoutMs }),
      })}
    />,
  )

const choose = (name: string) => userEvent.click(screen.getByRole('button', { name: `Show posts by ${name}` }))

const publish = async (title: string) => {
  await userEvent.type(screen.getByLabelText('Title'), title)
  await userEvent.type(screen.getByLabelText('Body'), 'Ink')
  await userEvent.click(screen.getByRole('button', { name: 'Publish' }))
}

describe('App edge cases', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('keeps the chosen user, the draft and the written posts across a language switch', async () => {
    renderApp()
    await screen.findByRole('button', {
      name: 'Show posts by Clementine Bauch',
    })
    await choose('Clementine Bauch')
    await publish('Fresh')
    await screen.findByText('3 posts')
    await userEvent.type(screen.getByLabelText('Title'), 'Half written')
    await userEvent.click(screen.getByRole('radio', { name: 'Spanish' }))
    expect(screen.getByRole('heading', { level: 2, name: 'Clementine Bauch' })).toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toHaveValue('Half written')
    expect(screen.getByText('3 publicaciones')).toBeInTheDocument()
    expect(screen.getByText('Nueva')).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Ver las publicaciones de Clementine Bauch',
      }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows the parse message when the directory comes back malformed and recovers on retry', async () => {
    let calls = 0
    renderApp(
      fakeFetch((url, init) => {
        calls += 1
        return calls === 1 ? json([{ id: 'nope' }]) : byRoute(url, init)
      }),
    )
    expect(await screen.findByRole('alert')).toHaveTextContent('The server sent something unexpected.')
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByText('10 users'.replace('10', '3'))).toBeInTheDocument()
  })

  it('keeps the chosen user when the search hides the row and shows it pressed again when cleared', async () => {
    renderApp()
    await screen.findByRole('button', { name: 'Show posts by Ervin Howell' })
    await choose('Ervin Howell')
    await userEvent.type(screen.getByRole('searchbox'), 'leanne')
    await screen.findByText('1 of 3')
    expect(screen.queryByRole('button', { name: 'Show posts by Ervin Howell' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Ervin Howell' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(await screen.findByRole('button', { name: 'Show posts by Ervin Howell' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows written posts only under the user they were written for', async () => {
    renderApp()
    await screen.findByRole('button', {
      name: 'Show posts by Clementine Bauch',
    })
    await choose('Clementine Bauch')
    await publish('Fresh')
    await screen.findByText('3 posts')
    await choose('Leanne Graham')
    expect(await screen.findByRole('heading', { level: 3, name: 'No posts yet' })).toBeInTheDocument()
    expect(screen.queryByText('New')).not.toBeInTheDocument()
  })

  it('recovers the posts with retry after a network failure while the users list stays intact', async () => {
    let failPosts = true
    renderApp(
      fakeFetch((url, init) => {
        if (url.includes('/posts') && failPosts) {
          throw new TypeError('Failed to fetch')
        }
        return byRoute(url, init)
      }),
    )
    await screen.findByRole('button', {
      name: 'Show posts by Clementine Bauch',
    })
    await choose('Clementine Bauch')
    const main = screen.getByRole('main')
    expect(await within(main).findByRole('alert')).toHaveTextContent('No connection. Check your network and try again.')
    expect(screen.getAllByRole('button', { name: /^Show posts by/ })).toHaveLength(3)
    failPosts = false
    await userEvent.click(within(main).getByRole('button', { name: 'Retry' }))
    expect(await within(main).findByText('2 posts')).toBeInTheDocument()
  })

  it('reports a timeout when the posts never arrive', async () => {
    renderApp(
      fakeFetch((url, init) =>
        url.includes('/posts')
          ? new Promise((_resolve, reject) => {
              init?.signal?.addEventListener('abort', () => {
                reject(new DOMException('Aborted', 'AbortError'))
              })
            })
          : byRoute(url, init),
      ),
      50,
    )
    await screen.findByRole('button', {
      name: 'Show posts by Clementine Bauch',
    })
    await choose('Clementine Bauch')
    expect(await screen.findByRole('alert')).toHaveTextContent('The server took too long to answer.')
  })

  it('never sends a draft that is only whitespace, even with the counters at zero', async () => {
    const fetchFunction = fakeFetch(byRoute)
    renderApp(fetchFunction)
    await screen.findByRole('button', {
      name: 'Show posts by Clementine Bauch',
    })
    await choose('Clementine Bauch')
    await screen.findByText('2 posts')
    const before = fetchFunction.mock.calls.length
    await userEvent.type(screen.getByLabelText('Title'), '   ')
    await userEvent.type(screen.getByLabelText('Body'), '  ')
    await userEvent.click(screen.getByRole('button', { name: 'Publish' }))
    expect(screen.getByLabelText('Title')).toHaveAccessibleDescription('This field is required.')
    expect(fetchFunction.mock.calls).toHaveLength(before)
  })
})
