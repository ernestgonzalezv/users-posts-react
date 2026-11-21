import type { FetchFunction } from './http-client'

const globalFetch: FetchFunction = (input, init) => fetch(input, init)

export const delayedFetch =
  (delayMs: number, fetchFunction: FetchFunction = globalFetch): FetchFunction =>
  (input, init) =>
    new Promise<Response>((resolve, reject) => {
      const signal = init?.signal
      const abort = () => {
        clearTimeout(timer)
        reject(new DOMException('The request was aborted while delayed', 'AbortError'))
      }
      const timer = setTimeout(() => {
        signal?.removeEventListener('abort', abort)
        resolve(fetchFunction(input, init))
      }, delayMs)
      if (signal?.aborted === true) {
        abort()
        return
      }
      signal?.addEventListener('abort', abort, { once: true })
    })
