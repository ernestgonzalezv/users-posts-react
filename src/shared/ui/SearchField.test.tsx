import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleProvider'
import { SearchField } from './SearchField'

const renderField = (value: string, onChange = vi.fn()) =>
  render(
    <LocaleProvider initialLocale="en">
      <SearchField value={value} onChange={onChange} label="Search users" placeholder="Type a name" />
    </LocaleProvider>,
  )

describe('SearchField', () => {
  it('is a labelled searchbox that reports every keystroke', async () => {
    const onChange = vi.fn()
    renderField('', onChange)
    const box = screen.getByRole('searchbox', { name: 'Search users' })
    expect(box).toHaveAttribute('placeholder', 'Type a name')
    await userEvent.type(box, 'le')
    expect(onChange).toHaveBeenNthCalledWith(1, 'l')
    expect(onChange).toHaveBeenNthCalledWith(2, 'e')
  })

  it('hides the clear button while empty', () => {
    renderField('')
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument()
  })

  it('clears with the button and with escape, keeping focus in the box', async () => {
    const onChange = vi.fn()
    renderField('lea', onChange)
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onChange).toHaveBeenLastCalledWith('')
    expect(screen.getByRole('searchbox')).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    expect(onChange).toHaveBeenCalledTimes(2)
  })
})
