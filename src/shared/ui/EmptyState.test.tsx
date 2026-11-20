import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmptyState } from './EmptyState'
import { InboxIcon } from './icons'

describe('EmptyState', () => {
  it('renders a heading and a hint, hiding the icon from assistive tech', () => {
    const { container } = render(<EmptyState icon={<InboxIcon />} title="No posts yet" hint="Write the first one below." />)
    expect(screen.getByRole('heading', { level: 3, name: 'No posts yet' })).toBeInTheDocument()
    expect(screen.getByText('Write the first one below.')).toBeInTheDocument()
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
