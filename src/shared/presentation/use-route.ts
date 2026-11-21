import { useCallback, useSyncExternalStore } from 'react'
import type { Route } from './route'
import { parseRoute, pathOf } from './route'

export interface Navigation {
  readonly route: Route
  readonly navigate: (route: Route, options?: { readonly replace?: boolean }) => void
}

const listeners = new Set<() => void>()

const notify = () => {
  for (const listener of listeners) {
    listener()
  }
}

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener)
  window.addEventListener('popstate', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('popstate', listener)
  }
}

const readPath = (): string => window.location.pathname

export function useRoute(): Navigation {
  const pathname = useSyncExternalStore(subscribe, readPath, () => '/')
  const navigate = useCallback((route: Route, options: { readonly replace?: boolean } = {}) => {
    const path = pathOf(route)
    if (path === window.location.pathname) {
      return
    }
    if (options.replace === true) {
      window.history.replaceState(null, '', path)
    } else {
      window.history.pushState(null, '', path)
    }
    notify()
  }, [])
  return { route: parseRoute(pathname), navigate }
}
