import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { FetchFunction } from './http-client'
import { HttpClient } from './http-client'

interface Thing {
  readonly id: number
}

const isThing = (value: unknown): value is Thing =>
  typeof value === 'object' && value !== null && typeof (value as { id?: unknown }).id === 'number'

const jsonResponse = (body: string, status = 200) =>
  new Response(body, { status, headers: { 'Content-Type': 'application/json' } })

const clientWith = (fetchFunction: FetchFunction, timeoutMs = 50) =>
  new HttpClient({ baseUrl: 'https://api.test/', fetchFunction, timeoutMs })

describe('HttpClient', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the decoded body of a 2xx response', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(jsonResponse('{"id":7}'))
    const result = await clientWith(fetchFunction).get('/things/7', isThing)
    expect(result).toEqual({ ok: true, value: { id: 7 } })
    expect(fetchFunction).toHaveBeenCalledWith('https://api.test/things/7', expect.objectContaining({ method: 'GET' }))
  })

  it('posts a json body with the content type header', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(jsonResponse('{"id":101}', 201))
    const result = await clientWith(fetchFunction).post('/things', { name: 'x' }, isThing)
    expect(result).toEqual({ ok: true, value: { id: 101 } })
    const [, init] = fetchFunction.mock.calls[0]!
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe('{"name":"x"}')
    expect(init?.headers).toEqual({ 'Content-Type': 'application/json; charset=UTF-8' })
  })

  it('maps a non-2xx status to an http error with that status', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(jsonResponse('{}', 503))
    const result = await clientWith(fetchFunction).get('/things', isThing)
    expect(result).toEqual({ ok: false, error: { kind: 'http', status: 503 } })
  })

  it('maps a body that is not json to a parse error', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(jsonResponse('<html>'))
    const result = await clientWith(fetchFunction).get('/things', isThing)
    expect(result).toEqual({ ok: false, error: { kind: 'parse' } })
  })

  it('maps a body with the wrong shape to a parse error', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(jsonResponse('{"id":"seven"}'))
    const result = await clientWith(fetchFunction).get('/things', isThing)
    expect(result).toEqual({ ok: false, error: { kind: 'parse' } })
  })

  it('maps a rejected fetch to a network error', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockRejectedValue(new TypeError('Failed to fetch'))
    const result = await clientWith(fetchFunction).get('/things', isThing)
    expect(result).toEqual({ ok: false, error: { kind: 'network' } })
  })

  it('aborts and reports a timeout when the server does not answer in time', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('aborted', 'AbortError'))
          })
        }),
    )
    const pending = clientWith(fetchFunction, 50).get('/things', isThing)
    await vi.advanceTimersByTimeAsync(60)
    expect(await pending).toEqual({ ok: false, error: { kind: 'timeout' } })
  })

  it('reports aborted when the caller cancels the request', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('aborted', 'AbortError'))
          })
        }),
    )
    const controller = new AbortController()
    const pending = clientWith(fetchFunction).get('/things', isThing, { signal: controller.signal })
    controller.abort()
    expect(await pending).toEqual({ ok: false, error: { kind: 'aborted' } })
  })

  it('does not call fetch when the signal is already aborted', async () => {
    const fetchFunction = vi.fn<FetchFunction>()
    const controller = new AbortController()
    controller.abort()
    const result = await clientWith(fetchFunction).get('/things', isThing, { signal: controller.signal })
    expect(result).toEqual({ ok: false, error: { kind: 'aborted' } })
    expect(fetchFunction).not.toHaveBeenCalled()
  })

  it('strips a trailing slash from the base url', async () => {
    const fetchFunction = vi.fn<FetchFunction>().mockResolvedValue(jsonResponse('{"id":1}'))
    await new HttpClient({ baseUrl: 'https://api.test///', fetchFunction }).get('/a', isThing)
    expect(fetchFunction.mock.calls[0]![0]).toBe('https://api.test/a')
  })
})
