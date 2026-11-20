import type { User } from '../../domain/model/user'
import type { UserDto } from '../dto/user-dto'

export const toUser = (dto: UserDto): User => ({
  id: dto.id,
  name: dto.name,
  username: dto.username,
  email: dto.email,
  website: dto.website ?? '',
  company: dto.company?.name ?? '',
})
