import { useState } from 'react'

export interface Paged<T> {
  readonly shown: readonly T[]
  readonly hidden: number
  readonly showMore: () => void
}

interface Window<T> {
  readonly items: readonly T[]
  readonly pages: number
}

export function usePaged<T>(items: readonly T[], pageSize: number): Paged<T> {
  const [window, setWindow] = useState<Window<T>>({ items, pages: 1 })
  const pages = window.items === items ? window.pages : 1
  const shown = items.slice(0, pages * pageSize)
  return {
    shown,
    hidden: items.length - shown.length,
    showMore: () => {
      setWindow({ items, pages: pages + 1 })
    },
  }
}
