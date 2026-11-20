import type { User } from '../model/user'

export const normalizeText = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')

const matches = (user: User, query: string): boolean =>
  normalizeText(user.name).includes(query) || normalizeText(user.username).includes(query)

export const searchUsers = (users: readonly User[], query: string): readonly User[] => {
  const normalized = normalizeText(query)
  return normalized === '' ? users : users.filter((user) => matches(user, normalized))
}
