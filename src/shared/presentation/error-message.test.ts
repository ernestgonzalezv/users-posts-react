import { describe, expect, it } from 'vitest'
import { abortedError, httpError, networkError, parseError, timeoutError, validationError } from '../../core/app-error'
import { dictionaries } from '../../i18n/dictionaries'
import { createTranslate } from '../../i18n/translate'
import { errorMessage } from './error-message'

const t = createTranslate(dictionaries, 'en')
const tEs = createTranslate(dictionaries, 'es')

describe('errorMessage', () => {
  it('names every error kind in the active language', () => {
    expect(errorMessage(t, networkError())).toBe('No connection. Check your network and try again.')
    expect(errorMessage(t, timeoutError())).toBe('The server took too long to answer.')
    expect(errorMessage(t, httpError(404))).toBe('The server answered with an error (404).')
    expect(errorMessage(t, parseError())).toBe('The server sent something unexpected.')
    expect(errorMessage(t, abortedError())).toBe('The request was cancelled.')
    expect(errorMessage(t, validationError({ title: 'required' }))).toBe('Some fields need attention.')
    expect(errorMessage(tEs, httpError(500))).toBe('El servidor respondió con un error (500).')
  })
})
