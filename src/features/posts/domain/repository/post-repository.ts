import type { Result } from '../../../../core/result'
import type { NewPost } from '../model/new-post'
import type { Post } from '../model/post'

export interface PostRepository {
  getByUser(userId: number, signal?: AbortSignal): Promise<Result<readonly Post[]>>
  create(post: NewPost, signal?: AbortSignal): Promise<Result<Post>>
}
