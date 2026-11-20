export interface User {
  readonly id: number
  readonly name: string
  readonly username: string
  readonly email: string
  readonly website: string
  readonly company: string
}

export const initialsOf = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .filter((part) => /^[\p{L}]/u.test(part))
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
