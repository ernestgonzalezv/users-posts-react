import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { FetchFunction } from '../../../core/http-client'
import { createContainer } from '../../../di/container'
import { ContainerProvider } from '../../../di/ContainerProvider'
import { LocaleProvider } from '../../../i18n/LocaleProvider'
import { fakeFetch, json } from '../../../test/fake-fetch'
import { NewPostForm } from './NewPostForm'

const created = { id: 101, userId: 3, title: 'Hello', body: 'World' }

const renderForm = (fetchFunction: FetchFunction, onCreated = vi.fn()) => {
  render(
    <ContainerProvider container={createContainer({ fetchFunction })}>
      <LocaleProvider initialLocale="en">
        <NewPostForm userId={3} onCreated={onCreated} />
      </LocaleProvider>
    </ContainerProvider>,
  )
  return {
    onCreated,
    title: screen.getByLabelText('Title'),
    body: screen.getByLabelText('Body'),
    publish: screen.getByRole('button', { name: 'Publish' }),
  }
}

describe('NewPostForm', () => {
  it('flags both empty fields, focuses the first one and sends nothing', async () => {
    const fetchFunction = fakeFetch(() => json(created))
    const { title, body, publish } = renderForm(fetchFunction)
    await userEvent.click(publish)
    expect(title).toHaveAttribute('aria-invalid', 'true')
    expect(title).toHaveAccessibleDescription('This field is required.')
    expect(body).toHaveAccessibleDescription('This field is required.')
    expect(title).toHaveFocus()
    expect(fetchFunction).not.toHaveBeenCalled()
  })

  it('flags a title over 100 characters and shows the live counter', async () => {
    const { title, body, publish } = renderForm(fakeFetch(() => json(created)))
    await userEvent.type(title, 'x'.repeat(101))
    await userEvent.type(body, 'fine')
    expect(screen.getByText('101/100')).toBeInTheDocument()
    await userEvent.click(publish)
    expect(title).toHaveAccessibleDescription('Keep it under 100 characters.')
    expect(body).not.toHaveAttribute('aria-invalid', 'true')
  })

  it('sends one request on a double click and disables the form meanwhile', async () => {
    const fetchFunction = fakeFetch(() => new Promise(() => undefined))
    const { title, body, publish } = renderForm(fetchFunction)
    await userEvent.type(title, 'Hello')
    await userEvent.type(body, 'World')
    await userEvent.dblClick(publish)
    expect(fetchFunction).toHaveBeenCalledTimes(1)
    expect(publish).toBeDisabled()
    expect(title).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Publishing…')
  })

  it('reports the created post, clears the draft and re-enables the form', async () => {
    const { onCreated, title, body, publish } = renderForm(fakeFetch(() => json(created, 201)))
    await userEvent.type(title, '  Hello ')
    await userEvent.type(body, 'World')
    await userEvent.click(publish)
    expect(await screen.findByRole('button', { name: 'Publish' })).toBeEnabled()
    expect(onCreated).toHaveBeenCalledWith(created)
    expect(title).toHaveValue('')
    expect(body).toHaveValue('')
  })

  it('keeps the draft and shows the error with a retry when the server fails', async () => {
    let calls = 0
    const { onCreated, title, body, publish } = renderForm(
      fakeFetch(() => {
        calls += 1
        return calls === 1 ? json({}, 500) : json(created, 201)
      }),
    )
    await userEvent.type(title, 'Hello')
    await userEvent.type(body, 'World')
    await userEvent.click(publish)
    expect(await screen.findByRole('alert')).toHaveTextContent('The server answered with an error (500).')
    expect(title).toHaveValue('Hello')
    expect(body).toHaveValue('World')
    expect(onCreated).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByRole('button', { name: 'Publish' })).toBeEnabled()
    expect(onCreated).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('NewPostForm counters', () => {
  it('counts the title as it will be sent, with inner spaces collapsed and ends trimmed', async () => {
    const { title, body } = renderForm(fakeFetch(() => json(created)))
    await userEvent.type(title, '  Hello    world  ')
    await userEvent.type(body, ' x ')
    expect(screen.getByText('11/100')).toBeInTheDocument()
    expect(screen.getByText('1/1000')).toBeInTheDocument()
  })
})
