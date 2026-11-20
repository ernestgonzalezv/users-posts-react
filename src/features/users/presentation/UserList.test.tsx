import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { FetchFunction } from '../../../core/http-client'
import { createContainer } from '../../../di/container'
import { ContainerProvider } from '../../../di/ContainerProvider'
import { LocaleProvider } from '../../../i18n/LocaleProvider'
import { fakeFetch, json, users } from '../../../test/fake-fetch'
import { UserList } from './UserList'

const renderList = (fetchFunction: FetchFunction, onSelect = vi.fn(), selectedId: number | null = null) =>
  render(
    <ContainerProvider container={createContainer({ fetchFunction })}>
      <LocaleProvider initialLocale="en">
        <UserList selectedId={selectedId} onSelect={onSelect} />
      </LocaleProvider>
    </ContainerProvider>,
  )

describe('UserList', () => {
  it('shows a spinner with a sentence while loading', () => {
    renderList(fakeFetch(() => new Promise(() => undefined)))
    expect(screen.getByRole('status')).toHaveTextContent('Loading users…')
    expect(screen.getByRole('region', { name: 'Users' })).toHaveAttribute('aria-busy', 'true')
  })

  it('lists every user with name, username and email, and the count', async () => {
    renderList(fakeFetch(() => json(users)))
    const list = await screen.findByRole('list')
    const rows = within(list).getAllByRole('button')
    expect(rows).toHaveLength(3)
    expect(rows[0]).toHaveAccessibleName('Show posts by Leanne Graham')
    expect(rows[0]).toHaveTextContent('@Bret · Sincere@april.biz')
    expect(screen.getByText('3 users')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('reports the chosen user and marks the selected row', async () => {
    const onSelect = vi.fn()
    renderList(fakeFetch(() => json(users)), onSelect, 2)
    const ervin = await screen.findByRole('button', { name: 'Show posts by Ervin Howell' })
    expect(ervin).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Show posts by Clementine Bauch' }))
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 3, name: 'Clementine Bauch' }))
  })

  it('shows the empty state when the directory is empty', async () => {
    renderList(fakeFetch(() => json([])))
    expect(await screen.findByRole('heading', { level: 3, name: 'No users yet' })).toBeInTheDocument()
  })

  it('shows the network message with a retry that loads again', async () => {
    let calls = 0
    renderList(
      fakeFetch(() => {
        calls += 1
        if (calls === 1) {
          throw new TypeError('Failed to fetch')
        }
        return json(users)
      }),
    )
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('No connection. Check your network and try again.')
    await userEvent.click(within(alert).getByRole('button', { name: 'Retry' }))
    expect(await screen.findByRole('button', { name: 'Show posts by Leanne Graham' })).toBeInTheDocument()
    expect(calls).toBe(2)
  })

  it('names the status of an http failure', async () => {
    renderList(fakeFetch(() => json({}, 503)))
    expect(await screen.findByRole('alert')).toHaveTextContent('The server answered with an error (503).')
  })

  it('translates every state when the locale is spanish', async () => {
    render(
      <ContainerProvider container={createContainer({ fetchFunction: fakeFetch(() => json({}, 500)) })}>
        <LocaleProvider initialLocale="es">
          <UserList selectedId={null} onSelect={vi.fn()} />
        </LocaleProvider>
      </ContainerProvider>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Cargando usuarios…')
    expect(await screen.findByRole('alert')).toHaveTextContent('El servidor respondió con un error (500).')
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })
})

describe('UserList search', () => {
  it('filters by name or username ignoring case and accents, after the debounce', async () => {
    renderList(fakeFetch(() => json(users)))
    const box = await screen.findByRole('searchbox', { name: 'Search users' })
    await userEvent.type(box, 'ÉRVIN')
    expect(await screen.findByText('1 of 3')).toBeInTheDocument()
    const rows = screen.getAllByRole('button', { name: /^Show posts by/ })
    expect(rows).toHaveLength(1)
    expect(rows[0]).toHaveAccessibleName('Show posts by Ervin Howell')
    await userEvent.clear(box)
    await userEvent.type(box, 'samantha')
    expect(await screen.findByRole('button', { name: 'Show posts by Clementine Bauch' })).toBeInTheDocument()
  })

  it('keeps the full list until the debounce settles', async () => {
    renderList(fakeFetch(() => json(users)))
    const box = await screen.findByRole('searchbox', { name: 'Search users' })
    await userEvent.type(box, 'zzz')
    expect(screen.getAllByRole('button', { name: /^Show posts by/ })).toHaveLength(3)
    expect(screen.getByText('3 users')).toBeInTheDocument()
    expect(await screen.findByText('0 of 3')).toBeInTheDocument()
    expect(screen.queryAllByRole('button', { name: /^Show posts by/ })).toHaveLength(0)
  })

  it('shows the no-match state with a button that restores everyone', async () => {
    renderList(fakeFetch(() => json(users)))
    await userEvent.type(await screen.findByRole('searchbox'), 'nobody here')
    expect(await screen.findByRole('heading', { level: 3, name: 'No one matches “nobody here”' })).toBeInTheDocument()
    expect(screen.getByText('0 of 3')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(await screen.findAllByRole('button', { name: /^Show posts by/ })).toHaveLength(3)
    expect(screen.getByText('3 users')).toBeInTheDocument()
    expect(screen.getByRole('searchbox')).toHaveValue('')
  })

  it('hides the search box while loading, on error and when the directory is empty', async () => {
    renderList(fakeFetch(() => json([])))
    await screen.findByRole('heading', { level: 3, name: 'No users yet' })
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
  })
})
