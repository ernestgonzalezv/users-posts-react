import { abortedError, httpError, networkError, parseError, timeoutError } from './app-error'
import type { Result } from './result'
import { failure, success } from './result'

export type Guard<T> = (value: unknown) => value is T
export type FetchFunction = typeof fetch

export interface RequestOptions {
  readonly signal?: AbortSignal | undefined
}

interface HttpClientConfig {
  readonly baseUrl: string
  readonly fetchFunction?: FetchFunction
  readonly timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 10_000

export class HttpClient {
  private readonly baseUrl: string
  private readonly fetchFunction: FetchFunction
  private readonly timeoutMs: number

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '')
    this.fetchFunction = config.fetchFunction ?? ((input, init) => fetch(input, init))
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS
  }

  get<T>(path: string, guard: Guard<T>, options: RequestOptions = {}): Promise<Result<T>> {
    return this.request(path, { method: 'GET' }, guard, options)
  }

  post<T>(path: string, body: unknown, guard: Guard<T>, options: RequestOptions = {}): Promise<Result<T>> {
    const init: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(body),
    }
    return this.request(path, init, guard, options)
  }

  private async request<T>(
    path: string,
    init: RequestInit,
    guard: Guard<T>,
    options: RequestOptions,
  ): Promise<Result<T>> {
    if (options.signal?.aborted) {
      return failure(abortedError())
    }
    const controller = new AbortController()
    const watchdog = { timedOut: false }
    const timer = setTimeout(() => {
      watchdog.timedOut = true
      controller.abort()
    }, this.timeoutMs)
    const forwardAbort = () => {
      controller.abort()
    }
    options.signal?.addEventListener('abort', forwardAbort, { once: true })

    try {
      const response = await this.fetchFunction(`${this.baseUrl}${path}`, { ...init, signal: controller.signal })
      if (!response.ok) {
        return failure(httpError(response.status))
      }
      const json: unknown = await response.json()
      return guard(json) ? success(json) : failure(parseError())
    } catch (caught: unknown) {
      if (watchdog.timedOut) {
        return failure(timeoutError())
      }
      if (options.signal?.aborted) {
        return failure(abortedError())
      }
      if (caught instanceof SyntaxError) {
        return failure(parseError())
      }
      return failure(networkError())
    } finally {
      clearTimeout(timer)
      options.signal?.removeEventListener('abort', forwardAbort)
    }
  }
}
