export type AppError =
  | { readonly kind: 'network' }
  | { readonly kind: 'timeout' }
  | { readonly kind: 'http'; readonly status: number }
  | { readonly kind: 'parse' }
  | { readonly kind: 'aborted' }
  | { readonly kind: 'validation'; readonly fields: Readonly<Record<string, string>> }

export type AppErrorKind = AppError['kind']

export const networkError = (): AppError => ({ kind: 'network' })
export const timeoutError = (): AppError => ({ kind: 'timeout' })
export const httpError = (status: number): AppError => ({ kind: 'http', status })
export const parseError = (): AppError => ({ kind: 'parse' })
export const abortedError = (): AppError => ({ kind: 'aborted' })
export const validationError = (fields: Readonly<Record<string, string>>): AppError => ({
  kind: 'validation',
  fields,
})
