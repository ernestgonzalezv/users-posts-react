import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { FetchFunction } from '../../../core/http-client'
import { createContainer } from '../../../di/container'
import { ContainerProvider } from '../../../di/ContainerProvider'
import { LocaleProvider } from '../../../i18n/LocaleProvider'
import { fakeFetch, json } from '../../../test/fake-fetch'
import type { NewPost } from '../domain/model/new-post'
import { NewPostForm } from './NewPostForm'

const created = { id: 101, userId: 3, title: 'Hello', body: 'World' }

const renderForm = (fetchFunction: FetchFunction) => {
  const container = createContainer({ fetchFunction })
  const onSubmit = vi.fn((draft: NewPost) => container.createPost.execute(draft))
  render(
    <ContainerProvider container={container}>
      <LocaleProvider initialLocale="en">
        <NewPostForm userId={3} onSubmit={onSubmit} />
      </LocaleProvider>
    </ContainerProvider>,
  )
  return {
    onSubmit,
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

  it('sends one request on a double click, clears the fields at once and keeps them usable', async () => {
    const fetchFunction = fakeFetch(() => new Promise(() => undefined))
    const { onSubmit, title, body, publish } = renderForm(fetchFunction)
    await userEvent.type(title, 'Hello')
    await userEvent.type(body, 'World')
    await userEvent.dblClick(publish)
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({ userId: 3, title: 'Hello', body: 'World' })
    expect(publish).toBeDisabled()
    expect(title).toBeEnabled()
    expect(title).toHaveValue('')
    expect(body).toHaveValue('')
    expect(screen.getByRole('status')).toHaveTextContent('Publishing…')
  })

  it('re-enables the publish button once the post is accepted', async () => {
    const { onSubmit, title, body, publish } = renderForm(fakeFetch(() => json(created, 201)))
    await userEvent.type(title, '  Hello ')
    await userEvent.type(body, 'World')
    await userEvent.click(publish)
    expect(await screen.findByRole('button', { name: 'Publish' })).toBeEnabled()
    expect(onSubmit).toHaveBeenCalledWith({ userId: 3, title: '  Hello ', body: 'World' })
    expect(title).toHaveValue('')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('brings the draft back with the error and a retry when the server fails', async () => {
    let calls = 0
    const { onSubmit, title, body, publish } = renderForm(
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
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByRole('button', { name: 'Publish' })).toBeEnabled()
    expect(onSubmit).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(title).toHaveValue('')
  })

  it('leaves what was typed meanwhile untouched when the failure comes back', async () => {
    let fail: (response: Response) => void = () => undefined
    const { title, body, publish } = renderForm(
      fakeFetch(
        () =>
          new Promise<Response>((resolve) => {
            fail = resolve
          }),
      ),
    )
    await userEvent.type(title, 'Hello')
    await userEvent.type(body, 'World')
    await userEvent.click(publish)
    await userEvent.type(title, 'Next one')
    fail(json({}, 500))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(title).toHaveValue('Next one')
    expect(body).toHaveValue('World')
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

  it('counts an emoji as one character and caps what can be typed well above the limit', async () => {
    const { title, body } = renderForm(fakeFetch(() => json(created)))
    await userEvent.type(title, '🇪🇸🇪🇸')
    expect(screen.getByText('2/100')).toBeInTheDocument()
    expect(title).toHaveAttribute('maxlength', '2000')
    expect(body).toHaveAttribute('maxlength', '20000')
  })
})
