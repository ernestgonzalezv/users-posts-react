import type { en } from './en'
import type { Locale } from './locale'

export type MessageKey = keyof typeof en
export type Dictionary = Record<MessageKey, string>

type Placeholders<S extends string> = S extends `${string}{${infer Name}}${infer Rest}` ? Name | Placeholders<Rest> : never

export type MessageParams<K extends MessageKey> = Record<Placeholders<(typeof en)[K]>, string | number>

export type ParamsArgument<K extends MessageKey> = [Placeholders<(typeof en)[K]>] extends [never]
  ? []
  : [params: MessageParams<K>]

export type Translate = <K extends MessageKey>(key: K, ...args: ParamsArgument<K>) => string

export const PLACEHOLDER_PATTERN = /\{(\w+)\}/g

export const format = (template: string, params: Readonly<Record<string, string | number>> = {}): string =>
  template.replace(PLACEHOLDER_PATTERN, (match: string, name: string) => {
    const value = params[name]
    return value === undefined ? match : String(value)
  })

export const createTranslate =
  (dictionaries: Readonly<Record<Locale, Dictionary>>, locale: Locale): Translate =>
  (key, ...args) =>
    format(dictionaries[locale][key], args[0])

export type CountKey = 'users.count' | 'posts.count'

export const counted = (t: Translate, key: CountKey, count: number): string =>
  count === 1 ? t(`${key}.one`, { count }) : t(key, { count })
