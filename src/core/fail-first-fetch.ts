import type { FetchFunction } from './http-client'

const requestKey = (input: RequestInfo | URL, init: RequestInit | undefined): string =>
  `${init?.method ?? 'GET'} ${typeof input === 'string' ? input : input instanceof URL ? input.href : input.url}`

const globalFetch: FetchFunction = (input, init) => fetch(input, init)

export const failFirstFetch = (fetchFunction: FetchFunction = globalFetch): FetchFunction => {
  const seen = new Set<string>()
  return (input, init) => {
    const key = requestKey(input, init)
    if (seen.has(key)) {
      return fetchFunction(input, init)
    }
    seen.add(key)
    return Promise.reject(new TypeError('Failed to fetch: first attempt rejected on purpose'))
  }
}
