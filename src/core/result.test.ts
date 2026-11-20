import { describe, expect, it } from 'vitest'
import { httpError } from './app-error'
import { failure, isFailure, isSuccess, mapResult, success } from './result'

describe('Result', () => {
  it('wraps a value as a success', () => {
    const result = success(42)
    expect(isSuccess(result)).toBe(true)
    expect(isFailure(result)).toBe(false)
    expect(result.ok && result.value).toBe(42)
  })

  it('wraps an error as a failure', () => {
    const result = failure(httpError(404))
    expect(isFailure(result)).toBe(true)
    expect(result.ok).toBe(false)
    expect(result.error).toEqual({ kind: 'http', status: 404 })
  })

  it('maps the value of a success', () => {
    const result = mapResult(success(2), (n) => n * 3)
    expect(result).toEqual({ ok: true, value: 6 })
  })

  it('passes a failure through a map untouched', () => {
    const original = failure(httpError(500))
    const result = mapResult<number, string>(original, (n) => String(n))
    expect(result).toBe(original)
  })
})
