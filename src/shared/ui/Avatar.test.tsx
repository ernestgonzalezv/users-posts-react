import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('shows the initials, hidden from assistive tech, with a hue derived from the seed', () => {
    const { container: first } = render(<Avatar initials="LG" seed={1} />)
    const { container: fifth } = render(<Avatar initials="CD" seed={5} />)
    const { container: second } = render(<Avatar initials="EH" seed={2} />)
    expect(first.firstChild).toHaveTextContent('LG')
    expect(first.firstChild).toHaveAttribute('aria-hidden', 'true')
    expect(first.firstElementChild?.className).toBe(fifth.firstElementChild?.className)
    expect(first.firstElementChild?.className).not.toBe(second.firstElementChild?.className)
  })

  it('sizes itself through a custom property', () => {
    const { container } = render(<Avatar initials="LG" seed={1} size={48} />)
    expect(container.firstElementChild?.getAttribute('style')).toContain('--avatar-size: 48px')
  })
})
