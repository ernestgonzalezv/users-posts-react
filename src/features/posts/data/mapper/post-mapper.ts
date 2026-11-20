import type { Post } from '../../domain/model/post'
import type { PostDto } from '../dto/post-dto'

export const toPost = (dto: PostDto): Post => ({
  id: dto.id,
  userId: dto.userId,
  title: dto.title.trim(),
  body: dto.body.trim(),
})
