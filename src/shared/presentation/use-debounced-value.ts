import { useEffect, useState } from 'react'

export const DEBOUNCE_MS = 300

export function useDebouncedValue<T>(value: T, delay = DEBOUNCE_MS, immediate: (value: T) => boolean = () => false): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setDebounced(value)
      },
      immediate(value) ? 0 : delay,
    )
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debounced
}
