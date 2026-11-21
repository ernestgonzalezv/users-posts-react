import { firstGrapheme } from '../../../../core/text'

export interface User {
  readonly id: number
  readonly name: string
  readonly username: string
  readonly email: string
  readonly website: string
  readonly company: string
}

export const initialsOf = (name: string): string => {
  const trimmed = name.trim()
  const letters = trimmed
    .split(/\s+/)
    .filter((part) => /^\p{L}/u.test(part))
    .slice(0, 2)
    .map((part) => firstGrapheme(part).toUpperCase())
    .join('')
  return letters === '' ? firstGrapheme(trimmed).toUpperCase() : letters
}
