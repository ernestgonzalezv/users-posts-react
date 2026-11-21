export type Route = { readonly kind: 'home' } | { readonly kind: 'user'; readonly id: number } | { readonly kind: 'unknown' }

const USER_PATH = /^\/users\/(-?\d{1,17})\/?$/
const USERS_PREFIX = /^\/users\/./

export const parseRoute = (pathname: string): Route => {
  const digits = USER_PATH.exec(pathname)?.[1]
  if (digits === undefined) {
    return USERS_PREFIX.test(pathname) ? { kind: 'unknown' } : { kind: 'home' }
  }
  const id = Number(digits)
  return Number.isSafeInteger(id) ? { kind: 'user', id } : { kind: 'unknown' }
}

export const pathOf = (route: Route): string => (route.kind === 'user' ? `/users/${route.id}` : '/')

export const sameRoute = (a: Route, b: Route): boolean => pathOf(a) === pathOf(b) && a.kind === b.kind
