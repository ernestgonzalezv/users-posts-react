import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Toast } from './Toast'

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('announces the message and reports when its time is up', () => {
    const onDone = vi.fn()
    render(<Toast message="Published." onDone={onDone} durationMs={1000} />)
    expect(screen.getByRole('status')).toHaveTextContent('Published.')
    act(() => {
      vi.advanceTimersByTime(999)
    })
    expect(onDone).not.toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})
