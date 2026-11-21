import { stripControls } from '../../../../core/text'
import type { Post, PostSource } from '../../domain/model/post'
import type { PostDto } from '../dto/post-dto'

export const toPost = (dto: PostDto, source: PostSource = 'remote'): Post => ({
  id: dto.id,
  userId: dto.userId,
  title: stripControls(dto.title, false).trim(),
  body: stripControls(dto.body, true).trim(),
  source,
})
