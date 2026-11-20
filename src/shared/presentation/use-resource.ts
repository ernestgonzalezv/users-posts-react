import { useCallback, useEffect, useEffectEvent, useState } from 'react'
import type { AppError } from '../../core/app-error'
import type { Result } from '../../core/result'

export type ResourceState<T> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: T }
  | { readonly status: 'empty' }
  | { readonly status: 'error'; readonly error: AppError }

export type ResourceStatus = ResourceState<unknown>['status']

export type Loader<T> = (signal: AbortSignal) => Promise<Result<T>>

export interface Resource<T> {
  readonly state: ResourceState<T>
  readonly reload: () => void
}

interface Settled<T> {
  readonly load: Loader<T>
  readonly attempt: number
  readonly state: ResourceState<T>
}

const isEmptyValue = (value: unknown): boolean => Array.isArray(value) && value.length === 0

const settle = <T>(result: Result<T>, isEmpty: (value: T) => boolean): ResourceState<T> => {
  if (!result.ok) {
    return { status: 'error', error: result.error }
  }
  return isEmpty(result.value) ? { status: 'empty' } : { status: 'success', data: result.value }
}

export function useResource<T>(load: Loader<T> | null, isEmpty: (value: T) => boolean = isEmptyValue): Resource<T> {
  const [settled, setSettled] = useState<Settled<T> | null>(null)
  const [attempt, setAttempt] = useState(0)
  const settleWith = useEffectEvent((loader: Loader<T>, result: Result<T>) => {
    setSettled({ load: loader, attempt, state: settle(result, isEmpty) })
  })

  useEffect(() => {
    if (load === null) {
      return
    }
    const controller = new AbortController()
    void load(controller.signal).then((result) => {
      if (controller.signal.aborted) {
        return
      }
      settleWith(load, result)
    })
    return () => {
      controller.abort()
    }
  }, [load, attempt])

  const reload = useCallback(() => {
    setAttempt((current) => current + 1)
  }, [])

  const state: ResourceState<T> =
    load === null
      ? { status: 'idle' }
      : settled !== null && settled.load === load && settled.attempt === attempt
        ? settled.state
        : { status: 'loading' }

  return { state, reload }
}
