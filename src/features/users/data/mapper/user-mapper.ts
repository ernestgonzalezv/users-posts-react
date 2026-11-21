import { stripControls } from '../../../../core/text'
import type { User } from '../../domain/model/user'
import type { UserDto } from '../dto/user-dto'

const clean = (text: string): string => stripControls(text, false).trim().replace(/\s+/g, ' ')

export const toUser = (dto: UserDto): User => {
  const username = clean(dto.username)
  const name = clean(dto.name)
  return {
    id: dto.id,
    name: name === '' ? (username === '' ? `#${String(dto.id)}` : username) : name,
    username,
    email: clean(dto.email),
    website: clean(dto.website ?? ''),
    company: clean(dto.company?.name ?? ''),
  }
}
