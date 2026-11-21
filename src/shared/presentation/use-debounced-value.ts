import { useEffect, useEffectEvent, useState } from 'react'

export const DEBOUNCE_MS = 300

export function useDebouncedValue<T>(value: T, delay = DEBOUNCE_MS, immediate: (value: T) => boolean = () => false): T {
  const [debounced, setDebounced] = useState(value)
  const delayFor = useEffectEvent((next: T): number => (immediate(next) ? 0 : delay))

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value)
    }, delayFor(value))
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debounced
}
