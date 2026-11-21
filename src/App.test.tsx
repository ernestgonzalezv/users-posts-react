import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { createContainer } from './di/container'
import { fakeFetch, json, posts, users } from './test/fake-fetch'

const byRoute = (url: string) => json(url.includes('/posts') ? posts : users)

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('loads the users into the sidebar and invites to pick one', async () => {
    render(<App container={createContainer({ fetchFunction: fakeFetch(byRoute) })} />)
    expect(screen.getByRole('main')).toHaveTextContent('Pick a user')
    expect(
      await screen.findByRole('button', {
        name: 'Show posts by Leanne Graham',
      }),
    ).toBeInTheDocument()
  })

  it('shows the chosen user in the main area', async () => {
    render(<App container={createContainer({ fetchFunction: fakeFetch(byRoute) })} />)
    await userEvent.click(await screen.findByRole('button', { name: 'Show posts by Ervin Howell' }))
    const main = screen.getByRole('main')
    expect(main).not.toHaveTextContent('Pick a user')
    expect(within(main).getByRole('heading', { level: 2, name: 'Ervin Howell' })).toBeInTheDocument()
    expect(main).toHaveTextContent('Shanna@melissa.tv')
    expect(main).toHaveTextContent('Works at Deckow-Crist')
    expect(await within(main).findByText('2 posts')).toBeInTheDocument()
    expect(within(main).getAllByRole('heading', { level: 4 })).toHaveLength(2)
  })

  it('replaces the header and the posts when another user is chosen', async () => {
    render(<App container={createContainer({ fetchFunction: fakeFetch(byRoute) })} />)
    await userEvent.click(await screen.findByRole('button', { name: 'Show posts by Leanne Graham' }))
    const main = screen.getByRole('main')
    expect(await within(main).findByText('2 posts')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Show posts by Ervin Howell' }))
    expect(within(main).getAllByRole('heading', { level: 2 })).toHaveLength(1)
    expect(within(main).queryByRole('heading', { level: 2, name: 'Leanne Graham' })).not.toBeInTheDocument()
    expect(within(main).getByRole('heading', { level: 2, name: 'Ervin Howell' })).toBeInTheDocument()
    expect(within(main).getAllByRole('form')).toHaveLength(1)
  })

  it('opens the user named in the address and writes the chosen one back to it', async () => {
    window.history.replaceState(null, '', '/users/2')
    render(<App container={createContainer({ fetchFunction: fakeFetch(byRoute) })} />)
    const main = screen.getByRole('main')
    expect(within(main).getByRole('status')).toHaveTextContent('Loading users…')
    expect(await within(main).findByRole('heading', { level: 2, name: 'Ervin Howell' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show posts by Ervin Howell' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Show posts by Leanne Graham' }))
    expect(window.location.pathname).toBe('/users/1')
    expect(within(main).getByRole('heading', { level: 2, name: 'Leanne Graham' })).toBeInTheDocument()
  })

  it.each(['/users/999', '/users/abc', '/somewhere'])(
    'explains that %s points to nobody and offers the way back',
    async (path) => {
      window.history.replaceState(null, '', path)
      render(<App container={createContainer({ fetchFunction: fakeFetch(byRoute) })} />)
      const main = screen.getByRole('main')
      expect(await within(main).findByRole('heading', { level: 3, name: 'That user is not here' })).toBeInTheDocument()
      await userEvent.click(within(main).getByRole('button', { name: 'Back to the list' }))
      expect(window.location.pathname).toBe('/')
      expect(main).toHaveTextContent('Pick a user')
    },
  )

  it('follows the back button to the previous user', async () => {
    render(<App container={createContainer({ fetchFunction: fakeFetch(byRoute) })} />)
    await userEvent.click(await screen.findByRole('button', { name: 'Show posts by Ervin Howell' }))
    await userEvent.click(screen.getByRole('button', { name: 'Show posts by Leanne Graham' }))
    const main = screen.getByRole('main')
    act(() => {
      window.history.replaceState(null, '', '/users/2')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(within(main).getByRole('heading', { level: 2, name: 'Ervin Howell' })).toBeInTheDocument()
    expect(within(main).getAllByRole('heading', { level: 2 })).toHaveLength(1)
  })

  it('keeps the idle state when the directory fails and the address names a user', async () => {
    window.history.replaceState(null, '', '/users/2')
    render(<App container={createContainer({ fetchFunction: fakeFetch(() => json({}, 500)) })} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('error (500)')
    expect(screen.getByRole('main')).toHaveTextContent('Pick a user')
  })

  it('scrolls the detail into view on a stacked layout', async () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({ matches: query.includes('max-width') }) as MediaQueryList)
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView')
    render(<App container={createContainer({ fetchFunction: fakeFetch(byRoute) })} />)
    await userEvent.click(await screen.findByRole('button', { name: 'Show posts by Ervin Howell' }))
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' })
  })

  it('keeps the chosen user when the language changes', async () => {
    render(<App container={createContainer({ fetchFunction: fakeFetch(byRoute) })} />)
    await userEvent.click(await screen.findByRole('button', { name: 'Show posts by Ervin Howell' }))
    await userEvent.click(screen.getByRole('radio', { name: 'Spanish' }))
    expect(
      screen.getByRole('button', {
        name: 'Ver las publicaciones de Ervin Howell',
      }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('main')).toHaveTextContent('Trabaja en Deckow-Crist')
  })
})

describe('App stacked layout', () => {
  it('scrolls again when the chosen user is tapped a second time', async () => {
    window.localStorage.clear()
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({ matches: query.includes('max-width') }) as MediaQueryList)
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView')
    render(<App container={createContainer({ fetchFunction: fakeFetch(byRoute) })} />)
    await userEvent.click(await screen.findByRole('button', { name: 'Show posts by Ervin Howell' }))
    await userEvent.click(screen.getByRole('button', { name: 'Show posts by Ervin Howell' }))
    expect(scrollIntoView).toHaveBeenCalledTimes(2)
  })
})
