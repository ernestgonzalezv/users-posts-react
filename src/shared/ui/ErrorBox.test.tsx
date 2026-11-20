import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { httpError, networkError } from '../../core/app-error'
import { LocaleProvider } from '../../i18n/LocaleProvider'
import { ErrorBox } from './ErrorBox'

describe('ErrorBox', () => {
  it('is an alert with the translated message and a retry button', async () => {
    const onRetry = vi.fn()
    render(
      <LocaleProvider initialLocale="es">
        <ErrorBox error={httpError(502)} onRetry={onRetry} />
      </LocaleProvider>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('El servidor respondió con un error (502).')
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('tells a network failure from the rest', () => {
    render(
      <LocaleProvider initialLocale="en">
        <ErrorBox error={networkError()} onRetry={vi.fn()} />
      </LocaleProvider>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('No connection.')
  })
})
