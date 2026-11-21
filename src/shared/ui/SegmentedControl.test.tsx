import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SegmentedControl } from './SegmentedControl'

const options = [
  { value: 'a', title: 'Alpha', label: 'A' },
  { value: 'b', title: 'Beta', label: 'B' },
  { value: 'c', title: 'Gamma', label: 'C' },
] as const

describe('SegmentedControl', () => {
  it('moves with every arrow, wraps around, enter picks the focused one and other keys do nothing', async () => {
    const onChange = vi.fn()
    render(<SegmentedControl label="Pick" value="c" options={options} onChange={onChange} />)
    screen.getByRole('radio', { name: 'Gamma' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenLastCalledWith('a')
    await userEvent.keyboard('{ArrowDown}')
    expect(onChange).toHaveBeenLastCalledWith('a')
    await userEvent.keyboard('{ArrowLeft}')
    expect(onChange).toHaveBeenLastCalledWith('b')
    await userEvent.keyboard('{ArrowUp}')
    expect(onChange).toHaveBeenLastCalledWith('b')
    await userEvent.keyboard('{Enter}')
    expect(onChange).toHaveBeenLastCalledWith('c')
    await userEvent.keyboard('x')
    expect(onChange).toHaveBeenCalledTimes(5)
  })

  it('only the checked option is in the tab order', () => {
    render(<SegmentedControl label="Pick" value="b" options={options} onChange={vi.fn()} />)
    expect(screen.getByRole('radio', { name: 'Beta' })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveAttribute('tabindex', '-1')
  })
})
