import type { AppError } from './app-error'

export interface Success<T> {
  readonly ok: true
  readonly value: T
}

export interface Failure {
  readonly ok: false
  readonly error: AppError
}

export type Result<T> = Success<T> | Failure

export const success = <T>(value: T): Result<T> => ({ ok: true, value })
export const failure = (error: AppError): Failure => ({ ok: false, error })

export const isSuccess = <T>(result: Result<T>): result is Success<T> => result.ok
export const isFailure = <T>(result: Result<T>): result is Failure => !result.ok

export const mapResult = <T, U>(result: Result<T>, transform: (value: T) => U): Result<U> =>
  result.ok ? success(transform(result.value)) : result
