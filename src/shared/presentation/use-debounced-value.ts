import { useEffect, useState } from 'react'

export const DEBOUNCE_MS = 300

export function useDebouncedValue<T>(value: T, delay = DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value)
    }, delay)
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debounced
}
