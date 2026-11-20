import { en } from './en'
import { es } from './es'
import type { Locale } from './locale'
import type { Dictionary } from './translate'

export const dictionaries: Readonly<Record<Locale, Dictionary>> = { en, es }
